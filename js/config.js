/* ============================================================
   CONFIGURAÇÕES GERAIS DO SITE
   ============================================================
   👉 É AQUI QUE O SEU AMIGO VAI CONECTAR O BACKEND:
   basta trocar a URL abaixo pela URL da API dele e colocar
   useMockApi = false. Nenhum outro arquivo precisa mudar.
   ============================================================ */

const CONFIG = {
  // Nome da escola (aparece no topo do site e na tela de login)
  // Pode ser alterado na tela de Configurações (cargo Técnico)
  schoolName: 'Escola Horizonte',
  schoolSlogan: 'Educação que transforma',

  // 🏫 Informações públicas da escola (aparecem na aba "A escola" da tela de
  // login e para o modo Visitante). Edite aqui os dados reais da sua escola.
  schoolInfo: {
    about: 'A Escola Horizonte é referência em educação de qualidade, com foco no desenvolvimento acadêmico, social e emocional dos estudantes — da Educação Infantil ao Ensino Fundamental.',
    director: 'Sr. Age',
    address: 'R. das Palmeiras, 250 — Centro',
    phone: '(11) 3456-7890',
    email: 'secretaria@escolahorizonte.com.br',
    hours: 'Segunda a sexta, 7h às 18h',
    since: '1998',
  },

  // 🔌 URL DO BACKEND (API)
  // '' (vazio) = o backend serve o site e a API no MESMO endereço (backend/server.py)
  // Em produção separada: 'https://api.suaescola.com.br'
  apiBaseUrl: '',

  // false = dados e login vêm do servidor (backend/server.py)
  useMockApi: false,

  /* ---------- ENVIO DE E-MAIL DE AUTORIZAÇÃO ----------
     'backend' → e-mail ENVIADO PELO SERVIDOR via Gmail API (configuração atual).
     'mock'    → demonstração: o "e-mail" aparece simulado na tela, nada é enviado.
     'emailjs' → e-mail real direto do navegador via EmailJS (grátis). */
  mailProvider: 'backend',
  emailjs: {
    serviceId: '',   // ex.: 'service_abc123'
    templateId: '',  // ex.: 'template_xyz789'
    publicKey: '',   // ex.: 'aBcDeF...'
  },
  // Validade do link de autorização (em minutos)
  accessLinkMinutes: 10,
};

/* ============================================================
   CONFIGURAÇÕES VISUAIS (TEMA + NOME DA ESCOLA)
   ============================================================
   Salvas no navegador. No futuro, o backend pode enviar
   essas configurações junto com os dados da escola.
   ============================================================ */
const SETTINGS_KEY = 'escola_horizonte_settings';

const SchoolSettings = {
  load() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
    catch (_) { return {}; }
  },
  save(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
  apply() {
    const s = this.load();
    document.documentElement.dataset.theme = s.theme || 'light';
    document.documentElement.dataset.accent = s.accent || 'blue';
    if (s.schoolName) CONFIG.schoolName = s.schoolName;
    if (s.schoolSlogan) CONFIG.schoolSlogan = s.schoolSlogan;
    document.title = `${CONFIG.schoolName} — Portal da Escola`;
  },
  update(patch) {
    const current = this.load();
    this.save({ ...current, ...patch });
    this.apply();
  },
};
