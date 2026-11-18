# 🔌 Back-end — Passo a passo para conectar (básico → avançado)

Este guia explica como colocar o back-end no ar com **envio real de e-mail via Gmail API**.
Feito para o desenvolvedor que vai implementar o servidor. O front-end já está pronto — só precisa que o servidor exista.

---

## Visão geral do fluxo

```
Aluno/Professor digita e-mail + senha no site
        ↓
POST /auth/request-access  ──► servidor valida no banco
        ↓                      gera token aleatório (expira em 10 min)
        ↓                      salva token + userId no banco
        ↓                      ENVIA E-MAIL via Gmail API
        ↓                      com o link:  https://seusite.com/?autorizar=TOKEN
[ tela "Verifique seu e-mail" + botões "Sim" / "Não fui eu" ]
        ↓
Usuário clica "Sim, autorizar entrada" no Gmail
        ↓
GET https://seusite.com/?autorizar=TOKEN  ──► front-end chama:
POST /auth/access/:token/approve            ──► servidor marca token como aprovado
POST /auth/claim { token }                  ──► servidor valida (aprovado? expirou? já usado?)
        ↓                                       apaga o token (uso único)
        ↓                                       devolve { tokenJWT, user }
[ usuário entra no portal ]
```

**Regras de segurança essenciais:**
- ❌ Nunca coloque `client_secret` nem `refresh_token` no front-end.
- ❌ Senhas nunca em texto puro — use **bcrypt**.
- ✅ Token de acesso: aleatório forte (32+ bytes), **expira em 10 min**, **uso único**.
- ✅ Sessão (JWT) separada com validade (ex.: 8h) e guardada no `localStorage` do site.
- ✅ Tudo via HTTPS em produção.

---

## Parte 1 — Preparar o Gmail API (uma vez só)

> Objetivo: seu servidor precisa de **autorização permanente** para enviar e-mails "em nome de" um e-mail da escola (ex.: `secretaria@escola.com.br` ou `sr.age@gmail.com`).

### Passo 1 — Criar o projeto
1. Acesse https://console.cloud.google.com/ com a conta Google da escola.
2. Crie um projeto novo: **“Portal Escola”**.

### Passo 2 — Ativar a Gmail API
1. No menu: **APIs e serviços → Biblioteca**.
2. Procure **Gmail API** → clique **Ativar**.

### Passo 3 — Tela de consentimento OAuth
1. **APIs e serviços → Tela de consentimento OAuth**.
2. Tipo: **Externo** (ou Interno, se for Google Workspace da escola).
3. Preencha: nome do app (“Portal Escola”), e-mail de suporte, e-mail do desenvolvedor.
4. Em **Escopos**, adicione:
   - `https://www.googleapis.com/auth/gmail.send`  *(enviar e-mail — é o único necessário)*
5. Em **Usuários de teste**, adicione os e-mails que poderão receber/enviar durante os testes
   (enquanto o app não for verificado, só usuários de teste recebem o consentimento).

### Passo 4 — Criar as credenciais OAuth
1. **APIs e serviços → Credenciais → Criar credenciais → IDs do cliente OAuth**.
2. Tipo de aplicativo: **Aplicativo da Web**.
3. Em “URIs de redirecionamento autorizados”, adicione:
   - `http://localhost:3000/oauth/callback`
   - (produção) `https://api.suaescola.com.br/oauth/callback`
4. **Copie o Client ID e o Client Secret** e guarde no `.env` do servidor:
   ```env
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxx
   GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
   ```

### Passo 5 — Gerar o Refresh Token (a "chave permanente" de envio)
A forma mais fácil é o **OAuth 2.0 Playground**:

1. Acesse https://developers.google.com/oauthplayground
2. Engrenagem (⚙️) no canto superior direito → marque **“Use your own OAuth credentials”** → cole o **Client ID** e o **Client Secret**.
3. Na caixa "Input your own scopes" na parte de baixo, digite:
   ```
   https://www.googleapis.com/auth/gmail.send
   ```
   → clique **Authorize APIs**.
4. Faça login com o e-mail **da escola** (o remetente) e autorize.
5. Clique em **“Exchange authorization code for tokens”**.
6. Copie o **Refresh Token** que aparece → salve no `.env`:
   ```env
   GMAIL_REFRESH_TOKEN=1//xxxx
   GMAIL_SENDER=sr.age@gmail.com
   ```

> Com `client_id` + `client_secret` + `refresh_token`, o servidor consegue gerar tokens de acesso novos para sempre, sem novo login.

### Passo 6 — Variáveis de ambiente (`.env`) — NUNCA commitar!
```env
PORT=3000
JWT_SECRET=coloque-uma-frase-grande-e-aleatoria-aqui
GMAIL_SENDER=sr.age@gmail.com
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
GMAIL_REFRESH_TOKEN=1//xxxx
```

---

## Parte 2 — O servidor (exemplo Node + Express)

> Qualquer linguagem serve (Python/Flask, PHP/Laravel…). A lógica é idêntica.

```bash
npm init -y
npm install express cors bcrypt jsonwebtoken googleapis dotenv crypto
```

Estrutura de dados (tabelas/coleções):
```js
users         { email, passwordHash(bcrypt), role: 'tecnico'|'professor'|'aluno'|'responsavel',
                name, teacherId?, studentId?, studentIds? }
access_tokens { token, userId, expiresAt, approved: false, denied: false, used: false }
teachers      { ... }   students { ... }   grades { ... }   hours { ... }   classes { ... }
```

### Envio de e-mail com a Gmail API
```js
const { google } = require('googleapis');

function gmailClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth: oauth2 });
}

function buildEmail({ to, subject, html }) {
  const msg = [
    `From: Escola Horizonte <${process.env.GMAIL_SENDER}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    '',
    html,
  ].join('\r\n');
  return Buffer.from(msg).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendAccessEmail({ to, name, link }) {
  const gmail = gmailClient();
  const html = `
    <h2>🔐 Autorizar entrada — Escola Horizonte</h2>
    <p>Olá, <strong>${name}</strong>! Alguém tentou entrar no portal com a sua conta.</p>
    <p>Foi você? Clique no botão abaixo para autorizar:</p>
    <p><a href="${link}" style="background:#1e4fa3;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">✅ Sim, autorizar entrada</a></p>
    <p>Se não foi você, ignore este e-mail e avise o técnico de TI. Este link expira em 10 minutos.</p>`;
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: buildEmail({ to, subject: '🔐 Autorizar entrada no portal', html }) },
  });
}
```

### Rotas (exatamente as que o front-end espera)
```js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1) PEDIDO DE ACESSO — valida senha, gera token, envia o e-mail
app.post('/auth/request-access', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.users.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: 'E-mail ou senha incorretos.' });

  // professor demitido não entra
  if (user.role === 'professor') {
    const t = await db.teachers.findById(user.teacherId);
    if (t?.status === 'demitido') return res.status(403).json({ message: 'Usuário desligado.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  await db.accessTokens.insert({
    token, userId: user._id, approved: false, denied: false, used: false,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const link = `${process.env.FRONTEND_URL}/?autorizar=${token}`;
  await sendAccessEmail({ to: user.email, name: user.name, link });
  res.status(202).json({ email: user.email, expiresInMinutes: 10 });
});

// 2) STATUS (a tela de "aguarde" do site pergunta isso a cada 2s)
app.get('/auth/access/:token', async (req, res) => {
  const t = await db.accessTokens.findByToken(req.params.token);
  if (!t || t.expiresAt < new Date()) return res.json({ status: 'expirado' });
  if (t.denied)   return res.json({ status: 'rejeitado' });
  if (t.approved) return res.json({ status: 'aprovado' });
  res.json({ status: 'pendente' });
});

// 3) SIM (link do e-mail) / NÃO FUI EU
app.post('/auth/access/:token/approve', async (req, res) => {
  const t = await db.accessTokens.findByToken(req.params.token);
  if (!t || t.expiresAt < new Date()) return res.status(410).json({ message: 'Link expirado.' });
  await db.accessTokens.update(t._id, { approved: true });
  res.json({ ok: true });
});
app.post('/auth/access/:token/deny', async (req, res) => {
  const t = await db.accessTokens.findByToken(req.params.token);
  if (t) await db.accessTokens.update(t._id, { denied: true });
  res.json({ ok: true });
});

// 4) TROCA O TOKEN APROVADO POR UMA SESSÃO (JWT) — uso único
app.post('/auth/claim', async (req, res) => {
  const t = await db.accessTokens.findByToken(req.body.token);
  if (!t || t.expiresAt < new Date()) return res.status(410).json({ message: 'Link expirado.' });
  if (!t.approved) return res.status(403).json({ message: 'Ainda não autorizado.' });
  if (t.used)      return res.status(410).json({ message: 'Link já utilizado.' });

  await db.accessTokens.update(t._id, { used: true });
  const user = await db.users.findById(t.userId);
  const tokenJWT = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token: tokenJWT, user: { id: user._id, name: user.name, email: user.email, role: user.role,
                                       teacherId: user.teacherId, studentId: user.studentId, studentIds: user.studentIds } });
});
```

> JWT: proteja as rotas de dados com um middleware que valida `Authorization: Bearer <jwt>` e os papéis (`tecnico`, `professor`, `aluno`, `responsavel`). Regras de permissão podem espelhar `js/app.js`.

Rotas de dados restantes: mesmo formato dos exemplos comentados em `js/api.js` (`/teachers`, `/students`, `/grades`, `/hours`, `/classes`).

---

## Parte 3 — Apontar o site para o servidor

Em `js/config.js`:
```js
apiBaseUrl: 'https://api.suaescola.com.br',   // ou http://localhost:3000 em desenvolvimento
useMockApi: false,
mailProvider: 'backend',
```

Em `js/api.js`, troque o corpo de cada função pelos `fetch()` já comentados em cada método, incluindo:
```js
async requestAccess(email, password) {
  const res = await fetch(`${CONFIG.apiBaseUrl}/auth/request-access`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Erro no login.'); }
  return res.json(); // { email, expiresInMinutes }
},
async checkAccess(token) {
  const res = await fetch(`${CONFIG.apiBaseUrl}/auth/access/${token}`);
  const d = await res.json(); return d.status;
},
async approveAccess(token) {
  await fetch(`${CONFIG.apiBaseUrl}/auth/access/${token}/approve`, { method: 'POST' });
  return { approved: true };
},
async denyAccess(token) {
  await fetch(`${CONFIG.apiBaseUrl}/auth/access/${token}/deny`, { method: 'POST' });
},
async claimSession(token) {
  const res = await fetch(`${CONFIG.apiBaseUrl}/auth/claim`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
  });
  const d = await res.json();
  localStorage.setItem('token', d.token);
  return d.user;
},
```

E limpe `js/data.js` (seed mock) — o servidor passa a ser a fonte dos dados.

---

## Parte 4 — Deploy (colocar no ar)

Qualquer destas plataformas roda Node grátis/barato:
**Render, Railway, Fly.io, Google Cloud Run, ou uma VPS com Nginx (HTTPS obrigatório).**

Checklist final:
- [ ] HTTPS ativo (cadeado verde) — obrigatório para tokens e senhas.
- [ ] `.env` fora do Git (`.gitignore`).
- [ ] Senhas com bcrypt no seed/migração.
- [ ] CORS liberado **somente** para o domínio do site.
- [ ] `access_tokens` expirados apagados por um cron ou índice TTL.
- [ ] E-mail de teste entre na caixa de entrada (confira spam na 1ª vez).
- [ ] Se o app OAuth ficar em modo "teste", os usuários de teste precisam estar cadastrados no Google Cloud; para uso aberto da escola, publique o app (revisão do Google) ou use Google Workspace com escopos internos.

---

## Perguntas frequentes

**“O e-mail cai no spam?”** Configure SPF/DKIM do domínio remetente ou envie de um Gmail real (é o que este guia faz).

**“Posso usar outro serviço de e-mail no lugar do Gmail API?”** Sim — troque só a função `sendAccessEmail()`. SendGrid, Resend, Amazon SES, ou um SMTP comum. O resto do servidor não muda.

**“E o senha ‘123456789’ do técnico?”** É só para demonstração. Em produção, troque imediatamente.

**“O site funciona offline?”** Não. Com back-end, o site precisa que o servidor esteja no ar.
