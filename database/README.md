> **Configuração escolhida: Supabase/PostgreSQL no Render.** A conexão PHP agora usa `pdo_pgsql` e o esquema `supabase.sql`. Consulte [SUPABASE_RENDER.md](SUPABASE_RENDER.md). As seções MySQL abaixo são documentação da implementação anterior; o menu de administração Python também usa PostgreSQL/Supabase.

# Banco de notas e conexão PHP

Este módulo é separado do backend Python e do armazenamento em `localStorage` do site. Ele **não conecta automaticamente o portal existente ao banco**, nem cria endpoints HTTP ou autenticação. Não exponha `conexao.php` ou `notas.php` como API pública: as funções precisam ser chamadas por um backend que autentique usuários e autorize cada operação (professor/turma, aluno e responsável). Convidados não recebem acesso a notas.

## Requisitos e instalação

- MySQL 8.0.16+ ou MariaDB 10.2.1+, PHP 7.4+ com `pdo_mysql`.
- Crie um banco vazio `escola_notas` e um usuário próprio com privilégios mínimos apropriados, usando uma conta administradora. Importe uma única vez (o script não apaga tabelas existentes):

```sh
mysql -u ADMIN -p escola_notas < database/schema.sql
```

- Configure no ambiente do processo PHP (ou no gerenciador de segredos do servidor), sem colocar senhas no código ou no Git: `DB_HOST`, `DB_PORT` (opcional, padrão 3306), `DB_NAME`, `DB_USER` e `DB_PASSWORD`. O usuário da aplicação precisa de `SELECT` na view e nas tabelas necessárias e `INSERT` em `notas`; atribua outros privilégios somente se implementar outras operações. Em produção, use conexão de banco protegida por TLS e restrinja acesso de rede; configure TLS no ambiente/driver conforme seu provedor.

## Uso no servidor PHP

```php
require_once __DIR__ . '/backend/php/notas.php';
$pdo = conectarBanco();
// Após autenticar e verificar a permissão do usuário:
$boletim = buscarBoletim($pdo, 1);
// Após autorizar o professor para a turma:
$idNota = lancarNota($pdo, 1, 1, 1, 1, 8.5);
```

Cadastre previamente turma, aluno, professor e disciplina e associe-os em `turmas_disciplinas`. Cada aluno tem uma turma atual; há uma nota por aluno, disciplina e bimestre (1 a 4), entre 0 e 10. Duplicatas causam erro do banco. O lançamento valida a atribuição atual de professor e disciplina à turma, mas isso **não substitui autorização**. O boletim é uma view calculada com a média simples das notas lançadas; disciplinas sem notas não aparecem. Não há histórico de matrícula por ano: mudar a turma do aluno altera a turma exibida no boletim. Para produção, implemente histórico de matrículas, permissões, edição de notas e tratamento seguro de erros antes de integrar o portal. Não exiba exceções ou credenciais aos usuários.

## Administração no portal Python (instruções antigas para MySQL)

A conta técnica `u-tecnico2` possui o menu **Banco de dados** no modo backend: ele mostra contagens e até 100 notas recentes e permite editar o valor de uma nota existente. O servidor verifica a sessão dessa conta e uma chave adicional em todas as requisições; o menu por si só não é uma barreira de segurança. Não há SQL arbitrário, exclusão ou gestão de outras tabelas nessa interface.

Instale `pip install -r requirements.txt` e configure no ambiente do processo Python `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL_CA` (caminho do certificado CA do MySQL) e `DB_ADMIN_SECRET` (segredo aleatório independente com pelo menos 32 caracteres). Para desenvolvimento **apenas com banco local**, `DB_LOCAL_INSECURE=1` desativa TLS. A conta do banco precisa de SELECT nas tabelas usadas e UPDATE em `notas`. Informe a chave de administração no menu; ela não é salva no navegador. Use HTTPS e não compartilhe essa chave.

O login atual e os dados do portal são de demonstração: há senhas conhecidas no código e o fluxo de autenticação não é adequado para dados reais. Troque as credenciais expostas, implemente autenticação segura, limitação de tentativas e auditoria antes de usar em produção. Este recurso acessa o MySQL acima, não o localStorage nem o Supabase; não sincroniza os dados do portal.

## Instalar e verificar a conexão PHP

No servidor onde o PHP será executado, instale o PHP CLI e a extensão PDO MySQL. Por exemplo, em Debian/Ubuntu:

```sh
sudo apt update
sudo apt install php-cli php-mysql
php -m | grep -i pdo_mysql
```

Crie o banco e importe `schema.sql` conforme as instruções acima. Configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` no ambiente do servidor, usando seu gerenciador de segredos (não os envie por chat e não os coloque no repositório). Em seguida execute, a partir da raiz do projeto:

```sh
php backend/php/verificar_conexao.php
```

O diagnóstico verifica a conexão e o acesso à view `boletim`, sem mostrar credenciais ou dados dos alunos. A conexão PHP é uma biblioteca para uso no servidor: a configuração atual do Render executa **Python**, não PHP, e o portal continua usando seus dados de demonstração. Instalar PHP por si só não integra essas telas ao banco. O esquema é MySQL/MariaDB; Supabase usa PostgreSQL e não pode ser conectado diretamente usando este driver ou esquema sem adaptação.

### Arquivo principal PHP

Use `backend/php/banco.php` como ponto de entrada no seu código PHP do servidor:

```php
require_once __DIR__ . '/backend/php/banco.php';
$pdo = conectarBanco();
```

Esse arquivo carrega a conexão e as funções de notas sem abrir uma conexão automaticamente. O caminho do `require_once` acima supõe que o arquivo que o chama está na raiz do projeto. Mantenha o diretório PHP fora da pasta pública do servidor e faça autenticação e autorização antes de acessar dados escolares.
