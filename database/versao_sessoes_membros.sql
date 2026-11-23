-- Aplicada no projeto Supabase como versao_sessoes_membros; não executar novamente.
-- Uma atualização do número de versão invalida pedidos e sessões anteriores.
ALTER TABLE public.portal_membros ADD COLUMN session_version bigint NOT NULL DEFAULT 1 CHECK (session_version > 0);
