import unittest
from backend.member_security import can_manage_members, hash_password, normalise_email, verify_password


class MemberSecurityTests(unittest.TestCase):
    def test_password_hash_uses_salt_and_verifies(self):
        password = 'uma-senha-forte-de-teste'
        first = hash_password(password)
        second = hash_password(password)
        self.assertNotEqual(first, second)
        self.assertNotIn(password, first)
        self.assertTrue(verify_password(password, first))
        self.assertFalse(verify_password('outra-senha-incorreta', first))

    def test_invalid_hash_and_weak_password(self):
        with self.assertRaises(ValueError):
            hash_password('curta')
        for bad in ['', None, 'pbkdf2_sha256$1$abc$abc', 'invalid$hash']:
            self.assertFalse(verify_password('senha-de-teste-qualquer', bad))

    def test_admin_requires_active_status_and_role(self):
        for role in ('tecnico', 'diretoria'):
            self.assertTrue(can_manage_members({'cargo': role, 'status': 'ativo'}))
            self.assertFalse(can_manage_members({'cargo': role, 'status': 'pendente'}))
            self.assertFalse(can_manage_members({'cargo': role, 'status': 'bloqueado'}))
        for role in ('visitante', 'professor', 'aluno', 'responsavel', 'outro'):
            self.assertFalse(can_manage_members({'cargo': role, 'status': 'ativo'}))
        self.assertFalse(can_manage_members(None))

    def test_email_normalization(self):
        self.assertEqual(normalise_email('  PESSOA@Exemplo.com '), 'pessoa@exemplo.com')
        for invalid in ('sem-arroba', '@exemplo.com', 'nome@', 'nome @exemplo.com', None):
            with self.assertRaises(ValueError):
                normalise_email(invalid)


if __name__ == '__main__':
    unittest.main()
