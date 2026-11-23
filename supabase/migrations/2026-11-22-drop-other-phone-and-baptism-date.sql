drop function public.save_membership_answers(uuid, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, date, text, text[], text, uuid, text, text);
drop function public.submit_membership_form(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, date, text, text[], text, uuid, text, text, text);
drop function public.submit_membership_signup(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, date, text, text[], text, uuid, text, text, text);
drop function public.check_membership_interest_phone(text);

create function public.check_membership_interest_phone(p_phone text)
 RETURNS TABLE(person_name text, already_submitted boolean, lessons_attended integer, lessons_total integer, email text, birth_date text, gender text, cpf text, marital_status text, address_zip text, address_street text, address_number text, address_complement text, address_neighborhood text, address_city text, address_state text, entry_type text, baptism_church text, origin_church text, previous_church text, baptism_info text, marital_status_story text, ministry_interests text[], wants_small_group text, small_group_id text, secret_society text, membership_note text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_person_id uuid;
begin
  v_person_id := public.find_membership_interest_person(p_phone);

  return query
    select p.name,
           p.membership_form_at is not null,
           g.lessons_attended,
           g.lessons_total,
           coalesce(p.email, ''),
           coalesce(s.birth_date::text, ''),
           coalesce(m.gender, ''),
           coalesce(m.cpf, ''),
           coalesce(m.marital_status, ''),
           coalesce(m.address_zip, ''),
           coalesce(m.address_street, ''),
           coalesce(m.address_number, ''),
           coalesce(m.address_complement, ''),
           coalesce(m.address_neighborhood, ''),
           coalesce(m.address_city, ''),
           coalesce(m.address_state, ''),
           coalesce(p.entry_type, ''),
           coalesce(m.baptism_church, ''),
           coalesce(s.origin_church, ''),
           coalesce(s.previous_church, ''),
           coalesce(s.baptism_info, ''),
           coalesce(s.marital_status_story, ''),
           coalesce(s.ministry_interests, '{}'),
           coalesce(s.wants_small_group, ''),
           coalesce(
             (select l.small_group_id::text
                from public.person_small_groups l
               where l.person_id = p.id
               order by l.created_at
               limit 1),
             ''
           ),
           coalesce(s.secret_society, ''),
           coalesce(s.membership_note, '')
      from public.people p
      cross join public.membership_lesson_progress(p.id) g
      left join public.member_profiles m on m.person_id = p.id
      left join public.person_sensitive s on s.person_id = p.id
      where p.id = v_person_id;
end;
$function$;

revoke all on function public.check_membership_interest_phone(text) from public, anon, authenticated;
grant execute on function public.check_membership_interest_phone(text) to anon;
grant execute on function public.check_membership_interest_phone(text) to authenticated;
grant execute on function public.check_membership_interest_phone(text) to service_role;

create or replace view public.membership_alerts with (security_invoker=true) as
 SELECT p.id AS person_id,
    alert.code,
    alert.answer,
    (r.resolved_at IS NOT NULL) AS resolved
   FROM ((((people p
     JOIN person_sensitive s ON ((s.person_id = p.id)))
     LEFT JOIN member_profiles m ON ((m.person_id = p.id)))
     CROSS JOIN LATERAL ( VALUES ('secret_society'::text,s.secret_society,(btrim(regexp_replace(lower(btrim(COALESCE(s.secret_society, ''::text))), '[.!]+$'::text, ''::text)) <> ALL (ARRAY[''::text, 'não'::text, 'nao'::text]))), ('baptism'::text,s.baptism_info,((p.entry_type IS DISTINCT FROM 'baptism'::text) AND (btrim(COALESCE(m.baptism_church, ''::text)) = ''::text) AND (btrim(COALESCE(s.baptism_info, ''::text)) = ''::text)))) alert(code, answer, applies))
     LEFT JOIN membership_alert_resolutions r ON (((r.person_id = p.id) AND (r.code = alert.code))))
  WHERE (alert.applies AND (p.origin <> 'imported'::text) AND (p.status = ANY (ARRAY['membership_pending'::text, 'member'::text])));

alter table public.member_profiles drop column other_phone, drop column baptism_date;
