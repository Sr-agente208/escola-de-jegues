"""Primitivas de segurança para o futuro cadastro de membros.

Este módulo ainda não está conectado às rotas do portal. Não confunda a
verificação de um cargo com autenticação: o chamador deve obter o membro por
uma sessão já autenticada e verificar seu estado atual no servidor.
"""
import base64
import hashlib
import hmac
import os
import re

ROLES = frozenset({'tecnico', 'diretoria', 'professor', 'aluno', 'responsavel'})
ADMIN_ROLES = frozenset({'tecnico', 'diretoria'})
PASSWORD_ITERATIONS = 600_000
MAX_PASSWORD_BYTES = 1024


def normalise_email(email):
    if not isinstance(email, str):
        raise ValueError('Informe um e-mail válido.')
    email = email.strip().lower()
    if len(email) > 254 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        raise ValueError('Informe um e-mail válido.')
    return email


def hash_password(password):
    if not isinstance(password, str) or len(password) < 12:
        raise ValueError('A senha precisa ter pelo menos 12 caracteres.')
    encoded = password.encode('utf-8')
    if len(encoded) > MAX_PASSWORD_BYTES:
        raise ValueError('Senha longa demais.')
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac('sha256', encoded, salt, PASSWORD_ITERATIONS)
    return 'pbkdf2_sha256${}${}${}'.format(
        PASSWORD_ITERATIONS,
        base64.urlsafe_b64encode(salt).decode(),
        base64.urlsafe_b64encode(digest).decode(),
    )


def verify_password(password, encoded_hash):
    try:
        if not isinstance(password, str) or len(password.encode('utf-8')) > MAX_PASSWORD_BYTES:
            return False
        algorithm, count, salt, expected = encoded_hash.split('$')
        count = int(count)
        if algorithm != 'pbkdf2_sha256' or not 600_000 <= count <= 2_000_000:
            return False
        salt = base64.b64decode(salt, altchars=b'-_', validate=True)
        expected = base64.b64decode(expected, altchars=b'-_', validate=True)
        if len(salt) != 16 or len(expected) != 32:
            return False
        actual = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, count)
        return hmac.compare_digest(actual, expected)
    except (TypeError, ValueError, AttributeError):
        return False


def can_manage_members(member):
    """Apenas cargos administrativos ativos; jamais aceitar dados do cliente."""
    return isinstance(member, dict) and member.get('status') == 'ativo' and member.get('cargo') in ADMIN_ROLES
