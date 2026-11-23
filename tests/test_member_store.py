import io
import json
import unittest
from unittest.mock import patch
from backend.member_store import MemberStore, MemberStoreError


class FakeResponse:
    def __init__(self, data):
        self.data = io.BytesIO(json.dumps(data).encode())
    def __enter__(self):
        return self.data
    def __exit__(self, *_):
        self.data.close()


class StoreTests(unittest.TestCase):
    def test_requires_supabase_server_key_and_https(self):
        for url, key in [('http://project.supabase.co', 'key'), ('https://evil.test', 'key'), ('https://project.supabase.co', '')]:
            with self.assertRaises(MemberStoreError):
                MemberStore(url, key)

    def test_find_member_sends_server_key_only_to_supabase(self):
        store = MemberStore('https://project.supabase.co', 'test-key')
        with patch('urllib.request.urlopen', return_value=FakeResponse([{'id': 'one'}])) as send:
            self.assertEqual(store.by_email('person@example.com'), {'id': 'one'})
            req = send.call_args.args[0]
            self.assertTrue(req.full_url.startswith('https://project.supabase.co/rest/v1/portal_membros?'))
            self.assertEqual(req.get_header('Apikey'), 'test-key')

    def test_activate_is_conditional_and_hash_is_not_plain_password(self):
        store = MemberStore('https://project.supabase.co', 'test-key')
        with patch('urllib.request.urlopen', return_value=FakeResponse([])) as send:
            self.assertIsNone(store.activate('member-id', 'some-hash'))
            req = send.call_args.args[0]
            self.assertIn('status=eq.pendente', req.full_url)
            self.assertIn('password_hash=is.null', req.full_url)
            self.assertEqual(req.get_method(), 'PATCH')
            self.assertEqual(json.loads(req.data), {'status': 'ativo', 'password_hash': 'some-hash'})


if __name__ == '__main__':
    unittest.main()
