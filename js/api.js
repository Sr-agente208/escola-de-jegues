/* ============================================================
   CAMADA DE API — PONTO DE CONEXÃO COM O BACKEND
   ============================================================
   Hoje esta camada usa dados de exemplo salvos no navegador
   (localStorage). Quando o backend estiver pronto, basta
   substituir o corpo de cada método pelos `fetch()` mostrados
   nos comentários — o resto do site NÃO precisa mudar.

   Endpoints esperados no backend (veja o README.md):
     POST   /auth/login
     GET    /teachers          POST   /teachers
     PUT    /teachers/:id      DELETE /teachers/:id   (demitir)
     GET    /students          POST   /students
     PUT    /students/:id      DELETE /students/:id
     GET    /grades            PUT    /grades/:id
     POST   /grades/:id/extra  (nota extra)
     GET    /hours             POST   /hours
     PATCH  /hours/:id/status  (aprovar/rejeitar)
   ============================================================ */

const DB_KEY = 'escola_horizonte_db_v2';
const SESSION_KEY = 'escola_horizonte_session';
const PENDING_KEY = 'escola_horizonte_pending_v1';

function loadDB() {
  let raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = seedDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  return JSON.parse(raw);
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function uid(prefix) {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/* ---------- AUTORIZAÇÃO DE ACESSO POR E-MAIL (link mágico) ---------- */

// Lista de pedidos de acesso aguardando o "Sim" do e-mail.
// No modo demonstração, fica no localStorage. No backend real,
// vira uma tabela de tokens com expiração.
function loadPending() {
  try {
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    const now = Date.now();
    // remove expirados
    return list.filter(p => p.expiresAt > now);
  } catch (_) { return []; }
}
function savePending(list) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}
function buildMagicLink(token) {
  const base = (location.origin && location.origin !== 'null') ? location.origin + location.pathname : location.href.split('?')[0];
  return `${base}?autorizar=${encodeURIComponent(token)}`;
}
// Validação compartilhada de credenciais (login direto e pedido de acesso)
function validateCredentials(email, password) {
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
  if (!user) throw new Error('E-mail ou senha incorretos.');
  if (user.role === 'professor') {
    const teacher = db.teachers.find(t => t.id === user.teacherId);
    if (teacher && teacher.status === 'demitido') throw new Error('Este usuário foi desligado da escola.');
  }
  return user;
}
// Chamada genérica ao servidor (modo backend)
const BACKEND_TOKEN_KEY = 'escola_horizonte_backend_token';
async function backendRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${CONFIG.apiBaseUrl}${path}`, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) throw new Error((data && data.message) || `Erro no servidor (${res.status}).`);
  return data;
}

// Envia o e-mail de autorização. Retorna 'emailjs' se enviou de verdade, ou 'mock' se é simulação.
async function sendAccessEmail(user, magicLink) {
  if (CONFIG.mailProvider === 'emailjs' && CONFIG.emailjs.serviceId && CONFIG.emailjs.templateId && CONFIG.emailjs.publicKey) {
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Não foi possível carregar o serviço de e-mail (EmailJS).'));
        document.head.appendChild(s);
      });
    }
    await window.emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
      to_name: user.name,
      to_email: user.email,
      magic_link: magicLink,
      school_name: CONFIG.schoolName,
    }, { publicKey: CONFIG.emailjs.publicKey });
    return 'emailjs';
  }
  // modo mock (demonstração): nada é enviado de verdade; o site mostra a simulação
  return 'mock';
}

/* Exemplo de como ficará cada chamada quando o backend existir:
   const res = await fetch(`${CONFIG.apiBaseUrl}/teachers`, {
     headers: { Authorization: `Bearer ${token}` }
   });
   return res.json();
*/

const API = {
  /* ---------- AUTENTICAÇÃO ---------- */
  async login(email, password) {
    // TODO backend: POST /auth/login  →  { token, user }
    // Obs.: o fluxo do site usa requestAccess() (e-mail de autorização).
    // Este método direto fica mantido como fallback/compatibilidade.
    const user = validateCredentials(email, password);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return user;
  },

  // 1º passo: valida as credenciais e cria o pedido de acesso (SEM abrir sessão)
  async requestAccess(email, password) {
    if (CONFIG.mailProvider === 'backend') {
      // O servidor valida, gera os tokens, salva no banco e ENVIA O E-MAIL via Gmail API
      const d = await backendRequest('/auth/request-access', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return { email: d.email, name: d.name, token: d.pollToken, sentVia: 'backend', expiresInMinutes: d.expiresInMinutes || 10 };
    }
    const user = validateCredentials(email, password);
    const minutes = CONFIG.accessLinkMinutes || 10;
    const token = uid('auth');
    const entry = {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + minutes * 60 * 1000,
      approved: false,
      denied: false,
    };
    const list = loadPending().filter(p => p.userId !== user.id);
    list.push(entry);
    savePending(list);
    const magicLink = buildMagicLink(token);
    const sentVia = await sendAccessEmail(user, magicLink);
    return { email: user.email, name: user.name, token, magicLink, sentVia, expiresInMinutes: minutes };
  },

  // consulta o status de um pedido (a tela de espera fica perguntando a cada 2s)
  async checkAccess(token) {
    if (CONFIG.mailProvider === 'backend') {
      const d = await backendRequest(`/auth/access/${encodeURIComponent(token)}`);
      return d.status;
    }
    const entry = loadPending().find(p => p.token === token);
    if (!entry) return 'expirado';
    if (entry.denied) return 'rejeitado';
    if (entry.approved) return 'aprovado';
    return 'pendente';
  },

  // 2º passo (clique em "Sim" no e-mail): marca o pedido como autorizado
  async approveAccess(token) {
    if (CONFIG.mailProvider === 'backend') {
      await backendRequest(`/auth/access/${encodeURIComponent(token)}/approve`, { method: 'POST' });
      return { approved: true };
    }
    const list = loadPending();
    const entry = list.find(p => p.token === token);
    if (!entry) throw new Error('Link de autorização inválido ou expirado.');
    entry.approved = true;
    savePending(list);
    return entry;
  },

  async denyAccess(token) {
    if (CONFIG.mailProvider === 'backend') {
      try { await backendRequest(`/auth/access/${encodeURIComponent(token)}/deny`, { method: 'POST' }); } catch (_) {}
      return { denied: true };
    }
    const list = loadPending();
    const entry = list.find(p => p.token === token);
    if (!entry) return null;
    entry.denied = true;
    savePending(list);
    return entry;
  },

  // 3º passo: pedido aprovado → cria a sessão e entra no site (token de uso único)
  async claimSession(token) {
    if (CONFIG.mailProvider === 'backend') {
      const d = await backendRequest('/auth/claim', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      localStorage.setItem(BACKEND_TOKEN_KEY, d.token);
      return d.user;
    }
    const list = loadPending();
    const entry = list.find(p => p.token === token);
    if (!entry) throw new Error('Link de autorização inválido ou expirado.');
    if (entry.denied) throw new Error('Entrada recusada no e-mail.');
    if (!entry.approved) throw new Error('Ainda não autorizado. Clique em "Sim" no e-mail.');
    const db = loadDB();
    const user = db.users.find(u => u.id === entry.userId);
    if (!user) throw new Error('Usuário não encontrado.');
    // token de uso único: remove após o uso
    savePending(list.filter(p => p.token !== token));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return user;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(BACKEND_TOKEN_KEY);
  },

  async currentUser() {
    if (CONFIG.mailProvider === 'backend') {
      const token = localStorage.getItem(BACKEND_TOKEN_KEY);
      if (!token) return null;
      try {
        const d = await backendRequest('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        return d.user;
      } catch (_) {
        localStorage.removeItem(BACKEND_TOKEN_KEY);
        return null;
      }
    }
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!session) return null;
    const db = loadDB();
    return db.users.find(u => u.id === session.userId) || null;
  },

  /* ---------- PROFESSORES ---------- */
  async getTeachers() {
    // TODO backend: GET /teachers
    return loadDB().teachers;
  },

  async createTeacher(data) {
    // TODO backend: POST /teachers  (cria o professor + conta de login)
    const db = loadDB();
    const teacher = { id: uid('t'), status: 'ativo', classes: [], ...data };
    db.teachers.push(teacher);
    db.users.push({
      id: uid('u'), name: data.name, email: data.email,
      password: data.password || 'professor123', role: 'professor', teacherId: teacher.id,
    });
    saveDB(db);
    return teacher;
  },

  async updateTeacher(id, data) {
    // TODO backend: PUT /teachers/:id
    const db = loadDB();
    const teacher = db.teachers.find(t => t.id === id);
    if (!teacher) throw new Error('Professor não encontrado.');
    Object.assign(teacher, data);
    const user = db.users.find(u => u.teacherId === id);
    if (user) {
      user.name = data.name ?? user.name;
      user.email = data.email ?? user.email;
      if (data.password) user.password = data.password;
    }
    saveDB(db);
    return teacher;
  },

  async dismissTeacher(id) {
    // TODO backend: DELETE /teachers/:id  (ou PATCH /teachers/:id/dismiss)
    const db = loadDB();
    const teacher = db.teachers.find(t => t.id === id);
    if (!teacher) throw new Error('Professor não encontrado.');
    teacher.status = 'demitido';
    saveDB(db);
    return teacher;
  },

  async readmitTeacher(id) {
    // TODO backend: PATCH /teachers/:id/readmit
    const db = loadDB();
    const teacher = db.teachers.find(t => t.id === id);
    if (teacher) teacher.status = 'ativo';
    saveDB(db);
    return teacher;
  },

  /* ---------- ALUNOS ---------- */
  async getStudents() {
    // TODO backend: GET /students
    return loadDB().students;
  },

  async createStudent(data) {
    // TODO backend: POST /students
    const db = loadDB();
    const student = { id: uid('s'), ...data };
    db.students.push(student);
    saveDB(db);
    return student;
  },

  async updateStudent(id, data) {
    // TODO backend: PUT /students/:id
    const db = loadDB();
    const student = db.students.find(s => s.id === id);
    if (!student) throw new Error('Aluno não encontrado.');
    Object.assign(student, data);
    saveDB(db);
    return student;
  },

  async deleteStudent(id) {
    // TODO backend: DELETE /students/:id
    const db = loadDB();
    db.students = db.students.filter(s => s.id !== id);
    db.grades = db.grades.filter(g => g.studentId !== id);
    saveDB(db);
  },

  /* ---------- NOTAS ---------- */
  async getGrades() {
    // TODO backend: GET /grades
    return loadDB().grades;
  },

  async updateGrade(id, data) {
    // TODO backend: PUT /grades/:id
    const db = loadDB();
    const grade = db.grades.find(g => g.id === id);
    if (!grade) throw new Error('Nota não encontrada.');
    Object.assign(grade, data);
    saveDB(db);
    return grade;
  },

  async addExtraGrade(id, extraValue, observations) {
    // TODO backend: POST /grades/:id/extra  { extra, observations }
    const db = loadDB();
    const grade = db.grades.find(g => g.id === id);
    if (!grade) throw new Error('Nota não encontrada.');
    grade.extra = extraValue;
    if (observations) grade.observations = observations;
    saveDB(db);
    return grade;
  },

  async createGrade(data) {
    // TODO backend: POST /grades
    const db = loadDB();
    const grade = { id: uid('g'), b1: 0, b2: 0, extra: 0, observations: '', ...data };
    db.grades.push(grade);
    saveDB(db);
    return grade;
  },

  /* ---------- BANCO DE HORAS ---------- */
  async getHours() {
    // TODO backend: GET /hours
    return loadDB().hours;
  },

  async createHour(data) {
    // TODO backend: POST /hours
    const db = loadDB();
    const entry = { id: uid('h'), status: 'pendente', ...data };
    db.hours.push(entry);
    saveDB(db);
    return entry;
  },

  async setHourStatus(id, status) {
    // TODO backend: PATCH /hours/:id/status  { status }
    const db = loadDB();
    const entry = db.hours.find(h => h.id === id);
    if (!entry) throw new Error('Registro não encontrado.');
    entry.status = status;
    saveDB(db);
    return entry;
  },

  /* ---------- TURMAS ---------- */
  async getClasses() {
    // TODO backend: GET /classes
    return loadDB().classes;
  },

  /* ---------- TÉCNICO: MANUTENÇÃO ---------- */
  async resetDemoData() {
    // TODO backend: este método é só para demonstração — remove no backend real.
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(PENDING_KEY);
  },
};
