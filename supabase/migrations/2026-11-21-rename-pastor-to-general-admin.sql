alter table public.profiles drop constraint profiles_role_check;

update public.profiles set role = 'general_admin' where role = 'pastor';

alter table public.profiles add constraint profiles_role_check
  check (role = any (array['admin'::text, 'integration_team'::text, 'general_admin'::text, 'teacher'::text]));

alter function public.mark_pastor_notes_private() rename to mark_general_admin_notes_private;

alter trigger pastoral_notes_private_for_pastors on public.pastoral_notes rename to pastoral_notes_private_for_general_admin;

do $migration$
declare
  r record;
begin
  for r in
    select p.oid
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.prokind = 'f'
       and (p.prosrc like '%''pastor''%' or p.prosrc like '%Só o pastor%')
  loop
    execute replace(
      replace(pg_get_functiondef(r.oid), 'Só o pastor pode', 'Só o Administrador Geral pode'),
      '''pastor''',
      '''general_admin'''
    );
  end loop;

  for r in
    select *
      from pg_policies
     where qual like '%''pastor''%' or with_check like '%''pastor''%' or policyname like '%pastor%'
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    execute format(
      'create policy %I on %I.%I as %s for %s to %s%s%s',
      replace(r.policyname, 'pastor', 'general_admin'),
      r.schemaname,
      r.tablename,
      lower(r.permissive),
      lower(r.cmd),
      (select string_agg(quote_ident(role_name), ', ') from unnest(r.roles) as role_name),
      case when r.qual is null then '' else ' using (' || replace(r.qual, '''pastor''', '''general_admin''') || ')' end,
      case when r.with_check is null then '' else ' with check (' || replace(r.with_check, '''pastor''', '''general_admin''') || ')' end
    );
  end loop;
end
$migration$;
