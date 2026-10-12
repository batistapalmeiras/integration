revoke execute on function public.archive_missed_welcome_coffee() from anon, public;
revoke execute on function public.find_welcome_coffee_person(text) from anon, public;
revoke execute on function public.find_membership_interest_person(text) from anon, public;
revoke execute on function public.membership_lesson_progress(uuid) from anon, public;
revoke execute on function public.promote_membership_on_attendance() from anon, public;
revoke execute on function public.mark_coffee_attended(uuid, uuid, uuid) from anon;

grant execute on function public.mark_coffee_attended(uuid, uuid, uuid) to authenticated;
grant execute on function public."current_role"() to authenticated, anon;

select p.proname, r.grantee
from information_schema.routine_privileges r
join pg_proc p on p.proname = r.routine_name
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where r.routine_schema = 'public' and r.grantee in ('anon', 'PUBLIC')
order by p.proname, r.grantee;
