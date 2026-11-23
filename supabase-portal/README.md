# Painel Supabase, sem Render

Painel estático independente do portal de demonstração. Usa Supabase Auth e a API PostgreSQL com chave pública; não usa PHP, Render, segredo de banco ou service role no navegador. A sessão fica apenas na memória da página. Permite consultar contagens e até 100 notas e editar seus valores; não inclui cadastro de alunos/notas nem integra as telas antigas.

As tabelas estão protegidas por RLS. A migração `politicas_admin.sql` foi aplicada no projeto escola-de-jegues e autoriza somente o UUID da conta indicada a consultar os dados e atualizar o valor de notas existentes. Se a conta for recriada, seu UUID muda e as políticas devem ser atualizadas. Não envie senhas no chat nem reutilize a senha antiga exposta.

Sirva esta pasta por HTTPS em hospedagem de arquivos estáticos; não abra `index.html` diretamente via `file://`. O Supabase fornece o banco e autenticação, mas este diretório precisa ser hospedado. As outras telas do projeto continuam demonstrativas e não estão conectadas. Em produção, acrescente auditoria, recuperação de senha, expiração/renovação de sessão e políticas para cada perfil antes de usar dados reais.
