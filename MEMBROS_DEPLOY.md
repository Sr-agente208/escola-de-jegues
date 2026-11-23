# Área de membros: implantação

**Não publicar sem configurar o Render:** esta versão remove as contas de demonstração com senhas expostas. Sem as variáveis do Supabase, apenas o modo visitante estará disponível. O banco de membros já foi criado; a migração `membros_senha_hash` já foi aplicada no projeto existente. Não executar as migrações de novo.

## Render

Definir nas variáveis de ambiente do serviço, antes do deploy:

* `MEMBERS_MODE` = `true`
* `SUPABASE_URL` = `https://jikizafsbrclkfgoccha.supabase.co`
* `SUPABASE_SERVICE_ROLE_KEY` = chave `service_role` secreta do projeto Supabase (nunca chave publishable, nunca no navegador, chat ou Git)
* `PUBLIC_SITE_URL` = `https://escola-de-jegues.onrender.com`
* Manter `JWT_SECRET`, `GMAIL_SENDER`, `GMAIL_REFRESH_TOKEN`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` já configurados.

Configure a chave secreta diretamente no painel do Render. Ela concede acesso privilegiado ao projeto Supabase e deve ser protegida como senha. Antes de publicar, confirme que foram inseridas as quatro variáveis. Depois faça deploy, verifique a disponibilidade do site e teste o acesso com e-mail real.

## Primeiro acesso

O e-mail `sr.agente208@gmail.com` está cadastrado como técnico pendente. No site, ele deve escolher uma senha **nova e exclusiva**, com pelo menos 12 caracteres, e autorizar a tentativa no próprio e-mail. A aba do e-mail não abre sessão; a sessão é criada na aba que iniciou o login. Apenas aprove pedidos iniciados por você, especialmente na primeira ativação: o pedido define a senha informada na aba de login.

Depois, em **Membros**, técnicos e diretoria ativos podem cadastrar, alterar cargo e bloquear membros. Cada novo membro configura a própria senha no primeiro login, que requer confirmação no e-mail; o administrador precisa avisar o usuário para acessar o portal, pois o cadastro não dispara convite automaticamente. Mudanças de cargo e bloqueio são verificadas no servidor.

## Limitações

Os testes locais simulam o Supabase e o Gmail. É necessário testar o fluxo completo no Render após configurar os segredos. Os demais dados do portal (notas, banco de horas etc.) permanecem **dados de demonstração armazenados no navegador**, não integrados ao banco de notas. Não utilize dados escolares reais até implementar o controle de acesso desses dados no backend. Pedidos pendentes ficam no disco temporário da instância Render: um reinício invalida os pedidos em andamento. O limitador de tentativas é local ao processo e não substitui proteção contra ataques distribuídos em produção. Esta alteração não implementa recuperação ou troca de senha pelo usuário.
