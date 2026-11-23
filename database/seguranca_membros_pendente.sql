-- Aplicada no Supabase como membros_senha_hash. Não execute novamente.
ALTER TABLE public.portal_membros ADD COLUMN password_hash text;
-- A tabela já tem RLS habilitada e acesso bloqueado para anon/authenticated.
-- Não salvar senhas em texto puro ou distribuir a service_role no navegador.
