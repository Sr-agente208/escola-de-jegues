/* ============================================================
   ESCOLA HORIZONTE — LÓGICA DA APLICAÇÃO (FRONT-END)
   ============================================================
   Este arquivo cuida de tudo que o usuário vê e clica:
   login, menus, tabelas, formulários e permissões por cargo.

   Ele fala com o "banco de dados" apenas através da camada
   API (js/api.js). Quando o backend estiver pronto, nenhum
   código aqui precisa mudar — só a api.js é trocada.
   ============================================================ */

/* ---------------- ÍCONES (SVG) ---------------- */
const ICONS = {
  dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  teachers: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  students: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>',
  grades: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>',
  hours: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  classes: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  book: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
  check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
  x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  star: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>',
  sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  wrench: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  mail: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>',
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>',
  shield: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
};

/* ---------------- ESTADO GLOBAL ---------------- */
const state = {
  user: null,
  view: 'dashboard',
  pendingAccess: null,   // pedido de acesso aguardando "Sim" no e-mail
  accessPoll: null,      // intervalo que verifica se o e-mail foi autorizado
  // filtros das telas
  teacherSearch: '',
  studentSearch: '',
  gradeSearch: '',
  gradeFilter: 'todas',
  hourFilter: 'todas',
};

/* ---------------- PERMISSÕES POR CARGO ---------------- */
const PERMISSIONS = {
  tecnico:     { teachers: 'manage', students: 'manage', grades: 'edit',   hours: 'manage', classes: 'view', settings: 'manage' },
  professor:   { teachers: 'view',   students: 'view',   grades: 'edit',   hours: 'own',    classes: 'view' },
  aluno:       { teachers: 'view',   students: 'own',    grades: 'view',   hours: 'none',   classes: 'view' },
  responsavel: { teachers: 'view',   students: 'own',    grades: 'view',   hours: 'none',   classes: 'view' },
};

function can(action) {
  return PERMISSIONS[state.user.role]?.[action] === 'edit' || PERMISSIONS[state.user.role]?.[action] === 'manage';
}
function isTecnico() { return state.user.role === 'tecnico'; }
function isStaff() { return ['tecnico', 'professor'].includes(state.user.role); }

/* ---------------- UTILITÁRIOS ---------------- */
const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = name => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const fmtDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
const fmtGrade = n => (Number(n) || 0).toFixed(1).replace('.', ',');

function gradeAverage(g) {
  const parts = [g.b1, g.b2];
  if (g.extra > 0) parts.push(g.extra);
  return parts.reduce((a, b) => a + Number(b), 0) / parts.length;
}
function gradeStatus(avg) {
  if (avg >= 6) return { label: 'Aprovado', cls: 'green' };
  if (avg >= 4) return { label: 'Recuperação', cls: 'orange' };
  return { label: 'Reprovado', cls: 'red' };
}
function gradeClass(avg) { return avg >= 6 ? 'grade-good' : avg >= 4 ? 'grade-mid' : 'grade-bad'; }

function toast(msg, type = 'success') {
  const box = $('#toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3200);
}

/* ---------------- TEMA (claro/escuro + cor de destaque) ---------------- */
function currentSettings() { return SchoolSettings.load(); }

function setTheme(theme) {
  SchoolSettings.update({ theme });
  if (state.user) renderApp(); else renderLogin();
  toast(theme === 'dark' ? '🌙 Tema escuro ativado' : '☀️ Tema claro ativado');
}

function setAccent(accent) {
  SchoolSettings.update({ accent });
  if (state.user) renderApp(); else renderLogin();
  toast('🎨 Cor de destaque aplicada!');
}

function toggleThemeQuick() {
  const now = currentSettings().theme || 'light';
  setTheme(now === 'dark' ? 'light' : 'dark');
}

/* ---------------- MODAL ---------------- */
function openModal(title, bodyHTML, onSubmit, submitLabel = 'Salvar') {
  const overlay = $('#modal-overlay');
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHTML;
  $('#modal-submit').textContent = submitLabel;
  overlay.classList.add('open');
  $('#modal-form').onsubmit = async e => {
    e.preventDefault();
    try {
      await onSubmit(new FormData(e.target));
      closeModal();
    } catch (err) {
      toast(err.message, 'error');
    }
  };
}
function closeModal() { $('#modal-overlay').classList.remove('open'); }

/* ============================================================
   TELA DE LOGIN
   ============================================================ */
function renderLogin() {
  document.getElementById('app-root').innerHTML = `
    <div class="login-screen">
      <button type="button" class="login-theme-btn" id="login-theme-btn" title="Alternar tema claro/escuro">${currentSettings().theme === 'dark' ? ICONS.sun : ICONS.moon}</button>
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-icon">${ICONS.book}</div>
          <h1>${esc(CONFIG.schoolName)}</h1>
          <p>${esc(CONFIG.schoolSlogan)}</p>
        </div>
        <div class="login-error" id="login-error"></div>
        <form id="login-form">
          <div class="field">
            <label for="login-email">E-mail</label>
            <input type="email" id="login-email" placeholder="seu@email.com" required autocomplete="email">
          </div>
          <div class="field">
            <label for="login-password">Senha</label>
            <input type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding:12px;">Entrar</button>
        </form>
        <p class="login-note">🔐 Ao entrar, enviamos um e-mail de autorização. Você só consegue acessar após confirmar no e-mail.</p>
      </div>
    </div>`;

  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    try {
      // 1º passo: valida credenciais e DISPARA o e-mail de autorização
      const pending = await API.requestAccess(email, password);
      state.pendingAccess = pending;
      renderWaitingAccess(pending);
    } catch (err) {
      const box = $('#login-error');
      box.textContent = err.message;
      box.classList.add('show');
    }
  });

  const themeBtn = $('#login-theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleThemeQuick);
}

/* ============================================================
   TELA DE ESPERA — aguardando "Sim" no e-mail
   ============================================================ */
function stopAccessPoll() {
  if (state.accessPoll) { clearInterval(state.accessPoll); state.accessPoll = null; }
}

function renderWaitingAccess(pending) {
  stopAccessPoll();
  const mock = pending.sentVia !== 'emailjs' && CONFIG.mailProvider !== 'backend';
  document.getElementById('app-root').innerHTML = `
    <div class="login-screen">
      <button type="button" class="login-theme-btn" id="login-theme-btn" title="Alternar tema claro/escuro">${(currentSettings().theme || 'light') === 'dark' ? ICONS.sun : ICONS.moon}</button>
      <div class="login-card waiting-card">
        <div class="mail-pulse">${ICONS.mail}</div>
        <h1 class="waiting-title">Verifique seu e-mail</h1>
        <p class="waiting-text">Enviamos um pedido de autorização para<br><strong>${esc(pending.email)}</strong></p>
        <p class="waiting-sub">Para entrar, abra o e-mail e clique em <strong>“Sim, autorizar entrada”</strong>. O link vale por ${pending.expiresInMinutes} minutos e só pode ser usado uma vez.</p>
        <div class="waiting-status" id="waiting-status"><span class="dot-pulse"></span> Aguardando confirmação no e-mail…</div>
        <button class="btn btn-primary" id="claim-access-btn" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px;">${ICONS.shield} Já cliquei em “Sim” — Entrar</button>
        <button class="btn btn-outline" id="cancel-access-btn" style="width:100%; justify-content:center;">Cancelar e voltar</button>

        ${mock ? `
        <div class="mock-email">
          <div class="mock-email-tag">🧪 MODO DEMONSTRAÇÃO — prévia do e-mail que seria enviado</div>
          <div class="mock-email-box">
            <p class="mock-email-from"><strong>De:</strong> ${esc(CONFIG.schoolName)} &lt;no-reply@escolahorizonte.com.br&gt;<br>
            <strong>Para:</strong> ${esc(pending.email)}<br>
            <strong>Assunto:</strong> 🔐 Autorizar entrada de ${esc(pending.name.split(' ')[0])} no portal</p>
            <p class="mock-email-body">Olá, ${esc(pending.name.split(' ')[0])}! Alguém tentou entrar no portal da escola com a sua conta. Foi você?</p>
            <div class="mock-email-actions">
              <button class="btn btn-success" id="mock-yes-btn">✅ Sim, autorizar entrada</button>
              <button class="btn btn-outline" id="mock-no-btn">❌ Não fui eu</button>
            </div>
          </div>
          <p class="form-hint" style="margin-top:10px;">Quando o backend estiver conectado (ou o EmailJS configurado), este e-mail chega de verdade na caixa de entrada.</p>
        </div>` : `
        <div class="mail-sent-ok">${ICONS.send} E-mail enviado! Verifique também a caixa de spam.</div>`}
      </div>
    </div>`;

  const themeBtn = $('#login-theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleThemeQuick);

  // Entrada após o "Sim" (botão manual — a tela também verifica sozinha)
  $('#claim-access-btn').addEventListener('click', () => claimAccess(pending.token, true));
  $('#cancel-access-btn').addEventListener('click', () => {
    stopAccessPoll();
    state.pendingAccess = null;
    renderLogin();
  });

  // Botões da simulação de e-mail (modo demonstração)
  const yesBtn = $('#mock-yes-btn');
  if (yesBtn) yesBtn.addEventListener('click', async () => {
    try {
      await API.approveAccess(pending.token);
      toast('Entrada autorizada no e-mail!');
      claimAccess(pending.token, true);
    } catch (err) { toast(err.message, 'error'); }
  });
  const noBtn = $('#mock-no-btn');
  if (noBtn) noBtn.addEventListener('click', async () => {
    await API.denyAccess(pending.token);
    stopAccessPoll();
    renderAuthorizationResult(false, 'Entrada recusada. Se você não tentou entrar, troque sua senha com o técnico de TI.');
  });

  // Verifica sozinho a cada 2 segundos se o e-mail já foi autorizado
  state.accessPoll = setInterval(async () => {
    try {
      const status = await API.checkAccess(pending.token);
      if (status === 'aprovado') { claimAccess(pending.token, false); }
      else if (status === 'rejeitado') { stopAccessPoll(); renderAuthorizationResult(false, 'Entrada recusada no e-mail.'); }
      else if (status === 'expirado') { stopAccessPoll(); renderAuthorizationResult(false, 'O link expirou. Faça login novamente.'); }
    } catch (_) { /* ignora falhas momentâneas */ }
  }, 2000);
}

async function claimAccess(token, manual) {
  try {
    const user = await API.claimSession(token);
    stopAccessPoll();
    state.pendingAccess = null;
    state.user = user;
    state.view = 'dashboard';
    renderApp();
    toast(`Bem-vindo(a), ${user.name.split(' ')[0]}! ✅ Entrada autorizada por e-mail.`);
  } catch (err) {
    if (manual) {
      const statusBox = $('#waiting-status');
      if (statusBox) { statusBox.innerHTML = `<span style="color:var(--danger); font-weight:600;">⚠️ ${esc(err.message)}</span>`; }
      else toast(err.message, 'error');
    }
  }
}

/* ============================================================
   TELA DE RESULTADO — aberta ao clicar no link do e-mail
   ============================================================ */
function renderAuthorizationResult(success, message) {
  stopAccessPoll();
  document.getElementById('app-root').innerHTML = `
    <div class="login-screen">
      <div class="login-card auth-result">
        <div class="auth-icon ${success ? 'ok' : 'fail'}">${success ? '✅' : '🚫'}</div>
        <h1 class="waiting-title">${success ? 'Entrada autorizada!' : 'Não foi possível entrar'}</h1>
        <p class="waiting-text">${success
          ? 'Você confirmou o e-mail e sua entrada no portal foi autorizada.'
          : esc(message || 'Link inválido ou expirado.')}</p>
        <p class="waiting-sub">${success ? 'Se outra aba do site estava aguardando, ela já entrou sozinha. Você também pode fechar esta aba.' : 'Volte ao site e faça login novamente para receber um novo e-mail.'}</p>
        <button class="btn btn-primary" id="auth-result-btn" style="width:100%; justify-content:center; padding:12px;">${success ? 'Ir para o portal' : 'Voltar para o login'}</button>
      </div>
    </div>`;
  $('#auth-result-btn').addEventListener('click', () => { state.user ? renderApp() : renderLogin(); });
}

/* ============================================================
   ESTRUTURA PRINCIPAL (SIDEBAR + TOPO + CONTEÚDO)
   ============================================================ */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'teachers',  label: 'Professores', icon: 'teachers' },
  { id: 'students',  label: 'Alunos', icon: 'students' },
  { id: 'grades',    label: 'Notas', icon: 'grades' },
  { id: 'hours',     label: 'Banco de Horas', icon: 'hours' },
  { id: 'classes',   label: 'Turmas', icon: 'classes' },
  { id: 'settings',  label: 'Configurações', icon: 'settings' },
];

const ROLE_LABELS = { tecnico: 'Técnico de TI', professor: 'Professor(a)', aluno: 'Aluno(a)', responsavel: 'Responsável' };

function visibleNav() {
  const role = state.user.role;
  return NAV_ITEMS.filter(item => {
    if (item.id === 'hours' && (role === 'aluno' || role === 'responsavel')) return false;
    return true;
  });
}

function renderApp() {
  const user = state.user;
  const nav = visibleNav();
  document.getElementById('app-root').innerHTML = `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="logo-icon">${ICONS.book}</div>
          <div><strong>${esc(CONFIG.schoolName)}</strong><span>${esc(CONFIG.schoolSlogan)}</span></div>
        </div>
        <nav class="nav">
          ${nav.map(item => `
            <button class="nav-item ${state.view === item.id ? 'active' : ''}" data-nav="${item.id}">
              ${ICONS[item.icon]} ${item.label}
            </button>`).join('')}
        </nav>
        <div class="sidebar-user">
          <div class="avatar">${initials(user.name)}</div>
          <div>
            <div class="u-name">${esc(user.name)}</div>
            <div class="u-role">${ROLE_LABELS[user.role]}</div>
          </div>
          <button class="logout-btn" id="logout-btn" title="Sair">${ICONS.logout}</button>
        </div>
      </aside>
      <div class="main">
        <div class="topbar">
          <button class="menu-toggle" id="menu-toggle">${ICONS.menu}</button>
          <h2 id="page-title"></h2>
          <div class="spacer"></div>
          <button class="icon-btn" id="theme-toggle" title="Alternar tema claro/escuro">${currentSettings().theme === 'dark' ? ICONS.sun : ICONS.moon}</button>
        </div>
        <div class="content" id="content"></div>
      </div>
    </div>`;

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
  $('#logout-btn').addEventListener('click', async () => {
    stopAccessPoll();
    await API.logout();
    state.user = null;
    renderLogin();
  });
  $('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  const themeToggle = $('#theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleThemeQuick);

  renderView();
}

function navigate(view) {
  state.view = view;
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === view));
  $('#sidebar').classList.remove('open');
  renderView();
}

async function renderView() {
  const titles = {
    dashboard: 'Dashboard', teachers: 'Professores', students: 'Alunos',
    grades: 'Notas', hours: 'Banco de Horas', classes: 'Turmas', settings: 'Configurações',
  };
  $('#page-title').textContent = titles[state.view] || '';
  const content = $('#content');
  content.innerHTML = '<div class="empty-state">Carregando...</div>';
  try {
    const renderers = { dashboard: viewDashboard, teachers: viewTeachers, students: viewStudents, grades: viewGrades, hours: viewHours, classes: viewClasses, settings: viewSettings };
    content.innerHTML = await renderers[state.view]();
    bindViewEvents();
  } catch (err) {
    content.innerHTML = `<div class="empty-state">⚠️ Erro ao carregar: ${esc(err.message)}</div>`;
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function viewDashboard() {
  const [teachers, students, grades, hours] = await Promise.all([
    API.getTeachers(), API.getStudents(), API.getGrades(), API.getHours(),
  ]);
  const role = state.user.role;
  const activeTeachers = teachers.filter(t => t.status === 'ativo');
  const pendingHours = hours.filter(h => h.status === 'pendente');

  if (role === 'tecnico') {
    const avgAll = grades.length ? grades.reduce((a, g) => a + gradeAverage(g), 0) / grades.length : 0;
    return `
      <div class="stats-grid">
        ${statCard('blue', ICONS.teachers, activeTeachers.length, 'Professores ativos')}
        ${statCard('green', ICONS.students, students.length, 'Alunos matriculados')}
        ${statCard('orange', ICONS.grades, fmtGrade(avgAll), 'Média geral da escola')}
        ${statCard('red', ICONS.hours, pendingHours.length, 'Horas aguardando aprovação')}
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>📋 Últimas horas registradas</h3>
          ${hours.slice(-5).reverse().map(h => {
            const t = teachers.find(x => x.id === h.teacherId);
            return `<p style="padding:8px 0; border-bottom:1px solid var(--border); font-size:14px;">
              <strong>${esc(t?.name || '?')}</strong> — ${h.hours}h (${esc(h.type)}) · ${fmtDate(h.date)} ${hourBadge(h.status)}</p>`;
          }).join('') || '<p>Nenhum registro.</p>'}
        </div>
        <div class="card">
          <h3>🏆 Melhores médias</h3>
          ${[...grades].sort((a, b) => gradeAverage(b) - gradeAverage(a)).slice(0, 5).map(g => {
            const s = students.find(x => x.id === g.studentId);
            return `<p style="padding:8px 0; border-bottom:1px solid var(--border); font-size:14px;">
              <strong>${esc(s?.name || '?')}</strong> — ${esc(g.subject)}: <span class="grade-cell ${gradeClass(gradeAverage(g))}">${fmtGrade(gradeAverage(g))}</span></p>`;
          }).join('') || '<p>Sem notas cadastradas.</p>'}
        </div>
      </div>`;
  }

  if (role === 'professor') {
    const myTeacher = teachers.find(t => t.id === state.user.teacherId);
    const myHours = hours.filter(h => h.teacherId === state.user.teacherId);
    const approved = myHours.filter(h => h.status === 'aprovado').reduce((a, h) => a + h.hours, 0);
    const pending = myHours.filter(h => h.status === 'pendente').reduce((a, h) => a + h.hours, 0);
    const myGrades = grades.filter(g => g.teacherId === state.user.teacherId);
    return `
      <div class="stats-grid">
        ${statCard('blue', ICONS.classes, myTeacher?.classes?.length || 0, 'Minhas turmas')}
        ${statCard('green', ICONS.grades, myGrades.length, 'Notas lançadas')}
        ${statCard('orange', ICONS.hours, approved + 'h', 'Horas aprovadas')}
        ${statCard('red', ICONS.hours, pending + 'h', 'Horas pendentes')}
      </div>
      <div class="card">
        <h3>👋 Olá, ${esc(state.user.name.split(' ')[0])}!</h3>
        <p style="color:var(--text-light); font-size:14px;">Você leciona <strong>${esc(myTeacher?.subject || '')}</strong> nas turmas: ${esc((myTeacher?.classes || []).join(', ') || '—')}.</p>
        <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-primary" data-nav="grades">${ICONS.grades} Lançar notas</button>
          <button class="btn btn-outline" data-nav="hours">${ICONS.hours} Registrar horas</button>
        </div>
      </div>`;
  }

  // Aluno ou responsável
  const myStudentIds = role === 'aluno' ? [state.user.studentId] : (state.user.studentIds || []);
  const myGrades = grades.filter(g => myStudentIds.includes(g.studentId));
  const avg = myGrades.length ? myGrades.reduce((a, g) => a + gradeAverage(g), 0) / myGrades.length : 0;
  const approvedCount = myGrades.filter(g => gradeAverage(g) >= 6).length;
  return `
    <div class="stats-grid">
      ${statCard('blue', ICONS.students, myStudentIds.length, role === 'aluno' ? 'Minha turma' : 'Filhos(as)')}
      ${statCard('green', ICONS.grades, fmtGrade(avg), 'Média geral')}
      ${statCard('orange', ICONS.grades, myGrades.length, 'Disciplinas avaliadas')}
      ${statCard('red', ICONS.grades, approvedCount, 'Disciplinas aprovadas')}
    </div>
    <div class="card">
      <h3>📚 Resumo das notas</h3>
      ${myGrades.map(g => {
        const s = students.find(x => x.id === g.studentId);
        const st = gradeStatus(gradeAverage(g));
        return `<p style="padding:8px 0; border-bottom:1px solid var(--border); font-size:14px;">
          ${role === 'responsavel' ? `<strong>${esc(s?.name || '?')}</strong> · ` : ''}${esc(g.subject)}:
          <span class="grade-cell ${gradeClass(gradeAverage(g))}">${fmtGrade(gradeAverage(g))}</span>
          <span class="badge ${st.cls}">${st.label}</span></p>`;
      }).join('') || '<p>Nenhuma nota disponível.</p>'}
      <div style="margin-top:16px;">
        <button class="btn btn-primary" data-nav="grades">${ICONS.grades} Ver notas completas</button>
      </div>
    </div>`;
}

function statCard(color, icon, num, label) {
  return `<div class="stat-card"><div class="stat-icon ${color}">${icon}</div><div><div class="stat-num">${num}</div><div class="stat-label">${label}</div></div></div>`;
}

function hourBadge(status) {
  const map = { aprovado: 'green', pendente: 'orange', rejeitado: 'red' };
  const label = { aprovado: 'Aprovado', pendente: 'Pendente', rejeitado: 'Rejeitado' };
  return `<span class="badge ${map[status] || 'gray'}">${label[status] || status}</span>`;
}

/* ============================================================
   PROFESSORES
   ============================================================ */
async function viewTeachers() {
  const teachers = await API.getTeachers();
  const q = state.teacherSearch.toLowerCase();
  const list = teachers.filter(t => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
  const manage = isTecnico();

  return `
    <div class="toolbar">
      <input class="search-input" id="teacher-search" placeholder="🔍 Buscar professor ou disciplina..." value="${esc(state.teacherSearch)}">
      <div class="spacer"></div>
      ${manage ? `<button class="btn btn-primary" id="add-teacher-btn">${ICONS.plus} Adicionar professor</button>` : ''}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Professor</th><th>Disciplina</th><th>Turmas</th><th>Telefone</th><th>Admissão</th><th>Status</th>${manage ? '<th>Ações</th>' : ''}</tr></thead>
          <tbody>
            ${list.map(t => `
              <tr>
                <td><div style="display:flex; align-items:center; gap:10px;"><div class="avatar" style="width:34px;height:34px;font-size:13px;">${initials(t.name)}</div><div><strong>${esc(t.name)}</strong><br><small style="color:var(--text-light)">${esc(t.email)}</small></div></div></td>
                <td>${esc(t.subject)}</td>
                <td>${esc((t.classes || []).join(', ') || '—')}</td>
                <td>${esc(t.phone || '—')}</td>
                <td>${fmtDate(t.hireDate)}</td>
                <td>${t.status === 'ativo' ? '<span class="badge green">Ativo</span>' : '<span class="badge red">Demitido</span>'}</td>
                ${manage ? `<td><div class="action-group">
                  <button class="btn btn-outline btn-sm" data-edit-teacher="${t.id}" title="Editar">${ICONS.edit}</button>
                  ${t.status === 'ativo'
                    ? `<button class="btn btn-danger btn-sm" data-dismiss-teacher="${t.id}" title="Demitir">${ICONS.trash}</button>`
                    : `<button class="btn btn-success btn-sm" data-readmit-teacher="${t.id}" title="Readmitir">${ICONS.check}</button>`}
                </div></td>` : ''}
              </tr>`).join('') || '<tr><td colspan="7"><div class="empty-state">Nenhum professor encontrado.</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
}

function teacherFormHTML(t = {}) {
  return `
    <div class="field"><label>Nome completo *</label><input name="name" required value="${esc(t.name || '')}" placeholder="Nome do professor"></div>
    <div class="field"><label>E-mail (login) *</label><input name="email" type="email" required value="${esc(t.email || '')}" placeholder="professor@escola.com"></div>
    <div class="form-row">
      <div class="field"><label>Telefone</label><input name="phone" value="${esc(t.phone || '')}" placeholder="(11) 99999-9999"></div>
      <div class="field"><label>Disciplina *</label><input name="subject" required value="${esc(t.subject || '')}" placeholder="Ex.: Matemática"></div>
    </div>
    <div class="form-row">
      <div class="field"><label>Data de admissão</label><input name="hireDate" type="date" value="${esc(t.hireDate || '')}"></div>
      <div class="field"><label>Turmas (separar por vírgula)</label><input name="classes" value="${esc((t.classes || []).join(', '))}" placeholder="8º Ano A, 9º Ano B"></div>
    </div>
    <div class="field"><label>${t.id ? 'Nova senha (deixe em branco para manter)' : 'Senha de acesso *'}</label><input name="password" type="text" ${t.id ? '' : 'required'} placeholder="${t.id ? '••••••••' : 'Senha inicial do professor'}"></div>`;
}

async function handleAddTeacher() {
  openModal('Adicionar professor', teacherFormHTML(), async form => {
    const data = Object.fromEntries(form.entries());
    data.classes = data.classes.split(',').map(s => s.trim()).filter(Boolean);
    await API.createTeacher(data);
    toast('Professor adicionado com sucesso!');
    renderView();
  });
}

async function handleEditTeacher(id) {
  const teachers = await API.getTeachers();
  const t = teachers.find(x => x.id === id);
  openModal('Editar professor', teacherFormHTML(t), async form => {
    const data = Object.fromEntries(form.entries());
    data.classes = data.classes.split(',').map(s => s.trim()).filter(Boolean);
    if (!data.password) delete data.password;
    await API.updateTeacher(id, data);
    toast('Professor atualizado!');
    renderView();
  });
}

async function handleDismissTeacher(id) {
  const teachers = await API.getTeachers();
  const t = teachers.find(x => x.id === id);
  openModal('Demitir professor', `<p>Tem certeza que deseja demitir <strong>${esc(t.name)}</strong>?<br><br>O acesso dele ao site será bloqueado. O histórico de notas e horas será mantido.</p>`, async () => {
    await API.dismissTeacher(id);
    toast('Professor demitido.');
    renderView();
  }, 'Demitir');
}

async function handleReadmitTeacher(id) {
  await API.readmitTeacher(id);
  toast('Professor readmitido!');
  renderView();
}

/* ============================================================
   ALUNOS
   ============================================================ */
async function viewStudents() {
  const students = await API.getStudents();
  const role = state.user.role;
  let list = students;
  if (role === 'aluno') list = students.filter(s => s.id === state.user.studentId);
  if (role === 'responsavel') list = students.filter(s => (state.user.studentIds || []).includes(s.id));

  const q = state.studentSearch.toLowerCase();
  list = list.filter(s => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q));
  const manage = isTecnico();

  return `
    <div class="toolbar">
      <input class="search-input" id="student-search" placeholder="🔍 Buscar aluno ou turma..." value="${esc(state.studentSearch)}">
      <div class="spacer"></div>
      ${manage ? `<button class="btn btn-primary" id="add-student-btn">${ICONS.plus} Adicionar aluno</button>` : ''}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Aluno</th><th>Turma</th><th>Responsável</th><th>E-mail do responsável</th>${manage ? '<th>Ações</th>' : ''}</tr></thead>
          <tbody>
            ${list.map(s => `
              <tr>
                <td><div style="display:flex; align-items:center; gap:10px;"><div class="avatar" style="width:34px;height:34px;font-size:13px;">${initials(s.name)}</div><strong>${esc(s.name)}</strong></div></td>
                <td><span class="badge blue">${esc(s.className)}</span></td>
                <td>${esc(s.guardianName)}</td>
                <td>${esc(s.guardianEmail)}</td>
                ${manage ? `<td><div class="action-group">
                  <button class="btn btn-outline btn-sm" data-edit-student="${s.id}" title="Editar">${ICONS.edit}</button>
                  <button class="btn btn-danger btn-sm" data-delete-student="${s.id}" title="Excluir">${ICONS.trash}</button>
                </div></td>` : ''}
              </tr>`).join('') || '<tr><td colspan="5"><div class="empty-state">Nenhum aluno encontrado.</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
}

function studentFormHTML(s = {}) {
  return `
    <div class="field"><label>Nome completo *</label><input name="name" required value="${esc(s.name || '')}"></div>
    <div class="form-row">
      <div class="field"><label>Turma *</label><input name="className" required value="${esc(s.className || '')}" placeholder="Ex.: 8º Ano A"></div>
      <div class="field"><label>Data de nascimento</label><input name="birthDate" type="date" value="${esc(s.birthDate || '')}"></div>
    </div>
    <div class="field"><label>Nome do responsável *</label><input name="guardianName" required value="${esc(s.guardianName || '')}"></div>
    <div class="field"><label>E-mail do responsável (login dele)</label><input name="guardianEmail" type="email" value="${esc(s.guardianEmail || '')}" placeholder="responsavel@email.com"></div>`;
}

async function handleAddStudent() {
  openModal('Adicionar aluno', studentFormHTML(), async form => {
    await API.createStudent(Object.fromEntries(form.entries()));
    toast('Aluno adicionado!');
    renderView();
  });
}

async function handleEditStudent(id) {
  const students = await API.getStudents();
  const s = students.find(x => x.id === id);
  openModal('Editar aluno', studentFormHTML(s), async form => {
    await API.updateStudent(id, Object.fromEntries(form.entries()));
    toast('Aluno atualizado!');
    renderView();
  });
}

async function handleDeleteStudent(id) {
  const students = await API.getStudents();
  const s = students.find(x => x.id === id);
  openModal('Excluir aluno', `<p>Excluir <strong>${esc(s.name)}</strong> e todas as notas dele?</p>`, async () => {
    await API.deleteStudent(id);
    toast('Aluno excluído.');
    renderView();
  }, 'Excluir');
}

/* ============================================================
   NOTAS
   ============================================================ */
async function viewGrades() {
  const [grades, students, teachers] = await Promise.all([API.getGrades(), API.getStudents(), API.getTeachers()]);
  const role = state.user.role;
  let list = grades;

  if (role === 'professor') list = grades.filter(g => g.teacherId === state.user.teacherId);
  if (role === 'aluno') list = grades.filter(g => g.studentId === state.user.studentId);
  if (role === 'responsavel') list = grades.filter(g => (state.user.studentIds || []).includes(g.studentId));

  const q = state.gradeSearch.toLowerCase();
  list = list.filter(g => {
    const s = students.find(x => x.id === g.studentId);
    return (s?.name || '').toLowerCase().includes(q) || g.subject.toLowerCase().includes(q);
  });
  if (state.gradeFilter === 'aprovado') list = list.filter(g => gradeAverage(g) >= 6);
  if (state.gradeFilter === 'reprovado') list = list.filter(g => gradeAverage(g) < 6);
  if (state.gradeFilter === 'extra') list = list.filter(g => g.extra > 0);

  const editable = can('grades');

  return `
    <div class="toolbar">
      <input class="search-input" id="grade-search" placeholder="🔍 Buscar aluno ou disciplina..." value="${esc(state.gradeSearch)}">
      <select class="filter-select" id="grade-filter">
        <option value="todas" ${state.gradeFilter === 'todas' ? 'selected' : ''}>Todas as notas</option>
        <option value="aprovado" ${state.gradeFilter === 'aprovado' ? 'selected' : ''}>Aprovados</option>
        <option value="reprovado" ${state.gradeFilter === 'reprovado' ? 'selected' : ''}>Reprovados / Recuperação</option>
        <option value="extra" ${state.gradeFilter === 'extra' ? 'selected' : ''}>Com nota extra</option>
      </select>
      <div class="spacer"></div>
      ${editable ? `<button class="btn btn-primary" id="add-grade-btn">${ICONS.plus} Nova nota</button>` : ''}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Aluno</th><th>Disciplina</th><th>1º Bim.</th><th>2º Bim.</th><th>Nota Extra</th><th>Média</th><th>Situação</th>${editable ? '<th>Ações</th>' : ''}</tr></thead>
          <tbody>
            ${list.map(g => {
              const s = students.find(x => x.id === g.studentId);
              const avg = gradeAverage(g);
              const st = gradeStatus(avg);
              return `<tr>
                <td><strong>${esc(s?.name || '?')}</strong><br><small style="color:var(--text-light)">${esc(s?.className || '')}</small></td>
                <td>${esc(g.subject)}</td>
                <td class="grade-cell ${gradeClass(g.b1)}">${fmtGrade(g.b1)}</td>
                <td class="grade-cell ${gradeClass(g.b2)}">${fmtGrade(g.b2)}</td>
                <td>${g.extra > 0 ? `<span class="grade-cell grade-good">${fmtGrade(g.extra)}</span> ${ICONS.star}` : '<span style="color:var(--text-light)">—</span>'}</td>
                <td class="grade-cell ${gradeClass(avg)}">${fmtGrade(avg)}</td>
                <td><span class="badge ${st.cls}">${st.label}</span></td>
                ${editable ? `<td><div class="action-group">
                  <button class="btn btn-outline btn-sm" data-edit-grade="${g.id}" title="Editar notas">${ICONS.edit}</button>
                  <button class="btn btn-outline btn-sm" data-extra-grade="${g.id}" title="Adicionar nota extra">${ICONS.star} Extra</button>
                </div></td>` : ''}
              </tr>`;
            }).join('') || '<tr><td colspan="8"><div class="empty-state">Nenhuma nota encontrada.</div></td></tr>'}
          </tbody>
        </table>
      </div>
      <p style="margin-top:12px; font-size:12.5px; color:var(--text-light);">💡 A média é calculada com 1º bimestre, 2º bimestre e a nota extra (quando houver). Média ≥ 6,0 = aprovado.</p>
    </div>`;
}

function gradeFormHTML(g = {}, students = [], teachers = []) {
  const isNew = !g.id;
  return `
    ${isNew ? `
    <div class="field"><label>Aluno *</label>
      <select name="studentId" required>${students.map(s => `<option value="${s.id}">${esc(s.name)} — ${esc(s.className)}</option>`).join('')}</select>
    </div>
    <div class="form-row">
      <div class="field"><label>Disciplina *</label><input name="subject" required placeholder="Ex.: Matemática"></div>
      <div class="field"><label>Professor *</label>
        <select name="teacherId" required>${teachers.filter(t => t.status === 'ativo').map(t => `<option value="${t.id}" ${state.user.teacherId === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
      </div>
    </div>` : ''}
    <div class="form-row">
      <div class="field"><label>Nota 1º bimestre (0–10)</label><input name="b1" type="number" step="0.5" min="0" max="10" value="${g.b1 ?? ''}" placeholder="0,0"></div>
      <div class="field"><label>Nota 2º bimestre (0–10)</label><input name="b2" type="number" step="0.5" min="0" max="10" value="${g.b2 ?? ''}" placeholder="0,0"></div>
    </div>
    <div class="field"><label>⭐ Nota extra (0–10, opcional)</label><input name="extra" type="number" step="0.5" min="0" max="10" value="${g.extra || ''}" placeholder="Deixe em branco se não houver"></div>
    <div class="field"><label>Observações</label><textarea name="observations" rows="2" placeholder="Ex.: Fez atividade extra, precisa de reforço...">${esc(g.observations || '')}</textarea></div>`;
}

async function handleEditGrade(id) {
  const grades = await API.getGrades();
  const g = grades.find(x => x.id === id);
  openModal('Editar notas', gradeFormHTML(g), async form => {
    const data = Object.fromEntries(form.entries());
    data.b1 = parseFloat(data.b1) || 0;
    data.b2 = parseFloat(data.b2) || 0;
    data.extra = parseFloat(data.extra) || 0;
    await API.updateGrade(id, data);
    toast('Notas atualizadas!');
    renderView();
  });
}

async function handleExtraGrade(id) {
  const grades = await API.getGrades();
  const g = grades.find(x => x.id === id);
  const students = await API.getStudents();
  const s = students.find(x => x.id === g.studentId);
  openModal('⭐ Adicionar nota extra', `
    <p style="margin-bottom:14px; font-size:14px;"><strong>${esc(s?.name || '')}</strong> — ${esc(g.subject)}</p>
    <div class="field"><label>Valor da nota extra (0–10) *</label><input name="extra" type="number" step="0.5" min="0" max="10" required value="${g.extra || ''}"></div>
    <div class="field"><label>Observação</label><input name="observations" value="${esc(g.observations || '')}" placeholder="Ex.: Atividade extra entregue"></div>
    <p class="form-hint">A nota extra entra no cálculo da média final da disciplina.</p>`,
  async form => {
    const data = Object.fromEntries(form.entries());
    await API.addExtraGrade(id, parseFloat(data.extra) || 0, data.observations);
    toast('Nota extra adicionada!');
    renderView();
  }, 'Salvar nota extra');
}

async function handleAddGrade() {
  const [students, teachers] = await Promise.all([API.getStudents(), API.getTeachers()]);
  openModal('Nova nota', gradeFormHTML({}, students, teachers), async form => {
    const data = Object.fromEntries(form.entries());
    data.b1 = parseFloat(data.b1) || 0;
    data.b2 = parseFloat(data.b2) || 0;
    data.extra = parseFloat(data.extra) || 0;
    await API.createGrade(data);
    toast('Nota criada!');
    renderView();
  });
}

/* ============================================================
   BANCO DE HORAS
   ============================================================ */
async function viewHours() {
  const [hours, teachers] = await Promise.all([API.getHours(), API.getTeachers()]);
  const role = state.user.role;
  let list = hours;
  if (role === 'professor') list = hours.filter(h => h.teacherId === state.user.teacherId);

  if (state.hourFilter !== 'todas') list = list.filter(h => h.status === state.hourFilter);
  list = [...list].sort((a, b) => b.date.localeCompare(a.date));

  const approved = list.filter(h => h.status === 'aprovado').reduce((a, h) => a + h.hours, 0);
  const pending = list.filter(h => h.status === 'pendente').reduce((a, h) => a + h.hours, 0);
  const rejected = list.filter(h => h.status === 'rejeitado').reduce((a, h) => a + h.hours, 0);
  const isManager = isTecnico();

  return `
    <div class="stats-grid">
      ${statCard('green', ICONS.check, approved + 'h', 'Horas aprovadas')}
      ${statCard('orange', ICONS.hours, pending + 'h', 'Horas pendentes')}
      ${statCard('red', ICONS.x, rejected + 'h', 'Horas rejeitadas')}
      ${statCard('blue', ICONS.hours, (approved + pending + rejected) + 'h', 'Total registrado')}
    </div>
    <div class="toolbar">
      <select class="filter-select" id="hour-filter">
        <option value="todas" ${state.hourFilter === 'todas' ? 'selected' : ''}>Todos os status</option>
        <option value="aprovado" ${state.hourFilter === 'aprovado' ? 'selected' : ''}>Aprovados</option>
        <option value="pendente" ${state.hourFilter === 'pendente' ? 'selected' : ''}>Pendentes</option>
        <option value="rejeitado" ${state.hourFilter === 'rejeitado' ? 'selected' : ''}>Rejeitados</option>
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" id="add-hour-btn">${ICONS.plus} Registrar horas</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th>${isManager ? '<th>Professor</th>' : ''}<th>Tipo</th><th>Horas</th><th>Descrição</th><th>Status</th>${isManager ? '<th>Ações</th>' : ''}</tr></thead>
          <tbody>
            ${list.map(h => {
              const t = teachers.find(x => x.id === h.teacherId);
              const typeLabel = { aula: 'Aula', reuniao: 'Reunião', extra: 'Atividade extra', falta: 'Falta', atestado: 'Atestado' }[h.type] || h.type;
              return `<tr>
                <td>${fmtDate(h.date)}</td>
                ${isManager ? `<td><strong>${esc(t?.name || '?')}</strong></td>` : ''}
                <td><span class="badge blue">${typeLabel}</span></td>
                <td class="grade-cell">${h.hours}h</td>
                <td style="white-space:normal; min-width:180px;">${esc(h.description || '—')}</td>
                <td>${hourBadge(h.status)}</td>
                ${isManager && h.status === 'pendente' ? `<td><div class="action-group">
                  <button class="btn btn-success btn-sm" data-approve-hour="${h.id}" title="Aprovar">${ICONS.check}</button>
                  <button class="btn btn-danger btn-sm" data-reject-hour="${h.id}" title="Rejeitar">${ICONS.x}</button>
                </div></td>` : isManager ? '<td></td>' : ''}
              </tr>`;
            }).join('') || '<tr><td colspan="7"><div class="empty-state">Nenhum registro de horas.</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
}

async function handleAddHour() {
  const teachers = await API.getTeachers();
  const isProf = state.user.role === 'professor';
  openModal('Registrar horas', `
    ${!isProf ? `<div class="field"><label>Professor *</label>
      <select name="teacherId" required>${teachers.filter(t => t.status === 'ativo').map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select>
    </div>` : ''}
    <div class="form-row">
      <div class="field"><label>Data *</label><input name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="field"><label>Tipo *</label>
        <select name="type" required>
          <option value="aula">Aula</option>
          <option value="reuniao">Reunião</option>
          <option value="extra">Atividade extra</option>
          <option value="falta">Falta</option>
          <option value="atestado">Atestado</option>
        </select>
      </div>
    </div>
    <div class="field"><label>Horas trabalhadas *</label><input name="hours" type="number" step="0.5" min="0.5" max="24" required placeholder="Ex.: 4"></div>
    <div class="field"><label>Descrição</label><input name="description" placeholder="Ex.: Aulas de Matemática — 8º Ano A"></div>
    <p class="form-hint">O registro fica como "Pendente" até o técnico aprovar.</p>`,
  async form => {
    const data = Object.fromEntries(form.entries());
    data.hours = parseFloat(data.hours) || 0;
    if (isProf) data.teacherId = state.user.teacherId;
    await API.createHour(data);
    toast('Horas registradas! Aguardando aprovação.');
    renderView();
  });
}

async function handleSetHourStatus(id, status) {
  await API.setHourStatus(id, status);
  toast(status === 'aprovado' ? 'Horas aprovadas!' : 'Horas rejeitadas.');
  renderView();
}

/* ============================================================
   TURMAS
   ============================================================ */
async function viewClasses() {
  const [classes, teachers, students] = await Promise.all([API.getClasses(), API.getTeachers(), API.getStudents()]);
  return `<div class="grid-2">
    ${classes.map(c => {
      const t = teachers.find(x => x.id === c.teacherId);
      const count = students.filter(s => s.className === c.name).length;
      return `<div class="card">
        <h3>📚 ${esc(c.name)}</h3>
        <p style="font-size:14px; color:var(--text-light); margin-bottom:8px;">${esc(c.room)} · ${esc(c.schedule)}</p>
        <p style="font-size:14px;">Professor responsável: <strong>${esc(t?.name || '—')}</strong></p>
        <p style="font-size:14px;">Alunos: <strong>${count}</strong></p>
        <div class="progress-bar" style="margin-top:12px;"><div class="progress-fill" style="width:${Math.min(count * 10, 100)}%"></div></div>
      </div>`;
    }).join('') || '<div class="card"><div class="empty-state">Nenhuma turma cadastrada.</div></div>'}
  </div>`;
}

/* ============================================================
   CONFIGURAÇÕES (perfil · aparência · sistema)
   ============================================================ */
function viewSettings() {
  const u = state.user;
  const isTech = u.role === 'tecnico';
  const s = currentSettings();
  const theme = s.theme || 'light';
  const accent = s.accent || 'blue';

  return `
    <div class="settings-grid">

      <!-- ===== MEU PERFIL ===== -->
      <div class="card">
        <h3>👤 Meu perfil ${isTech ? '<span class="tech-badge">🔧 Técnico de TI</span>' : ''}</h3>
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:20px;">
          <div class="avatar" style="width:56px;height:56px;font-size:20px;">${initials(u.name)}</div>
          <div>
            <div style="font-size:18px; font-weight:700;">${esc(u.name)}</div>
            <div style="color:var(--text-light); font-size:14px;">${esc(u.email)} · ${ROLE_LABELS[u.role]}</div>
          </div>
        </div>
        <div class="field"><label>Nome</label><input value="${esc(u.name)}" disabled></div>
        <div class="field"><label>E-mail</label><input value="${esc(u.email)}" disabled></div>
        <div class="field"><label>Cargo</label><input value="${ROLE_LABELS[u.role]}" disabled></div>
        <p class="form-hint">Para alterar seus dados de acesso, fale com o técnico de TI da escola.</p>
      </div>

      <!-- ===== APARÊNCIA (todos os cargos) ===== -->
      <div class="card">
        <h3>🎨 Aparência</h3>
        <div class="field">
          <label>Tema do site</label>
          <div class="theme-options">
            <button type="button" class="theme-option ${theme === 'light' ? 'selected' : ''}" data-theme-choice="light">
              <span class="theme-preview light"></span>
              ☀️ Claro
            </button>
            <button type="button" class="theme-option ${theme === 'dark' ? 'selected' : ''}" data-theme-choice="dark">
              <span class="theme-preview dark"></span>
              🌙 Escuro
            </button>
          </div>
        </div>
        <div class="field" style="margin-bottom:4px;">
          <label>Cor de destaque</label>
          <div class="accent-options">
            ${['blue', 'green', 'purple', 'orange'].map(a => `
              <button type="button" class="accent-option ${accent === a ? 'selected' : ''}" data-accent-choice="${a}">
                <span class="accent-swatch"></span>
                ${{ blue: 'Azul', green: 'Verde', purple: 'Roxo', orange: 'Laranja' }[a]}
              </button>`).join('')}
          </div>
          <p class="form-hint">A cor de destaque é salva neste navegador: botões, menus e detalhes mudam na hora.</p>
        </div>
      </div>

      ${isTech ? `
      <!-- ===== SISTEMA (exclusivo do técnico) ===== -->
      <div class="card">
        <h3>🛠️ Sistema e escola</h3>
        <form id="school-settings-form">
          <div class="field"><label>Nome da escola</label><input name="schoolName" value="${esc(CONFIG.schoolName)}" required maxlength="60"></div>
          <div class="field"><label>Slogan / frase de efeito</label><input name="schoolSlogan" value="${esc(CONFIG.schoolSlogan)}" maxlength="80"></div>
          <button type="submit" class="btn btn-primary">${ICONS.check} Salvar configurações da escola</button>
        </form>

        <div class="danger-zone">
          <h4>⚠️ Zona de risco</h4>
          <p style="font-size:13px; color:var(--text-light); margin-bottom:10px;">Apaga todas as alterações feitas no navegador e volta aos dados de exemplo originais.</p>
          <button class="btn btn-danger btn-sm" id="reset-demo-data">${ICONS.trash} Restaurar dados de exemplo</button>
        </div>
      </div>

      <!-- ===== INFO TÉCNICA (exclusivo do técnico) ===== -->
      <div class="card">
        <h3>🖥️ Informações técnicas</h3>
        <ul class="info-list">
          <li>Ambiente: <code>${CONFIG.useMockApi ? 'Demonstração (dados locais)' : 'Produção (backend conectado)'}</code> ${CONFIG.useMockApi ? '<span class="info-warn">MOCK</span>' : '<span class="info-ok">ONLINE</span>'}</li>
          <li>API do backend: <code>${esc(CONFIG.apiBaseUrl)}</code></li>
          <li>Versão do front-end: <code>2.0.0</code></li>
          <li>Armazenamento local: <code>localStorage</code> (chave <code>escola_horizonte_db_v2</code>)</li>
        </ul>
        <p class="form-hint" style="margin-top:10px;">Quando o backend do seu amigo estiver no ar: edite <code>js/config.js</code> → coloque a URL da API em <code>apiBaseUrl</code> e mude <code>useMockApi</code> para <code>false</code>. Nada mais precisa mudar.</p>
      </div>` : ''}

      <!-- ===== SOBRE ===== -->
      <div class="card">
        <h3>ℹ️ Sobre o site</h3>
        <p style="font-size:14px; color:var(--text-light); line-height:1.6;">
          <strong>${esc(CONFIG.schoolName)}</strong> — ${esc(CONFIG.schoolSlogan)}.<br>
          Portal com acesso para técnico de TI, professores, alunos e responsáveis.
          ${CONFIG.useMockApi ? 'Versão de demonstração com dados de exemplo salvos no navegador.' : 'Conectado ao servidor da escola.'}
        </p>
      </div>
    </div>`;
}

function applySchoolFormSettings(schoolName, schoolSlogan) {
  SchoolSettings.update({ schoolName: schoolName.trim(), schoolSlogan: schoolSlogan.trim() });
  renderApp();
  toast('Configurações da escola salvas!');
}

/* ============================================================
   EVENTOS DA TELA ATUAL
   ============================================================ */
function bindViewEvents() {
  // configurações: aparência
  document.querySelectorAll('[data-theme-choice]').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeChoice)));
  document.querySelectorAll('[data-accent-choice]').forEach(b => b.addEventListener('click', () => setAccent(b.dataset.accentChoice)));

  // configurações: sistema (técnico)
  const schoolForm = $('#school-settings-form');
  if (schoolForm) schoolForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    applySchoolFormSettings(fd.get('schoolName'), fd.get('schoolSlogan'));
  });
  const resetBtn = $('#reset-demo-data');
  if (resetBtn) resetBtn.addEventListener('click', async () => {
    if (!confirm('Tem certeza? Todas as alterações serão apagadas e os dados de exemplo serão restaurados.')) return;
    await API.resetDemoData();
    toast('Dados de exemplo restaurados. Recarregando...');
    setTimeout(() => location.reload(), 800);
  });

  // navegação interna (botões com data-nav dentro do conteúdo)
  document.querySelectorAll('#content [data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  // buscas
  const ts = $('#teacher-search');
  if (ts) ts.addEventListener('input', e => { state.teacherSearch = e.target.value; rerenderKeepFocus('teacher-search'); });
  const ss = $('#student-search');
  if (ss) ss.addEventListener('input', e => { state.studentSearch = e.target.value; rerenderKeepFocus('student-search'); });
  const gs = $('#grade-search');
  if (gs) gs.addEventListener('input', e => { state.gradeSearch = e.target.value; rerenderKeepFocus('grade-search'); });

  const gf = $('#grade-filter');
  if (gf) gf.addEventListener('change', e => { state.gradeFilter = e.target.value; renderView(); });
  const hf = $('#hour-filter');
  if (hf) hf.addEventListener('change', e => { state.hourFilter = e.target.value; renderView(); });

  // professores
  const atb = $('#add-teacher-btn');
  if (atb) atb.addEventListener('click', handleAddTeacher);
  document.querySelectorAll('[data-edit-teacher]').forEach(b => b.addEventListener('click', () => handleEditTeacher(b.dataset.editTeacher)));
  document.querySelectorAll('[data-dismiss-teacher]').forEach(b => b.addEventListener('click', () => handleDismissTeacher(b.dataset.dismissTeacher)));
  document.querySelectorAll('[data-readmit-teacher]').forEach(b => b.addEventListener('click', () => handleReadmitTeacher(b.dataset.readmitTeacher)));

  // alunos
  const asb = $('#add-student-btn');
  if (asb) asb.addEventListener('click', handleAddStudent);
  document.querySelectorAll('[data-edit-student]').forEach(b => b.addEventListener('click', () => handleEditStudent(b.dataset.editStudent)));
  document.querySelectorAll('[data-delete-student]').forEach(b => b.addEventListener('click', () => handleDeleteStudent(b.dataset.deleteStudent)));

  // notas
  const agb = $('#add-grade-btn');
  if (agb) agb.addEventListener('click', handleAddGrade);
  document.querySelectorAll('[data-edit-grade]').forEach(b => b.addEventListener('click', () => handleEditGrade(b.dataset.editGrade)));
  document.querySelectorAll('[data-extra-grade]').forEach(b => b.addEventListener('click', () => handleExtraGrade(b.dataset.extraGrade)));

  // horas
  const ahb = $('#add-hour-btn');
  if (ahb) ahb.addEventListener('click', handleAddHour);
  document.querySelectorAll('[data-approve-hour]').forEach(b => b.addEventListener('click', () => handleSetHourStatus(b.dataset.approveHour, 'aprovado')));
  document.querySelectorAll('[data-reject-hour]').forEach(b => b.addEventListener('click', () => handleSetHourStatus(b.dataset.rejectHour, 'rejeitado')));
}

async function rerenderKeepFocus(inputId) {
  const pos = document.activeElement?.selectionStart;
  await renderView();
  const el = document.getElementById(inputId);
  if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (_) {} }
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // aplica nome/slogan/tema salvos antes de desenhar a tela
  SchoolSettings.apply();

  // fechar modal clicando fora
  $('#modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') closeModal(); });
  $('#modal-cancel').addEventListener('click', closeModal);

  // Link do e-mail de autorização (?autorizar=TOKEN)
  const authToken = new URLSearchParams(window.location.search).get('autorizar');
  if (authToken) {
    // remove o token da barra de endereço (boa prática)
    try { window.history.replaceState(null, '', window.location.pathname); } catch (_) {}
    try {
      await API.approveAccess(authToken);
      // Se esta mesma aba estava aguardando, entra direto
      try {
        state.user = await API.claimSession(authToken);
        state.view = 'dashboard';
        renderApp();
        toast(`Bem-vindo(a), ${state.user.name.split(' ')[0]}! ✅ Entrada autorizada por e-mail.`);
      } catch (_) {
        renderAuthorizationResult(true);
      }
    } catch (err) {
      renderAuthorizationResult(false, err.message);
    }
    return;
  }

  state.user = await API.currentUser();
  if (state.user) renderApp();
  else renderLogin();
});
