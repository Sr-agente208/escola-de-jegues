import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest.mock import patch
from http.server import ThreadingHTTPServer
from backend import server


class FakeStore:
    def __init__(self):
        self.items = {'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': {'id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'nome': 'Admin', 'email': 'admin@example.com', 'cargo': 'tecnico', 'status': 'pendente', 'password_hash': None, 'session_version': 1}}
    def by_id(self, uid): return self.items.get(uid)
    def by_email(self, email): return next((x for x in self.items.values() if x['email'] == email), None)
    def list(self): return [{k:v for k,v in x.items() if k != 'password_hash'} for x in self.items.values()]
    def activate(self, uid, pwd, version):
        m = self.by_id(uid)
        if not m or m['status'] != 'pendente' or m['password_hash'] or m['session_version'] != version: return None
        m.update(status='ativo', password_hash=pwd); return m
    def create(self, name, email, role):
        uid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
        m = {'id': uid, 'nome': name, 'email': email, 'cargo': role, 'status': 'pendente', 'password_hash': None, 'session_version': 1}
        self.items[uid] = m; return m
    def update(self, uid, changes):
        self.items[uid].update(changes); return self.items[uid]


class FullFlowTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = FakeStore(); self.links = []
        self.patches = [patch.object(server, 'PENDING_PATH', Path(self.tmp.name) / 'pending.json'),
                        patch.object(server, 'MEMBERS_MODE', True),
                        patch.dict(server.ENV, {'PUBLIC_SITE_URL': 'https://portal.example'}),
                        patch.object(server, 'member_store', return_value=self.store),
                        patch.object(server, 'send_access_email', side_effect=lambda *args: self.links.append(args))]
        for p in self.patches: p.start()
        server.LOGIN_ATTEMPTS.clear()
        self.httpd = ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True); self.thread.start()
        self.base = 'http://127.0.0.1:' + str(self.httpd.server_port)
    def tearDown(self):
        self.httpd.shutdown(); self.httpd.server_close(); self.thread.join()
        for p in reversed(self.patches): p.stop()
        self.tmp.cleanup()
    def req(self, path, data=None, token=None):
        headers = {'Content-Type': 'application/json'}
        if token: headers['Authorization'] = 'Bearer ' + token
        r = urllib.request.Request(self.base + path, headers=headers, data=json.dumps(data).encode() if data is not None else None)
        try:
            with urllib.request.urlopen(r, timeout=5) as res: return res.status, json.load(res)
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read())
    def activate_admin(self):
        code, result = self.req('/auth/request-access', {'email':'admin@example.com','password':'senha-segura-de-teste'})
        self.assertEqual(code, 202); poll = result['pollToken']
        self.assertEqual(self.req('/auth/claim', {'token':poll})[0], 403)
        self.assertEqual(self.req('/auth/access/'+poll+'/approve', {})[0], 403)
        auth = self.links[-1][2].split('autorizar=')[1]
        self.assertEqual(self.req('/auth/access/'+auth+'/approve', {})[0], 200)
        self.assertEqual(self.req('/auth/claim', {'token':auth})[0], 410)
        code, session = self.req('/auth/claim', {'token':poll})
        self.assertEqual(code, 200)
        self.assertEqual(self.req('/auth/claim', {'token':poll})[0], 410)
        return session['token']
    def test_admin_activation_and_enforced_roles(self):
        token = self.activate_admin()
        self.assertEqual(self.req('/api/members', token=token)[0], 200)
        code, visitor = self.req('/auth/visitor', {})
        self.assertEqual(code, 200)
        self.assertEqual(self.req('/api/members', token=visitor['token'])[0], 403)
        old = server.make_session('u-tecnico2', 'tecnico')
        self.assertEqual(self.req('/api/members', token=old)[0], 403)
        code, member = self.req('/api/members', {'name':'Diretora','email':'diretora@example.com','role':'diretoria'}, token)
        self.assertEqual(code, 201); self.assertEqual(member['member']['status'], 'pendente')
        self.assertNotIn('password_hash', member['member'])
        self.store.items['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']['status'] = 'bloqueado'
        self.assertEqual(self.req('/api/members', token=token)[0], 403)
        self.assertEqual(self.req('/auth/me', token=token)[0], 401)
    def test_reset_revokes_existing_sessions_and_old_pending_requests(self):
        token = self.activate_admin()
        self.assertEqual(self.req('/auth/me', token=token)[0], 200)
        code, result = self.req('/auth/request-access', {'email':'admin@example.com','password':'senha-segura-de-teste'})
        self.assertEqual(code, 202)
        poll = result['pollToken']
        auth = self.links[-1][2].split('autorizar=')[1]
        self.assertEqual(self.req('/auth/access/'+auth+'/approve', {})[0], 200)
        member = self.store.items['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']
        member.update(status='pendente', password_hash=None, session_version=2)
        self.assertEqual(self.req('/auth/me', token=token)[0], 401)
        self.assertEqual(self.req('/auth/claim', {'token':poll})[0], 403)
        new_token = self.activate_admin()
        self.assertEqual(self.req('/auth/me', token=new_token)[0], 200)
        self.assertEqual(self.req('/auth/me', token=token)[0], 401)
        old_token = server.make_session('member:'+member['id'], 'tecnico')
        self.assertEqual(self.req('/auth/me', token=old_token)[0], 401)

    def test_incorrect_password_and_short_initial_password(self):
        self.assertEqual(self.req('/auth/request-access', {'email':'admin@example.com','password':'curta'})[0], 400)
        self.activate_admin()
        self.assertEqual(self.req('/auth/request-access', {'email':'admin@example.com','password':'senha-incorreta-de-teste'})[0], 401)
        self.assertEqual(self.req('/auth/request-access', {'email':'unknown@example.com','password':'senha-incorreta-de-teste'})[0], 401)


if __name__ == '__main__': unittest.main()
