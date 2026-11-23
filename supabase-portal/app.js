'use strict';
// Chave pública: as políticas RLS, e não esta chave, protegem os dados.
const url = 'https://jikizafsbrclkfgoccha.supabase.co';
const chave = 'sb_publishable_Cq2BWkiQP5fLu6z9J-403g_REk8WCPd';
let token = null;
const login = document.querySelector('#login'), painel = document.querySelector('#painel');
const status = document.querySelector('#status');
async function api(path, options = {}) {
  const resposta = await fetch(url + path, { ...options, headers: {
    apikey: chave, Authorization: `Bearer ${token || chave}`,
    'Content-Type': 'application/json', ...options.headers
  }});
  if (!resposta.ok) throw new Error(resposta.status === 401 ? 'Sessão inválida ou expirada.' : 'Não foi possível acessar os dados. Confira sua permissão.');
  return resposta;
}
async function carregar() {
  const totais = document.querySelector('#totais');
  const lista = document.querySelector('#notas');
  totais.replaceChildren(); lista.replaceChildren();
  for (const tabela of ['alunos', 'professores', 'convidados', 'turmas', 'disciplinas', 'notas']) {
    const resposta = await api(`/rest/v1/${tabela}?select=*&limit=1`, {headers: {Prefer: 'count=exact'}});
    const total = resposta.headers.get('content-range')?.split('/')[1] || '?';
    const linha = document.createElement('p'); linha.textContent = `${tabela}: ${total}`; totais.append(linha);
  }
  const resposta = await api('/rest/v1/notas?select=id_nota,id_aluno,id_disciplina,bimestre,valor&order=id_nota.desc&limit=100');
  const notas = await resposta.json();
  if (!notas.length) lista.textContent = 'Nenhuma nota cadastrada.';
  notas.forEach(nota => {
    const form = document.createElement('form'); form.className = 'nota';
    const label = document.createElement('label'); label.textContent = `Nota ${nota.id_nota} · aluno ${nota.id_aluno} · disciplina ${nota.id_disciplina} · ${nota.bimestre}º bimestre`;
    const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.max = '10'; input.step = '0.01'; input.required = true; input.value = nota.valor;
    const salvar = document.createElement('button'); salvar.textContent = 'Salvar'; label.append(input); form.append(label, salvar); lista.append(form);
    form.addEventListener('submit', async e => { e.preventDefault(); status.textContent = '';
      try {
        const resultado = await api(`/rest/v1/notas?id_nota=eq.${encodeURIComponent(nota.id_nota)}&select=id_nota`, {method: 'PATCH', headers: {Prefer: 'return=representation'}, body: JSON.stringify({valor: Number(input.value)})});
        if (!(await resultado.json()).length) throw new Error('Nota não atualizada. Confira suas permissões.');
        status.textContent = 'Nota atualizada.';
      } catch (erro) { status.textContent = erro.message; }
    });
  });
}
login.addEventListener('submit', async e => {
  e.preventDefault(); status.textContent = ''; const dados = new FormData(login);
  try {
    const resposta = await api('/auth/v1/token?grant_type=password', {method: 'POST', body: JSON.stringify({email: dados.get('email'), password: dados.get('senha')})});
    const sessao = await resposta.json(); token = sessao.access_token; login.reset();
    await carregar(); login.hidden = true; painel.hidden = false;
  } catch (erro) { token = null; status.textContent = erro.message; }
});
document.querySelector('#sair').addEventListener('click', async () => {
  try { await api('/auth/v1/logout', {method: 'POST'}); } catch (_) {}
  token = null; painel.hidden = true; login.hidden = false; document.querySelector('#totais').replaceChildren(); document.querySelector('#notas').replaceChildren(); status.textContent = '';
});
