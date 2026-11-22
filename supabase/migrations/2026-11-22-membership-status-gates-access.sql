create or replace function public.current_profile()
 returns table(id uuid, name text, role text)
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select pr.id, p.name, pr.role
    from public.profiles pr
    join public.people p on p.id = pr.person_id
   where pr.id = auth.uid() and p.membership_status = 'active';
$function$;

create or replace function public."current_role"()
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select case when pr.role = 'developer' then 'general_admin' else pr.role end
    from public.profiles pr
    join public.people p on p.id = pr.person_id
   where pr.id = auth.uid() and p.membership_status = 'active';
$function$;

do $migration$
begin
  execute replace(
    pg_get_functiondef('public.team_contacts(text)'::regprocedure),
    'and pr.active',
    'and pe.membership_status = ''active'''
  );
  execute replace(
    pg_get_functiondef('public.guard_profile_privileges()'::regprocedure),
    'new.role is not distinct from old.role and new.active is not distinct from old.active',
    'new.role is not distinct from old.role'
  );
end
$migration$;
