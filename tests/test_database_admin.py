import os
import sys
import unittest
from contextlib import contextmanager
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
import database_admin as admin


class FakeCursor:
    def __init__(self, found=True):
        self.found = found
        self.queries = []
    def __enter__(self): return self
    def __exit__(self, *args): pass
    def execute(self, *args): self.queries.append(args)
    def fetchone(self): return {'id_nota': 1} if self.found else None

class FakeConnection:
    def __init__(self, found=True): self.cur = FakeCursor(found); self.committed = False
    def __enter__(self): return self
    def __exit__(self, *args): pass
    def cursor(self): return self.cur
    def commit(self): self.committed = True

class GradeTests(unittest.TestCase):
    def test_update_parameterized(self):
        db = FakeConnection()
        with patch.object(admin, 'connection', return_value=db):
            admin.update_grade(1, '8.50')
        self.assertTrue(db.committed)
        self.assertIn('%s', db.cur.queries[1][0])
        self.assertEqual(str(db.cur.queries[1][1][0]), '8.50')

    def test_invalid_grades_rejected_before_connecting(self):
        with patch.object(admin, 'connection') as connect:
            for value in ('NaN', '10.01', '-1', '8.123', True, 'abc'):
                with self.subTest(value=value), self.assertRaises(ValueError):
                    admin.update_grade(1, value)
            connect.assert_not_called()

    def test_missing_note(self):
        db = FakeConnection(False)
        with patch.object(admin, 'connection', return_value=db), self.assertRaises(LookupError):
            admin.update_grade(1, '8')
        self.assertFalse(db.committed)

if __name__ == '__main__': unittest.main()
