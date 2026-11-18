#!/usr/bin/env python3
# ============================================================
# ESCOLA DE JEGUES — SERVIDOR (demonstração funcional)
# Serve o site estático (pasta acima) + API de autenticação
# com e-mail de autorização via Gmail API (stdlib apenas).
#
# Rodar:  python3 backend/server.py
# Porta:  3001 (ou variável PORT)
# ============================================================
import json, os, re, hmac, hashlib, base64, secrets, time, urllib.request, urllib.parse, mimetypes
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # pasta do site
ENV_PATH = Path(__file__).resolve().parent / '.env'
PENDING_PATH = Path(__file__).resolve().parent / 'pending.json'

# ---------- .env ----------
def load_env():
    env = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()
    return env

ENV = load_env()
PORT = int(os.environ.get('PORT', ENV.get('PORT', '3001')))
JWT_SECRET = ENV.get('JWT_SECRET') or secrets.token_hex(32)
GMAIL_SENDER = ENV.get('GMAIL_SENDER', 'sr.agente208@gmail.com')
TOKEN_TTL_SECONDS = 10 * 60  # link vale 10 minutos

# ---------- "Banco" de demonstração (usuários) ----------
# Senhas em SHA-256 APENAS para demonstração (em produção use bcrypt).
def sha256(s): return hashlib.sha256(s.encode()).hexdigest()
USERS = [
    {'id': 'u-tecnico', 'name': 'Sr. Age',        'email': 'sr.age@gmail.com',     'passwordHash': sha256('123456789'),    'role': 'tecnico',     'title': 'Técnico de TI'},
    {'id': 'u-tecnico2', 'name': 'Sr. Agente208', 'email': 'sr.agente208@gmail.com', 'passwordHash': sha256('Nicole@208'),  'role': 'tecnico',     'title': 'Técnico de TI'},
    {'id': 'u-prof1',   'name': 'Ana Souza',      'email': 'professor@escola.com', 'passwordHash': sha256('professor123'), 'role': 'professor',   'teacherId': 't1'},
    {'id': 'u-prof2',   'name': 'Bruno Lima',     'email': 'bruno@escola.com',     'passwordHash': sha256('professor123'), 'role': 'professor',   'teacherId': 't2'},
    {'id': 'u-prof3',   'name': 'Carla Dias',     'email': 'carla@escola.com',     'passwordHash': sha256('professor123'), 'role': 'professor',   'teacherId': 't3'},
    {'id': 'u-prof4',   'name': 'Diego Ramos',    'email': 'diego@escola.com',     'passwordHash': sha256('professor123'), 'role': 'professor',   'teacherId': 't4'},
    {'id': 'u-prof5',   'name': 'Elisa Prado',    'email': 'elisa@escola.com',     'passwordHash': sha256('professor123'), 'role': 'professor',   'teacherId': 't5'},
    {'id': 'u-prof6',   'name': 'Felipe Costa',   'email': 'felipe@escola.com',    'passwordHash': sha256('professor123'), 'role': 'professor',   'teacherId': 't6'},
    {'id': 'u-aluno1',  'name': 'Lucas Oliveira', 'email': 'aluno@escola.com',     'passwordHash': sha256('aluno123'),     'role': 'aluno',       'studentId': 's1'},
    {'id': 'u-pai1',    'name': 'Mariana Oliveira','email': 'pai@escola.com',      'passwordHash': sha256('pai123'),       'role': 'responsavel', 'studentIds': ['s1']},
    {'id': 'u-visitante', 'name': 'Visitante',     'email': 'visitante@escola.local', 'passwordHash': sha256('visitante-sem-senha'), 'role': 'visitante', 'title': 'Visitante'},
]

def public_user(u):
    d = {k: v for k, v in u.items() if k != 'passwordHash'}
    return d

# ---------- Pedidos de acesso (persistidos em arquivo) ----------
def load_pending():
    try:
        data = json.loads(PENDING_PATH.read_text()) if PENDING_PATH.exists() else {}
    except Exception:
        data = {}
    now = time.time() * 1000
    return {k: v for k, v in data.items() if v['expiresAt'] > now}

def save_pending(data):
    PENDING_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2))

# ---------- Sessões (token HMAC assinado, 8h) ----------
def b64url(b): return base64.urlsafe_b64encode(b).rstrip(b'=').decode()
def b64url_dec(s): return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))

def make_session(user_id, role):
    payload = {'userId': user_id, 'role': role, 'exp': int(time.time()) + 8 * 3600}
    body = b64url(json.dumps(payload).encode())
    sig = b64url(hmac.new(JWT_SECRET.encode(), body.encode(), hashlib.sha256).digest())
    return f'{body}.{sig}'

def read_session(token):
    try:
        body, sig = token.split('.', 1)
        expect = b64url(hmac.new(JWT_SECRET.encode(), body.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expect): return None
        payload = json.loads(b64url_dec(body))
        if payload['exp'] < time.time(): return None
        return payload
    except Exception:
        return None

# ---------- Gmail API ----------
def gmail_access_token():
    data = urllib.parse.urlencode({
        'client_id': ENV['GOOGLE_CLIENT_ID'],
        'client_secret': ENV['GOOGLE_CLIENT_SECRET'],
        'refresh_token': ENV['GMAIL_REFRESH_TOKEN'],
        'grant_type': 'refresh_token',
    }).encode()
    resp = json.load(urllib.request.urlopen(urllib.request.Request(
        'https://oauth2.googleapis.com/token', data=data), timeout=20))
    return resp['access_token']

def send_access_email(to_email, to_name, approve_link, deny_link):
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    access = gmail_access_token()
    msg = MIMEMultipart('alternative')
    msg['Subject'] = '🔐 Autorizar entrada no portal da Escola de Jegues'
    msg['From'] = f'Escola de Jegues <{GMAIL_SENDER}>'
    msg['To'] = to_email
    first_name = to_name.split()[0]
    html = f"""<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;border:1px solid #e5e7eb;border-radius:14px;background:#ffffff">
  <div style="text-align:center;font-size:42px">🏫</div>
  <h2 style="color:#1e4fa3;text-align:center;margin:8px 0 18px">Escola de Jegues</h2>
  <p>Olá, <strong>{first_name}</strong>!</p>
  <p>Alguém tentou entrar no portal da escola com a sua conta. Se foi você, clique no botão abaixo para autorizar a entrada:</p>
  <p style="text-align:center;margin:26px 0">
    <a href="{approve_link}" style="background:#1e9e62;color:#fff;padding:14px 30px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">✅ Sim, autorizar entrada</a>
  </p>
  <p style="font-size:13px;color:#555">Se não foi você, clique aqui: <a href="{deny_link}">❌ Não fui eu</a> e avise o técnico de TI.</p>
  <p style="font-size:12px;color:#999;border-top:1px solid #eee;padding-top:12px">Este link expira em 10 minutos e só pode ser usado uma vez. Se você não tentou entrar, ignore este e-mail.</p>
</div>"""
    msg.attach(MIMEText(html, 'html', 'utf-8'))
    raw = b64url(msg.as_bytes())
    req = urllib.request.Request(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        data=json.dumps({'raw': raw}).encode(),
        headers={'Authorization': f'Bearer {access}', 'Content-Type': 'application/json'},
        method='POST')
    return json.load(urllib.request.urlopen(req, timeout=30))

# ---------- HTTP handler ----------
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    # ----- CORS -----
    def cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def end_headers(self):
        self.cors_headers()
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    # ----- helpers -----
    def json_response(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get('Content-Length', '0'))
        if length <= 0: return {}
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return {}

    def base_url(self):
        proto = self.headers.get('X-Forwarded-Proto', 'https')
        host = self.headers.get('X-Forwarded-Host') or self.headers.get('Host', f'localhost:{PORT}')
        return f'{proto}://{host}'

    # ----- rotas da API -----
    def do_POST(self):
        path = self.path.split('?')[0].rstrip('/') or '/'

        if path == '/auth/request-access':
            body = self.read_json()
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            user = next((u for u in USERS if u['email'].lower() == email), None)
            if not user or not hmac.compare_digest(user['passwordHash'], sha256(password)):
                return self.json_response(401, {'message': 'E-mail ou senha incorretos.'})

            authorize_token = secrets.token_urlsafe(32)
            poll_token = secrets.token_urlsafe(32)
            pending = load_pending()
            # remove pedidos anteriores do mesmo usuário
            pending = {k: v for k, v in pending.items() if v['userId'] != user['id']}
            pending[authorize_token] = {
                'authorizeToken': authorize_token,
                'pollToken': poll_token,
                'userId': user['id'], 'email': user['email'], 'name': user['name'],
                'expiresAt': int((time.time() + TOKEN_TTL_SECONDS) * 1000),
                'approved': False, 'denied': False, 'used': False,
            }
            try:
                link = f'{self.base_url()}/?autorizar={authorize_token}'
                deny_link = f'{self.base_url()}/?autorizar={authorize_token}&recusar=1'
                send_access_email(user['email'], user['name'], link, deny_link)
            except Exception as e:
                save_pending({k: v for k, v in pending.items() if v['authorizeToken'] != authorize_token})
                return self.json_response(500, {'message': f'Não foi possível enviar o e-mail: {e}'})
            save_pending(pending)
            return self.json_response(202, {'email': user['email'], 'name': user['name'],
                                            'pollToken': poll_token,
                                            'expiresInMinutes': TOKEN_TTL_SECONDS // 60})

        m = re.match(r'^/auth/access/([^/]+)/(approve|deny)$', path)
        if m:
            token, action = m.groups()
            pending = load_pending()
            rec = next((v for v in pending.values()
                        if v['authorizeToken'] == token or v['pollToken'] == token), None)
            if not rec:
                return self.json_response(410, {'message': 'Link inválido ou expirado.'})
            if action == 'approve':
                if rec['authorizeToken'] != token:
                    return self.json_response(403, {'message': 'Este link só consulta o status. Use o link do e-mail para autorizar.'})
                rec['approved'] = True
            else:
                rec['denied'] = True
            save_pending(pending)
            return self.json_response(200, {'ok': True})

        if path == '/auth/visitor':
            # Entrada de VISITANTE (sem senha): cria sessão só-visualização
            user = next((u for u in USERS if u['id'] == 'u-visitante'), None)
            return self.json_response(200, {'token': make_session(user['id'], user['role']),
                                            'user': public_user(user)})

        if path == '/auth/claim':
            body = self.read_json()
            token = body.get('token') or ''
            pending = load_pending()
            # claim só é permitido pelo token da ABA DE LOGIN (pollToken) —
            # o link do e-mail (authorizeToken) não abre sessão, só autoriza
            key = next((k for k, v in pending.items() if v['pollToken'] == token), None)
            if not key:
                return self.json_response(410, {'message': 'Link inválido ou expirado.'})
            rec = pending[key]
            if rec['denied']:
                return self.json_response(403, {'message': 'Entrada recusada no e-mail.'})
            if not rec['approved']:
                return self.json_response(403, {'message': 'Ainda não autorizado. Clique em "Sim" no e-mail.'})
            if rec['used']:
                return self.json_response(410, {'message': 'Este link já foi utilizado.'})
            rec['used'] = True
            save_pending(pending)
            user = next((u for u in USERS if u['id'] == rec['userId']), None)
            return self.json_response(200, {'token': make_session(user['id'], user['role']),
                                            'user': public_user(user)})

        return self.json_response(404, {'message': 'Rota não encontrada.'})

    def do_GET(self):
        path = self.path.split('?')[0].rstrip('/') or '/'

        m = re.match(r'^/auth/access/([^/]+)$', path)
        if m:
            token = m.group(1)
            pending = load_pending()
            rec = next((v for v in pending.values()
                        if v['pollToken'] == token or v['authorizeToken'] == token), None)
            if not rec:
                return self.json_response(200, {'status': 'expirado'})
            if rec['denied']:
                return self.json_response(200, {'status': 'rejeitado'})
            if rec['approved']:
                return self.json_response(200, {'status': 'aprovado'})
            return self.json_response(200, {'status': 'pendente'})

        if path == '/auth/me':
            auth = self.headers.get('Authorization', '')
            token = auth[7:] if auth.startswith('Bearer ') else ''
            payload = read_session(token)
            if not payload:
                return self.json_response(401, {'message': 'Sessão inválida ou expirada.'})
            user = next((u for u in USERS if u['id'] == payload['userId']), None)
            if not user:
                return self.json_response(401, {'message': 'Usuário não encontrado.'})
            return self.json_response(200, {'user': public_user(user)})

        if path == '/api/health':
            return self.json_response(200, {'ok': True, 'service': 'escola-de-jegues', 'gmail': bool(ENV.get('GMAIL_REFRESH_TOKEN'))})

        # arquivos estáticos (com tratamento de path traversal do http.server)
        super().do_GET()

    def log_message(self, fmt, *args):
        pass  # silencioso

if __name__ == '__main__':
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')
    print(f'🏫 Escola de Jegues — servidor em http://0.0.0.0:{PORT}')
    ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
