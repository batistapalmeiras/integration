create or replace function public.find_welcome_coffee_person(p_phone text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_digits      text := regexp_replace(p_phone, '\D', '', 'g');
  v_match_count int;
  v_person_id   uuid;
begin
  select count(*) into v_match_count
    from public.people
    where regexp_replace(phone, '\D', '', 'g') = v_digits and status = 'pending_signup';

  if v_match_count = 0 then
    raise exception 'Não encontramos seu cadastro com esse telefone. Fale com a Equipe de Integração.';
  end if;

  if v_match_count > 1 then
    raise exception 'Encontramos mais de um cadastro com esse telefone. Fale com a Equipe de Integração.';
  end if;

  select id into v_person_id
    from public.people
    where regexp_replace(phone, '\D', '', 'g') = v_digits and status = 'pending_signup'
    limit 1;

  return v_person_id;
end;
$$;

create or replace function public.find_membership_interest_person(p_phone text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_digits      text := regexp_replace(p_phone, '\D', '', 'g');
  v_match_count int;
  v_person_id   uuid;
begin
  select count(distinct p.id) into v_match_count
    from public.people p
    join public.enrollments e on e.person_id = p.id
    where regexp_replace(p.phone, '\D', '', 'g') = v_digits
      and p.status in ('integration', 'membership_pending');

  if v_match_count = 0 then
    raise exception 'Não encontramos seu cadastro na Integração com esse telefone. A ficha é para quem já está matriculado numa turma — fale com a Equipe de Integração.';
  end if;

  if v_match_count > 1 then
    raise exception 'Encontramos mais de um cadastro com esse telefone. Fale com a Equipe de Integração.';
  end if;

  select p.id into v_person_id
    from public.people p
    join public.enrollments e on e.person_id = p.id
    where regexp_replace(p.phone, '\D', '', 'g') = v_digits
      and p.status in ('integration', 'membership_pending')
    limit 1;

  return v_person_id;
end;
$$;

update public.people
set phone = regexp_replace(phone, '\D', '', 'g')
where phone ~ '\D';

select count(*) filter (where phone ~ '^\d{10,11}$') as apenas_digitos,
       count(*) filter (where phone !~ '^\d{10,11}$') as revisar
from public.people;
