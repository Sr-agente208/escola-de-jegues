import unittest
from unittest.mock import patch
from backend import server

class RateLimitTests(unittest.TestCase):
    def setUp(self):
        server.LOGIN_ATTEMPTS.clear()

    def test_exact_time_and_blocked_attempt_does_not_extend(self):
        with patch.object(server.time, 'time', return_value=1000.0):
            for _ in range(10):
                self.assertEqual(server.reserve_login_attempt('user@example.com', '1.2.3.4'), 0)
        with patch.object(server.time, 'time', return_value=1125.0):
            self.assertEqual(server.reserve_login_attempt('user@example.com', '1.2.3.4'), 475)
            self.assertEqual(server.reserve_login_attempt('user@example.com', '1.2.3.4'), 475)
        with patch.object(server.time, 'time', return_value=1600.0):
            self.assertEqual(server.reserve_login_attempt('user@example.com', '1.2.3.4'), 0)

    def test_shared_address_limit_is_respected_without_spending_email_quota(self):
        with patch.object(server.time, 'time', return_value=1000.0):
            server.LOGIN_ATTEMPTS['ip:proxy'] = [1000.0] * 100
            self.assertEqual(server.reserve_login_attempt('user@example.com', 'proxy'), 600)
            self.assertEqual(server.LOGIN_ATTEMPTS['email:user@example.com'], [])

if __name__ == '__main__': unittest.main()
