alter table public.profiles drop constraint profiles_role_check;

alter table public.profiles add constraint profiles_role_check
  check (role = any (array['admin'::text, 'integration_team'::text, 'general_admin'::text, 'teacher'::text, 'developer'::text]));

create or replace function public."current_role"()
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select case when role = 'developer' then 'general_admin' else role end
    from public.profiles
   where id = auth.uid() and active;
$function$;
