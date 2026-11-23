# PHP + Supabase no Render

## Estado atual

O projeto Supabase `escola-de-jegues` recebeu a migração `criar_sistema_notas`; as tabelas e a view foram verificadas. O arquivo `supabase.sql` documenta o esquema aplicado. Não o execute novamente no mesmo projeto nem em um banco com tabelas de mesmo nome sem revisar conflitos e backups. Não envie senhas pelo chat.

## Banco

1. A migração já foi aplicada ao projeto `escola-de-jegues`; para outros projetos vazios, aplique `database/supabase.sql` uma única vez.
2. As tabelas têm RLS habilitada e não há permissões para `anon` ou `authenticated`: o cliente web não consegue acessar dados escolares. A conexão PHP é apenas servidor a servidor. Para produção, crie um usuário de banco dedicado, com os privilégios e políticas mínimos necessários, e implemente autorização por usuário antes de servir dados.
3. Em **Connect** no Supabase, escolha o pooler de sessão compatível com IPv4 do Render, se necessário. Anote host, porta, nome do banco e usuário; coloque a senha diretamente no painel do Render. Não use a chave pública da API como senha PostgreSQL.

## Render

O `Dockerfile` instala PHP CLI, `pdo_pgsql` e Python. O `render.yaml` usa esse Dockerfile e mantém o servidor Python como processo web. Ao criar/atualizar o serviço pelo Blueprint, configure no painel do Render as variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` com os dados do Supabase. Preencha também as variáveis existentes de e-mail quando desejar usar o login do portal. Se já existe serviço Python, a alteração para Docker pode exigir recriar ou reconfigurar o serviço no painel: revise antes de aplicar.

A conexão exige TLS `verify-full` e usa `/etc/ssl/certs/ca-certificates.crt` como CA. Se o provedor exigir outra CA, disponibilize um arquivo de CA confiável no servidor e defina `DB_SSL_ROOT_CERT` com seu caminho. Não desative a verificação TLS em produção.

Para testar em um ambiente com PHP e `pdo_pgsql`, execute com as mesmas variáveis de ambiente configuradas:

```sh
php backend/php/verificar_conexao.php
```

O diagnóstico verifica a conexão e o acesso à view sem imprimir credenciais. Se o seu plano do Render não oferecer acesso ao shell, execute o diagnóstico localmente em ambiente seguro ou num ambiente que ofereça shell; não exponha esse teste como endpoint público.

## Limitações importantes

O PHP instalado no contêiner é uma biblioteca/ferramenta CLI, não uma API HTTP. O site e a autenticação continuam executando em Python e os dados escolares do portal continuam em `localStorage`. A tela de administração consulta o mesmo PostgreSQL do Supabase por meio do servidor Python: configure também `DB_ADMIN_SECRET` no Render com uma chave independente e aleatória de pelo menos 32 caracteres. A conta técnica indicada deve informar essa chave no menu para consultar contagens e as 100 notas mais recentes e editar valores existentes. O banco deve conceder SELECT nas tabelas usadas e UPDATE em `notas` ao usuário configurado. Essa tela não cadastra alunos ou notas nem substitui as outras telas do portal. A autenticação existente é demonstrativa, com senhas conhecidas: não use para dados reais até implementar autenticação, autorização e auditoria adequadas. O schema atual não preserva histórico de matrícula ao trocar de turma.
