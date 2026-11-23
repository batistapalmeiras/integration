create function public.save_membership_answers(p_person_id uuid, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if p_wants_small_group = 'already'
     and not exists (select 1 from public.small_groups sg where sg.id = p_small_group_id) then
    raise exception 'Não encontramos o PG escolhido. Escolha de novo ou fale com a equipe da Classe de Integração.';
  end if;

  if exists (
    select 1 from public.member_profiles m
      where m.cpf = nullif(regexp_replace(p_cpf, '\D', '', 'g'), '')
        and m.person_id <> p_person_id
  ) then
    raise exception 'Esse CPF já está no cadastro de outra pessoa. Fale com a equipe da Classe de Integração.';
  end if;

  update public.people
    set name = btrim(p_name),
        email = nullif(btrim(p_email), ''),
        entry_type = p_entry_type,
        membership_form_at = now(),
        updated_at = now()
    where id = p_person_id;

  if p_wants_small_group = 'already' then
    insert into public.person_small_groups (person_id, small_group_id)
    values (p_person_id, p_small_group_id)
    on conflict do nothing;
  end if;

  insert into public.member_profiles (
    person_id, gender, cpf, marital_status,
    address_zip, address_street, address_number, address_complement, address_neighborhood, address_city, address_state,
    baptism_church
  )
  values (
    p_person_id,
    nullif(p_gender, ''),
    nullif(regexp_replace(p_cpf, '\D', '', 'g'), ''),
    nullif(p_marital_status, ''),
    nullif(regexp_replace(p_address_zip, '\D', '', 'g'), ''),
    nullif(btrim(p_address_street), ''),
    nullif(btrim(p_address_number), ''),
    nullif(btrim(p_address_complement), ''),
    nullif(btrim(p_address_neighborhood), ''),
    nullif(btrim(p_address_city), ''),
    nullif(upper(btrim(p_address_state)), ''),
    nullif(btrim(p_baptism_church), '')
  )
  on conflict (person_id) do update
    set gender = excluded.gender,
        cpf = excluded.cpf,
        marital_status = excluded.marital_status,
        address_zip = excluded.address_zip,
        address_street = excluded.address_street,
        address_number = excluded.address_number,
        address_complement = excluded.address_complement,
        address_neighborhood = excluded.address_neighborhood,
        address_city = excluded.address_city,
        address_state = excluded.address_state,
        baptism_church = excluded.baptism_church;

  insert into public.person_sensitive (
    person_id, birth_date, origin_church, ministry_interests, secret_society, wants_small_group, membership_note
  )
  values (
    p_person_id,
    p_birth_date,
    nullif(btrim(p_last_church), ''),
    p_ministry_interests,
    nullif(btrim(p_secret_society), ''),
    p_wants_small_group,
    nullif(btrim(p_membership_note), '')
  )
  on conflict (person_id) do update
    set birth_date = excluded.birth_date,
        origin_church = excluded.origin_church,
        ministry_interests = excluded.ministry_interests,
        secret_society = excluded.secret_society,
        wants_small_group = excluded.wants_small_group,
        membership_note = excluded.membership_note,
        updated_at = now();
end;
$function$;

revoke all on function public.save_membership_answers(uuid, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.save_membership_answers(uuid, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text) to service_role;

create function public.submit_membership_form(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text)
 RETURNS TABLE(lessons_attended integer, lessons_total integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  declare
    v_person_id uuid;
    v_status    text;
    v_attended  int;
    v_total     int;
  begin
    v_person_id := public.find_membership_interest_person(p_phone);

    perform public.save_membership_answers(
      v_person_id, p_name, p_gender, p_cpf, p_birth_date, p_marital_status, p_email,
      p_address_zip, p_address_street, p_address_number, p_address_complement, p_address_neighborhood,
      p_address_city, p_address_state, p_entry_type, p_baptism_church, p_last_church,
      p_ministry_interests, p_wants_small_group, p_small_group_id, p_secret_society, p_membership_note
    );

    perform public.attach_membership_photo(v_person_id, p_photo_token);

    select g.lessons_attended, g.lessons_total into v_attended, v_total
      from public.membership_lesson_progress(v_person_id) g;

    select p.status into v_status from public.people p where p.id = v_person_id;

    if v_status = 'integration' and v_total > 0 and v_attended >= v_total then
      update public.people set status = 'membership_pending', updated_at = now() where id = v_person_id;

      insert into public.status_history (person_id, from_status, to_status, note)
        values (v_person_id, 'integration', 'membership_pending', 'Ficha de Interesse do Conselho preenchida');
    end if;

    return query select v_attended, v_total;
  end;
  $function$;

revoke all on function public.submit_membership_form(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_membership_form(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) to anon;
grant execute on function public.submit_membership_form(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) to authenticated;
grant execute on function public.submit_membership_form(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) to service_role;

create function public.submit_membership_signup(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  declare
    v_phone     text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
    v_person_id uuid;
  begin
    if v_phone is not null and length(v_phone) not in (10, 11) then
      raise exception 'Informe um telefone válido, com DDD, ou deixe o campo em branco.';
    end if;

    perform public.check_membership_signup_cpf(p_cpf);

    if v_phone is not null
       and exists (select 1 from public.people p where regexp_replace(p.phone, '\D', '', 'g') = v_phone) then
      raise exception 'Já temos um cadastro com esse telefone. Fale com a equipe da Classe de Integração.';
    end if;

    insert into public.people (name, phone, status, origin)
    values (btrim(p_name), v_phone, 'membership_pending', 'membership_signup')
    returning id into v_person_id;

    perform public.save_membership_answers(
      v_person_id, p_name, p_gender, p_cpf, p_birth_date, p_marital_status, p_email,
      p_address_zip, p_address_street, p_address_number, p_address_complement, p_address_neighborhood,
      p_address_city, p_address_state, p_entry_type, p_baptism_church, p_last_church,
      p_ministry_interests, p_wants_small_group, p_small_group_id, p_secret_society, p_membership_note
    );

    perform public.attach_membership_photo(v_person_id, p_photo_token);

    insert into public.status_history (person_id, from_status, to_status, note)
      values (v_person_id, null, 'membership_pending', 'Cadastro direto do Conselho');
  end;
  $function$;

revoke all on function public.submit_membership_signup(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_membership_signup(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) to anon;
grant execute on function public.submit_membership_signup(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) to authenticated;
grant execute on function public.submit_membership_signup(text, text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text, text[], text, uuid, text, text, text) to service_role;
