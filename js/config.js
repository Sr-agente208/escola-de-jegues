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

  // 🔌 URL DO BACKEND (API) — será preenchida pelo seu amigo
  // Exemplo: 'https://api.escolahorizonte.com.br' ou 'http://localhost:3000'
  apiBaseUrl: 'http://localhost:3000/api',

  // Enquanto o backend não está pronto, o site usa dados de exemplo
  // salvos no navegador (localStorage). Quando a API estiver pronta,
  // mude para false e o site passa a buscar tudo do servidor.
  useMockApi: true,

  /* ---------- ENVIO DE E-MAIL DE AUTORIZAÇÃO ----------
     'mock'    → demonstração: o "e-mail" aparece simulado na tela (padrão, funciona já)
     'emailjs' → e-mail DE VERDADE enviado do navegador via EmailJS (grátis, emailjs.com).
                 Preencha as 3 chaves abaixo (crie uma conta, um serviço Gmail
                 e um template com as variáveis {{to_name}}, {{magic_link}}, {{school_name}}).
     'backend' → e-mail enviado pelo backend (Gmail API, escopo gmail.send).
                 Quando o backend do seu amigo estiver no ar, use esta opção —
                 a validação do link passa a ser feita no servidor (segura e cross-device). */
  mailProvider: 'mock',
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
