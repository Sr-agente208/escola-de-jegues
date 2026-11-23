-- Migração aplicada ao projeto escola-de-jegues. O UUID identifica o usuário
-- administrador criado no Supabase Auth; substitua-o ao instalar em outro projeto.
GRANT SELECT ON public.alunos, public.professores, public.convidados, public.turmas, public.disciplinas, public.notas TO authenticated;
GRANT UPDATE (valor) ON public.notas TO authenticated;
CREATE POLICY admin_ler_alunos ON public.alunos FOR SELECT TO authenticated USING ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid);
CREATE POLICY admin_ler_professores ON public.professores FOR SELECT TO authenticated USING ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid);
CREATE POLICY admin_ler_convidados ON public.convidados FOR SELECT TO authenticated USING ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid);
CREATE POLICY admin_ler_turmas ON public.turmas FOR SELECT TO authenticated USING ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid);
CREATE POLICY admin_ler_disciplinas ON public.disciplinas FOR SELECT TO authenticated USING ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid);
CREATE POLICY admin_ler_notas ON public.notas FOR SELECT TO authenticated USING ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid);
CREATE POLICY admin_editar_valor_notas ON public.notas FOR UPDATE TO authenticated USING ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid) WITH CHECK ((select auth.uid()) = '316008e6-5406-4555-aad1-04dd82755012'::uuid);
