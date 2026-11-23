"""Acesso servidor-a-servidor à tabela de membros. Nunca enviar a chave ao navegador."""
import json
import urllib.error
import urllib.parse
import urllib.request


class MemberStoreError(Exception):
    pass


class MemberStore:
    def __init__(self, url, service_key):
        if not url.startswith('https://') or not url.endswith('.supabase.co') or not service_key:
            raise MemberStoreError('Configuração do banco de membros ausente ou inválida.')
        self.base = url.rstrip('/') + '/rest/v1/portal_membros'
        self.key = service_key

    def request(self, method, params=None, body=None):
        query = urllib.parse.urlencode(params or {})
        url = self.base + ('?' + query if query else '')
        headers = {'apikey': self.key, 'Authorization': 'Bearer ' + self.key,
                   'Content-Type': 'application/json', 'Prefer': 'return=representation'}
        request = urllib.request.Request(url, method=method, headers=headers,
                    data=json.dumps(body).encode() if body is not None else None)
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                return json.load(response)
        except (urllib.error.URLError, ValueError, OSError) as exc:
            raise MemberStoreError('Não foi possível acessar o banco de membros.') from exc

    def by_email(self, email):
        rows = self.request('GET', {'select': '*', 'email': 'eq.' + email, 'limit': '1'})
        return rows[0] if rows else None

    def by_id(self, member_id):
        rows = self.request('GET', {'select': '*', 'id': 'eq.' + member_id, 'limit': '1'})
        return rows[0] if rows else None

    def list(self):
        return self.request('GET', {'select': 'id,email,nome,cargo,status,criado_em', 'order': 'criado_em.desc', 'limit': '500'})

    def create(self, name, email, role):
        rows = self.request('POST', body={'nome': name, 'email': email, 'cargo': role, 'status': 'pendente'})
        return rows[0]

    def update(self, member_id, changes):
        rows = self.request('PATCH', {'id': 'eq.' + member_id}, changes)
        return rows[0] if rows else None

    def activate(self, member_id, password_hash, session_version):
        # A operação condicional impede reuso de pedidos antigos ou concorrentes.
        rows = self.request('PATCH', {'id': 'eq.' + member_id, 'status': 'eq.pendente', 'password_hash': 'is.null', 'session_version': 'eq.' + str(session_version)},
                            {'status': 'ativo', 'password_hash': password_hash})
        return rows[0] if rows else None
