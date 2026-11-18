/* ============================================================
   DADOS DE EXEMPLO (MOCK)
   ============================================================
   Estes dados são usados enquanto o backend não está pronto.
   Quando a API for conectada, eles passam a vir do servidor
   e este arquivo pode ser ignorado.
   ============================================================ */

function seedDatabase() {
  return {
    // ---------- USUÁRIOS (login) ----------
    users: [
      { id: 'u-tecnico', name: 'Sr. Age',        email: 'sr.age@gmail.com',     password: '123456789',    role: 'tecnico',     title: 'Técnico de TI' },
      { id: 'u-tecnico2', name: 'Sr. Agente208', email: 'sr.agente208@gmail.com', password: 'Nicole@208',  role: 'tecnico',     title: 'Técnico de TI' },
      { id: 'u-prof1',   name: 'Ana Souza',       email: 'professor@escola.com', password: 'professor123', role: 'professor',   teacherId: 't1' },
      { id: 'u-prof2',   name: 'Bruno Lima',      email: 'bruno@escola.com',     password: 'professor123', role: 'professor',   teacherId: 't2' },
      { id: 'u-prof3',   name: 'Carla Dias',      email: 'carla@escola.com',     password: 'professor123', role: 'professor',   teacherId: 't3' },
      { id: 'u-prof4',   name: 'Diego Ramos',     email: 'diego@escola.com',     password: 'professor123', role: 'professor',   teacherId: 't4' },
      { id: 'u-prof5',   name: 'Elisa Prado',     email: 'elisa@escola.com',     password: 'professor123', role: 'professor',   teacherId: 't5' },
      { id: 'u-prof6',   name: 'Felipe Costa',    email: 'felipe@escola.com',    password: 'professor123', role: 'professor',   teacherId: 't6' },
      { id: 'u-aluno1',  name: 'Lucas Oliveira',  email: 'aluno@escola.com',     password: 'aluno123',     role: 'aluno',       studentId: 's1' },
      { id: 'u-pai1',    name: 'Mariana Oliveira',email: 'pai@escola.com',       password: 'pai123',       role: 'responsavel', studentIds: ['s1'] },
      { id: 'u-visitante', name: 'Visitante',      email: 'visitante@escola.local', password: '',           role: 'visitante',   title: 'Visitante' },
    ],

    // ---------- PROFESSORES ----------
    teachers: [
      { id: 't1', name: 'Ana Souza',   email: 'professor@escola.com', phone: '(11) 98765-0001', subject: 'Matemática',      hireDate: '2021-02-01', status: 'ativo',    classes: ['8º Ano A', '9º Ano B'] },
      { id: 't2', name: 'Bruno Lima',  email: 'bruno@escola.com',     phone: '(11) 98765-0002', subject: 'Português',       hireDate: '2020-03-10', status: 'ativo',    classes: ['8º Ano A'] },
      { id: 't3', name: 'Carla Dias',  email: 'carla@escola.com',     phone: '(11) 98765-0003', subject: 'Ciências',        hireDate: '2022-01-15', status: 'ativo',    classes: ['9º Ano B'] },
      { id: 't4', name: 'Diego Ramos', email: 'diego@escola.com',     phone: '(11) 98765-0004', subject: 'História',        hireDate: '2019-08-20', status: 'ativo',    classes: ['8º Ano A', '9º Ano B'] },
      { id: 't5', name: 'Elisa Prado', email: 'elisa@escola.com',     phone: '(11) 98765-0005', subject: 'Inglês',          hireDate: '2023-02-06', status: 'ativo',    classes: ['9º Ano B'] },
      { id: 't6', name: 'Felipe Costa',email: 'felipe@escola.com',    phone: '(11) 98765-0006', subject: 'Educação Física', hireDate: '2021-11-02', status: 'ativo',    classes: ['8º Ano A', '9º Ano B'] },
    ],

    // ---------- ALUNOS ----------
    students: [
      { id: 's1',  name: 'Lucas Oliveira',   className: '8º Ano A', guardianName: 'Mariana Oliveira', guardianEmail: 'pai@escola.com',   birthDate: '2012-05-14' },
      { id: 's2',  name: 'Beatriz Santos',   className: '8º Ano A', guardianName: 'Paulo Santos',     guardianEmail: 'paulo@escola.com', birthDate: '2012-09-03' },
      { id: 's3',  name: 'Gabriel Ferreira', className: '8º Ano A', guardianName: 'Juliana Ferreira', guardianEmail: 'juliana@escola.com', birthDate: '2011-12-22' },
      { id: 's4',  name: 'Alice Almeida',    className: '8º Ano A', guardianName: 'Roberto Almeida',  guardianEmail: 'roberto@escola.com', birthDate: '2012-03-30' },
      { id: 's5',  name: 'Rafael Souza',     className: '9º Ano B', guardianName: 'Fernanda Souza',   guardianEmail: 'fernanda@escola.com', birthDate: '2011-07-18' },
      { id: 's6',  name: 'Maria Clara Lima', className: '9º Ano B', guardianName: 'André Lima',       guardianEmail: 'andre@escola.com', birthDate: '2011-01-25' },
      { id: 's7',  name: 'João Pedro Rocha', className: '9º Ano B', guardianName: 'Camila Rocha',     guardianEmail: 'camila@escola.com', birthDate: '2011-10-08' },
      { id: 's8',  name: 'Sophia Mendes',    className: '9º Ano B', guardianName: 'Thiago Mendes',    guardianEmail: 'thiago@escola.com', birthDate: '2011-04-11' },
    ],

    // ---------- NOTAS ----------
    // b1 = 1º bimestre | b2 = 2º bimestre | extra = nota extra (atividade/prova extra)
    grades: [
      { id: 'g1',  studentId: 's1', subject: 'Matemática',      teacherId: 't1', b1: 8.5, b2: 9.0, extra: 10, observations: 'Excelente desempenho.' },
      { id: 'g2',  studentId: 's1', subject: 'Português',       teacherId: 't2', b1: 7.0, b2: 8.0, extra: 0,  observations: '' },
      { id: 'g3',  studentId: 's1', subject: 'Ciências',        teacherId: 't3', b1: 9.0, b2: 8.5, extra: 0,  observations: '' },
      { id: 'g4',  studentId: 's1', subject: 'História',        teacherId: 't4', b1: 6.5, b2: 7.5, extra: 8,  observations: 'Fez atividade extra.' },
      { id: 'g5',  studentId: 's1', subject: 'Inglês',          teacherId: 't5', b1: 8.0, b2: 7.5, extra: 0,  observations: '' },
      { id: 'g6',  studentId: 's1', subject: 'Educação Física', teacherId: 't6', b1: 10,  b2: 10,  extra: 0,  observations: '' },
      { id: 'g7',  studentId: 's2', subject: 'Matemática',      teacherId: 't1', b1: 6.0, b2: 7.0, extra: 0,  observations: '' },
      { id: 'g8',  studentId: 's2', subject: 'Português',       teacherId: 't2', b1: 8.5, b2: 9.0, extra: 0,  observations: '' },
      { id: 'g9',  studentId: 's3', subject: 'Matemática',      teacherId: 't1', b1: 4.5, b2: 5.0, extra: 0,  observations: 'Precisa de reforço.' },
      { id: 'g10', studentId: 's3', subject: 'Português',       teacherId: 't2', b1: 5.5, b2: 6.0, extra: 7,  observations: 'Atividade extra entregue.' },
      { id: 'g11', studentId: 's4', subject: 'Matemática',      teacherId: 't1', b1: 9.5, b2: 10,  extra: 0,  observations: '' },
      { id: 'g12', studentId: 's4', subject: 'Ciências',        teacherId: 't3', b1: 8.0, b2: 8.5, extra: 0,  observations: '' },
      { id: 'g13', studentId: 's5', subject: 'Matemática',      teacherId: 't1', b1: 7.5, b2: 8.0, extra: 0,  observations: '' },
      { id: 'g14', studentId: 's5', subject: 'História',        teacherId: 't4', b1: 6.0, b2: 6.5, extra: 0,  observations: '' },
      { id: 'g15', studentId: 's6', subject: 'Português',       teacherId: 't2', b1: 9.0, b2: 9.5, extra: 10, observations: 'Ótima redação.' },
      { id: 'g16', studentId: 's6', subject: 'Inglês',          teacherId: 't5', b1: 7.0, b2: 7.5, extra: 0,  observations: '' },
      { id: 'g17', studentId: 's7', subject: 'Matemática',      teacherId: 't1', b1: 5.0, b2: 5.5, extra: 0,  observations: '' },
      { id: 'g18', studentId: 's7', subject: 'Ciências',        teacherId: 't3', b1: 6.5, b2: 7.0, extra: 0,  observations: '' },
      { id: 'g19', studentId: 's8', subject: 'História',        teacherId: 't4', b1: 8.5, b2: 9.0, extra: 0,  observations: '' },
      { id: 'g20', studentId: 's8', subject: 'Educação Física', teacherId: 't6', b1: 9.0, b2: 9.5, extra: 0,  observations: '' },
    ],

    // ---------- BANCO DE HORAS ----------
    // type: aula | reuniao | extra | falta | atestado
    // status: pendente | aprovado | rejeitado
    hours: [
      { id: 'h1', teacherId: 't1', date: '2026-11-10', type: 'aula',    hours: 4, status: 'aprovado',  description: 'Aulas de Matemática — 8º Ano A' },
      { id: 'h2', teacherId: 't1', date: '2026-11-12', type: 'aula',    hours: 4, status: 'aprovado',  description: 'Aulas de Matemática — 9º Ano B' },
      { id: 'h3', teacherId: 't1', date: '2026-11-14', type: 'reuniao', hours: 2, status: 'pendente',  description: 'Reunião pedagógica' },
      { id: 'h4', teacherId: 't2', date: '2026-11-10', type: 'aula',    hours: 4, status: 'aprovado',  description: 'Aulas de Português — 8º Ano A' },
      { id: 'h5', teacherId: 't2', date: '2026-11-13', type: 'extra',   hours: 3, status: 'pendente',  description: 'Reforço escolar' },
      { id: 'h6', teacherId: 't3', date: '2026-11-11', type: 'aula',    hours: 4, status: 'aprovado',  description: 'Aulas de Ciências — 9º Ano B' },
      { id: 'h7', teacherId: 't3', date: '2026-11-15', type: 'falta',   hours: 4, status: 'rejeitado', description: 'Falta sem justificativa' },
      { id: 'h8', teacherId: 't4', date: '2026-11-12', type: 'aula',    hours: 4, status: 'pendente',  description: 'Aulas de História — 8º Ano A' },
      { id: 'h9', teacherId: 't5', date: '2026-11-10', type: 'aula',    hours: 2, status: 'aprovado',  description: 'Aulas de Inglês — 9º Ano B' },
      { id: 'h10',teacherId: 't6', date: '2026-11-11', type: 'aula',    hours: 4, status: 'aprovado',  description: 'Aulas de Ed. Física — 8º Ano A' },
    ],

    // ---------- TURMAS ----------
    classes: [
      { id: 'c1', name: '8º Ano A', teacherId: 't1', room: 'Sala 12', schedule: 'Seg–Sex, 7h30–12h' },
      { id: 'c2', name: '9º Ano B', teacherId: 't1', room: 'Sala 08', schedule: 'Seg–Sex, 7h30–12h' },
    ],
  };
}
