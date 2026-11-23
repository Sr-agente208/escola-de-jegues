import base64
import json
import unittest
from email import message_from_bytes
from unittest.mock import patch
from backend import server

class Response:
    def __enter__(self): return self
    def __exit__(self, *args): pass
    def read(self, *args): return b'{"id":"test"}'

class EmailTests(unittest.TestCase):
    def test_first_access_explains_password_and_escapes_name(self):
        with patch.object(server, 'gmail_access_token', return_value='test'), patch('urllib.request.urlopen', return_value=Response()) as send:
            server.send_access_email('a@example.com', '<script>x</script>', 'https://example.test/approve', 'https://example.test/deny', True)
            req = send.call_args.args[0]
            payload = json.loads(req.data)
            msg = message_from_bytes(base64.urlsafe_b64decode(payload['raw'] + '=' * (-len(payload['raw']) % 4)))
            body = msg.get_payload()[0].get_payload(decode=True).decode('utf-8')
            self.assertIn('Primeiro acesso', body)
            self.assertNotIn('<script>', body)
            self.assertIn('&lt;script&gt;', body)

if __name__ == '__main__': unittest.main()
