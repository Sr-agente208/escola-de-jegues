# 🏫 Escola Horizonte — Portal da Escola

Site completo de gestão escolar: **técnico de TI, professores, alunos e responsáveis (pais)** com login e permissões por cargo.

## 🔐 Entrada com autorização por e-mail

Ao fazer login, **ninguém entra direto**: o site cria um pedido de acesso e envia um e-mail para o usuário com o botão **“Sim, autorizar entrada”**. Só depois do clique o acesso é liberado. O link expira em 10 minutos e é de uso único.

**Como funciona hoje (sem backend):**
- O e-mail aparece **simulado na tela** (modo demonstração), com os botões “✅ Sim, autorizar entrada” e “❌ Não fui eu”.
- A tela de espera verifica sozinha, a cada 2 segundos, se o e-mail foi autorizado — ao clicar em “Sim”, o usuário entra automaticamente.
- O link do e-mail (`?autorizar=TOKEN`) também pode ser aberto em outra aba: ela mostra a tela “Entrada autorizada!” e libera o acesso.

**Para receber e-mails DE VERDADE:**
- **Opção A — EmailJS (grátis, sem backend):** crie uma conta em [emailjs.com](https://www.emailjs.com), conecte seu Gmail como serviço e crie um template com as variáveis `{{to_name}}`, `{{to_email}}`, `{{magic_link}}` e `{{school_name}}`. Depois edite `js/config.js`:
  ```js
  mailProvider: 'emailjs',
  emailjs: { serviceId: 'service_XXX', templateId: 'template_XXX', publicKey: 'XXX' },
  ```
- **Opção B — Backend com Gmail API (recomendado, feito pelo seu amigo):** o envio fica no servidor, usando OAuth 2.0 com escopo `https://www.googleapis.com/auth/gmail.send` e um *refresh token* do e-mail da escola guardado **somente no servidor**. ⚠️ Nunca coloque `client_secret` nem refresh token no front-end: qualquer pessoa abriria o código e roubaria as credenciais do Gmail.
  - Passos: criar projeto no Google Cloud Console → ativar Gmail API → configurar tela de consentimento OAuth → criar credenciais OAuth (Web) → gerar um refresh token com escopo `gmail.send` → guardar no servidor (.env).
  - Endpoints esperados (já usados pelo front-end em `js/api.js`):

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/request-access` | Valida credenciais, gera token (expiração de 10 min), salva no banco e **envia o e-mail** via Gmail API |
| `GET` | `/auth/access/:token` | Status do pedido: `pendente` / `aprovado` / `rejeitado` / `expirado` |
| `POST` | `/auth/access/:token/approve` | “Sim” — marca o pedido como autorizado |
| `POST` | `/auth/access/:token/deny` | “Não fui eu” — marca como recusado |
| `POST` | `/auth/claim` | Token de uso único aprovado → devolve `{ tokenJWT, user }` e cria a sessão |

Ao implementar o backend, mude `mailProvider` para `'backend'` em `js/config.js`.

## ✨ O que o site faz

| Recurso | Técnico de TI | Professor | Aluno | Responsável |
|---|---|---|---|---|
| Ver professores e turmas | ✅ | ✅ | ✅ | ✅ |
| Adicionar / editar / **demitir** professores | ✅ | — | — | — |
| Adicionar / editar alunos | ✅ | — | — | — |
| Lançar e editar notas | ✅ | ✅ (suas turmas) | — | — |
| Adicionar **nota extra** ⭐ | ✅ | ✅ | — | — |
| Ver notas | ✅ | ✅ | ✅ (as dele) | ✅ (dos filhos) |
| Banco de horas (registrar) | ✅ | ✅ | — | — |
| Aprovar / rejeitar horas | ✅ | — | — | — |
| **Configurações do sistema** (nome da escola, slogan, restaurar dados) | ✅ | — | — | — |
| **Temas** (claro/escuro) e **cor de destaque** | ✅ todos os cargos | ✅ | ✅ | ✅ |

### 🎨 Temas e aparência

- **Tema claro ou escuro** — botão de sol/lua no topo do site (e na tela de login), ou em *Configurações → Aparência*.
- **Cor de destaque** — Azul (padrão), Verde, Roxo ou Laranja. Muda botões, menus e detalhes na hora.
- As escolhas ficam salvas no navegador.

### 🛠️ Área do Técnico de TI (exclusiva)

- Alterar **nome da escola** e **slogan** (vala em todo o site).
- **Restaurar dados de exemplo** (apaga alterações feitas no navegador).
- **Informações técnicas**: ambiente (demonstração/produção), URL da API e versão.

## 🔑 Contas de demonstração

| Cargo | E-mail | Senha |
|---|---|---|
| Técnico de TI | `sr.age@gmail.com` | `123456789` |
| Professor | `professor@escola.com` | `professor123` |
| Aluno | `aluno@escola.com` | `aluno123` |
| Responsável | `pai@escola.com` | `pai123` |

## 📁 Estrutura do projeto

```
escola/
├── index.html          ← página principal
├── css/
│   └── style.css       ← visual (tema claro/escuro + cores de destaque)
├── js/
│   ├── config.js       ← ⚙️ CONFIGURAÇÕES (URL do backend + tema)
│   ├── data.js         ← dados de exemplo (mock)
│   ├── api.js          ← 🔌 CAMADA DE API (ponto de conexão com o backend)
│   └── app.js          ← telas, menus e permissões
└── README.md
```

## 🚀 Como rodar

Basta abrir o `index.html` no navegador, ou rodar um servidor local:

```bash
cd escola
python3 -m http.server 8000
# acesse http://localhost:8000
```

## 🔌 Como conectar o backend (para o desenvolvedor)

O site já está **100% pronto no front-end**. A conexão com o banco de dados é feita em **um único lugar**: o arquivo `js/api.js`.

### Passo a passo

1. **Suba o backend** (Node, Python, PHP, etc.) com os endpoints abaixo.
2. Em `js/config.js`, coloque a URL da API e mude `useMockApi` para `false`:
   ```js
   apiBaseUrl: 'http://localhost:3000/api',
   useMockApi: false,
   ```
3. Em `js/api.js`, substitua o corpo de cada método pelos `fetch()` mostrados nos comentários (exemplo já pronto em cada método).
4. Remova o método `resetDemoData()` (é só para demonstração).

### Endpoints esperados

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Login direto (fallback) |
| `POST` | `/auth/request-access` | Pedido de acesso + envio do e-mail de autorização |
| `GET` | `/auth/access/:token` | Consulta status do pedido de acesso |
| `POST` | `/auth/access/:token/approve` | Autoriza (clique em “Sim” no e-mail) |
| `POST` | `/auth/access/:token/deny` | Recusa (“Não fui eu”) |
| `POST` | `/auth/claim` | Troca token aprovado por sessão (JWT) |
| `GET` | `/teachers` | Lista professores |
| `POST` | `/teachers` | Cria professor + conta de login |
| `PUT` | `/teachers/:id` | Edita professor |
| `DELETE` | `/teachers/:id` | Demite professor |
| `PATCH` | `/teachers/:id/readmit` | Readmite professor |
| `GET` | `/students` | Lista alunos |
| `POST` | `/students` | Cria aluno |
| `PUT` | `/students/:id` | Edita aluno |
| `DELETE` | `/students/:id` | Exclui aluno |
| `GET` | `/grades` | Lista notas |
| `POST` | `/grades` | Cria nota |
| `PUT` | `/grades/:id` | Edita notas (1º bim, 2º bim, extra, observações) |
| `POST` | `/grades/:id/extra` | Adiciona nota extra |
| `GET` | `/hours` | Lista banco de horas |
| `POST` | `/hours` | Registra horas (status inicial: `pendente`) |
| `PATCH` | `/hours/:id/status` | Aprova/rejeita horas |
| `GET` | `/classes` | Lista turmas |

### Modelos de dados

**Professor:** `{ id, name, email, phone, subject, hireDate, status: 'ativo'|'demitido', classes: [] }`

**Aluno:** `{ id, name, className, guardianName, guardianEmail, birthDate }`

**Nota:** `{ id, studentId, subject, teacherId, b1, b2, extra, observations }`
> A média é calculada no front-end: média de (1º bim, 2º bim e nota extra, quando houver). ≥ 6,0 = aprovado.

**Banco de horas:** `{ id, teacherId, date, type: 'aula'|'reuniao'|'extra'|'falta'|'atestado', hours, status: 'pendente'|'aprovado'|'rejeitado', description }`

**Usuário (login):** `{ id, name, email, password, role: 'tecnico'|'professor'|'aluno'|'responsavel', teacherId?, studentId?, studentIds? }`

## 📝 Notas

- Enquanto o backend não está pronto, os dados ficam salvos no navegador (`localStorage`) e as alterações persistem entre visitas.
- Para **zerar os dados de exemplo**: *Configurações → Sistema → Restaurar dados de exemplo* (ou limpe a chave `escola_horizonte_db_v2` no navegador).
- As senhas nos dados de exemplo são texto simples apenas para demonstração — no backend, use hash (bcrypt) e autenticação com token (JWT).
- Preferências de tema ficam na chave `escola_horizonte_settings` no navegador.
