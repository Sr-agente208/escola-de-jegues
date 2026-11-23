-- Migração já aplicada no projeto Supabase da Escola de Jegues.
-- Não execute novamente no mesmo banco. Esta é apenas a estrutura inicial;
-- a autenticação segura e a interface de administração ainda não foram integradas.
CREATE TABLE public.portal_membros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
  nome text NOT NULL CHECK (length(btrim(nome)) BETWEEN 1 AND 150),
  cargo text NOT NULL CHECK (cargo IN ('tecnico', 'diretoria', 'professor', 'aluno', 'responsavel')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'bloqueado')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);
ALTER TABLE public.portal_membros ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.portal_membros FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.portal_membros TO service_role;
INSERT INTO public.portal_membros (email, nome, cargo, status)
VALUES ('sr.agente208@gmail.com', 'Administrador', 'tecnico', 'pendente');
