CREATE OR REPLACE FUNCTION public.submit_membership_signup(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text)
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

update public.status_history
set note = 'Cadastro direto do Conselho'
where note ilike 'Cadastro direto de m%';

revoke all on function public.set_family_links(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.set_family_links(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.set_family_links(uuid, jsonb, jsonb) to service_role;

revoke all on function public.suggest_family_links(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.suggest_family_links(uuid, jsonb) to authenticated;
grant execute on function public.suggest_family_links(uuid, jsonb) to service_role;

revoke all on function public.expand_family_links(uuid) from public, anon, authenticated;
grant execute on function public.expand_family_links(uuid) to service_role;

revoke all on function public.expand_family_person(uuid) from public, anon, authenticated;
grant execute on function public.expand_family_person(uuid) to service_role;

revoke all on function public.family_compose(text, text) from public, anon, authenticated;
grant execute on function public.family_compose(text, text) to service_role;
