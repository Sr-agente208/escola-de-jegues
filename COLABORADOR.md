# 🤝 Guia do colaborador — Escola de Jegues

Bem-vindo(a)! Este repositório é o site da escola: um front-end estático (HTML/CSS/JS)
servido por um pequeno backend em Python (sem dependências externas).

- **Site no ar:** https://escola-de-jegues.onrender.com
- **Repositório:** https://github.com/Sr-agente208/escola-de-jegues

---

## 1. Como pegar o código

```bash
git clone https://github.com/Sr-agente208/escola-de-jegues.git
cd escola-de-jegues
```

## 2. Como rodar na sua máquina

Só precisa de **Python 3.10+** (nada para instalar):

```bash
python3 backend/server.py
# abre em http://localhost:8000
```

O servidor também entrega os arquivos estáticos, então não precisa de outro servidor.

### Variáveis de ambiente (opcional, só para testar envio de e-mail)

Crie um arquivo `backend/.env` (ele é ignorado pelo Git — **nunca** comite):

```
GMAIL_SENDER=seu-email@gmail.com
GMAIL_REFRESH_TOKEN=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=qualquer-texto-aleatorio
```

Sem essas variáveis o site funciona normalmente; apenas o envio de e-mail de
autorização fica indisponível (`/api/health` mostra `gmail: false`).
O servidor lê primeiro as variáveis de ambiente reais e depois o `.env`.

## 3. Estrutura

```
index.html          página única do app
css/style.css       estilos (inclui login, modo visitante, painel)
js/config.js        dados da escola (schoolInfo) e configuração da API
js/api.js           camada de acesso ao backend (com fallback para demo)
js/data.js          dados de demonstração (professores, turmas, alunos...)
js/app.js           toda a lógica de telas e navegação
backend/server.py   API + servidor dos arquivos estáticos
render.yaml         configuração do deploy (Blueprint)
requirements.txt    (apenas stdlib — nenhuma dependência)
```

## 4. Papéis de acesso

| Papel | O que vê |
| --- | --- |
| `visitante` | Dashboard público, Professores (sem telefone/e-mail) e Turmas |
| `técnico` | Tudo (alunos, notas, banco de horas, configurações) |
| `professor` | Suas turmas, alunos e notas |
| `responsavel` | Dados do(s) seu(s) filho(s) |

## 5. Fluxo de login (importante)

1. O usuário digita e-mail e senha
2. O backend envia um **e-mail com um link de autorização** (Gmail API)
3. Clicar no link **apenas autoriza** a sessão — não abre sessão na aba do e-mail
4. A aba original do site detecta a aprovação (polling) e só então entra

Ou seja: **contas com e-mail falso não conseguem entrar**. Para testes rápidos,
use o botão **“Entrar como visitante”** (somente leitura) ou as contas de
demonstração listadas em `backend/server.py`.

## 6. Deploy

O Render publica automaticamente a cada push na branch `main`
(Auto-Deploy: *On Commit*). Depois de um push, o site fica atualizado em ~1–3 min.

> ⚠️ O `main` é o site em produção. Se quiser experimentar algo arriscado,
> faça em uma branch (`git checkout -b minha-branch`) e abra um Pull Request.

## 7. Boas práticas neste projeto

- Nunca comite `backend/.env` nem tokens
- Rotas `POST /auth/...` e `/api/...` ficam em `backend/server.py`
- Os caminhos `/backend/` e `/.git/` são bloqueados via HTTP de propósito
- Teste em `localhost` antes de dar push; verifique `/api/health` depois do deploy
