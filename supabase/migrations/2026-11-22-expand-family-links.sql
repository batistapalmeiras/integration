create or replace function public.family_compose(p_link text, p_next text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when p_link = 'sibling' and p_next in ('father', 'mother', 'sibling', 'uncle', 'grandfather', 'grandmother', 'cousin', 'nephew') then p_next
    when p_link = 'sibling' and p_next = 'spouse' then 'sibling_in_law'
    when p_link = 'sibling' and p_next = 'child' then 'nephew'
    when p_link = 'uncle' and p_next = 'father' then 'grandfather'
    when p_link = 'uncle' and p_next = 'mother' then 'grandmother'
    when p_link = 'uncle' and p_next in ('sibling', 'spouse') then 'uncle'
    when p_link = 'uncle' and p_next in ('child', 'nephew') then 'cousin'
    when p_link in ('grandfather', 'grandmother') and p_next = 'child' then 'uncle'
    when p_link in ('grandfather', 'grandmother') and p_next = 'spouse' then 'grandparent'
    when p_link in ('grandfather', 'grandmother') and p_next = 'grandchild' then 'cousin'
    when p_link = 'cousin' and p_next in ('father', 'mother') then 'uncle'
    when p_link = 'cousin' and p_next in ('sibling', 'grandfather', 'grandmother') then case p_next when 'sibling' then 'cousin' else p_next end
    when p_link = 'nephew' and p_next = 'sibling' then 'nephew'
    when p_link = 'grandchild' and p_next = 'sibling' then 'grandchild'
    when p_link = 'parent_in_law' and p_next = 'spouse' then 'parent_in_law'
    when p_link = 'parent_in_law' and p_next = 'child' then 'sibling_in_law'
    when p_link in ('son_in_law', 'daughter_in_law') and p_next = 'spouse' then 'child'
    when p_link in ('son_in_law', 'daughter_in_law') and p_next = 'child' then 'grandchild'
    when p_link = 'child' and p_next = 'sibling' then 'child'
    when p_link = 'sibling_in_law' and p_next in ('father', 'mother') then 'parent_in_law'
  end;
$function$;

create or replace function public.expand_family_person(p_person_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row record;
  v_gender text := public.family_parent_gender(p_person_id);
  v_inverse text;
  v_added integer := 0;
begin
  for v_row in
    with mine as (
      select l.relative_id as u, l.relation as r
        from public.family_links l
       where l.person_id = p_person_id
         and l.relation not in ('spouse', 'father', 'mother', 'friend')
    ),
    theirs as (
      select m.r, t.relative_id as s, t.relation as nxt
        from mine m join public.family_links t on t.person_id = m.u
      union
      select m.r, d.relative_id, d.relation
        from mine m cross join lateral public.derive_family(m.u) d
    ),
    composed as (
      select distinct on (t.s)
             t.s,
             case public.family_compose(t.r, t.nxt)
               when 'grandparent' then case g.gender when 'male' then 'grandfather' when 'female' then 'grandmother' end
               else public.family_compose(t.r, t.nxt)
             end as relation
        from theirs t
        left join public.member_profiles g on g.person_id = t.s
       where public.family_compose(t.r, t.nxt) is not null
       order by t.s
    )
    select c.s, c.relation
      from composed c
      join public.people p on p.id = c.s and p.status = 'member'
     where c.relation is not null
       and c.s <> p_person_id
       and not exists (select 1 from public.family_links x where x.person_id = p_person_id and x.relative_id = c.s)
       and not exists (select 1 from public.derive_family(p_person_id) d where d.relative_id = c.s)
  loop
    v_inverse := public.family_inverse(v_row.relation, v_gender);
    if v_inverse is null then
      continue;
    end if;
    begin
      insert into public.family_links (person_id, relative_id, relation)
      values (p_person_id, v_row.s, v_row.relation), (v_row.s, p_person_id, v_inverse);
      v_added := v_added + 1;
    exception when unique_violation then
      null;
    end;
  end loop;
  return v_added;
end;
$function$;

create or replace function public.expand_family_links(p_person_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_round integer := 0;
  v_added integer;
  v_person uuid;
  v_shared record;
begin
  loop
    v_added := 0;

    for v_person in
      select d.relative_id from public.derive_family(p_person_id) d where d.relation = 'sibling'
    loop
      for v_shared in
        select l.relative_id, l.relation
          from public.family_links l
         where l.person_id = p_person_id
           and l.relation in ('uncle', 'grandfather', 'grandmother', 'cousin')
           and l.relative_id <> v_person
           and not exists (select 1 from public.family_links x where x.person_id = v_person and x.relative_id = l.relative_id)
           and not exists (select 1 from public.derive_family(v_person) d where d.relative_id = l.relative_id)
      loop
        begin
          insert into public.family_links (person_id, relative_id, relation)
          values (v_person, v_shared.relative_id, v_shared.relation),
                 (v_shared.relative_id, v_person, public.family_inverse(v_shared.relation, public.family_parent_gender(v_person)));
          v_added := v_added + 1;
        exception when unique_violation or not_null_violation then
          null;
        end;
      end loop;
    end loop;

    for v_person in
      select p_person_id
      union
      select d.relative_id from public.derive_family(p_person_id) d where d.relation = 'sibling'
    loop
      v_added := v_added + public.expand_family_person(v_person);
    end loop;

    v_round := v_round + 1;
    exit when v_added = 0 or v_round >= 4;
  end loop;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_family_links(p_person_id uuid, p_links jsonb, p_hidden jsonb DEFAULT '[]'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_link jsonb;
  v_relative uuid;
  v_relation text;
  v_person_gender text;
  v_relative_gender text;
  v_expected text;
  v_inverse text;
  v_relative_name text;
  v_spouses integer := 0;
  v_before jsonb;
  v_fathers integer := 0;
  v_mothers integer := 0;
  v_constraint text;
  v_hidden uuid;
begin
  if public."current_role"() is distinct from 'general_admin' then
    raise exception 'Só o Administrador Geral pode alterar a família.';
  end if;

  if not exists (select 1 from public.people where id = p_person_id and status in ('member', 'membership_pending')) then
    raise exception 'Só membros podem ter vínculos familiares.';
  end if;

  v_person_gender := public.family_parent_gender(p_person_id);

  select coalesce(jsonb_agg(jsonb_build_object('p', person_id, 'r', relative_id, 'rel', relation)), '[]'::jsonb)
    into v_before from public.family_links;

  delete from public.family_links where p_person_id in (person_id, relative_id);

  for v_link in select * from jsonb_array_elements(p_links) loop
    v_relative := (v_link ->> 'relative_id')::uuid;
    v_relation := v_link ->> 'relation';

    select p.name, mp.gender into v_relative_name, v_relative_gender
      from public.people p
      left join public.member_profiles mp on mp.person_id = p.id
     where p.id = v_relative and p.status = 'member';
    if v_relative_name is null then
      raise exception 'Só membros podem ter vínculos familiares.';
    end if;
    if v_relative = p_person_id then
      raise exception 'Uma pessoa não pode ser familiar de si mesma.';
    end if;
    if v_relation is null or public.family_inverse(v_relation, 'male') is null then
      raise exception 'Vínculo familiar inválido.';
    end if;

    v_expected := public.family_relation_gender(v_relation);
    if v_expected is not null and v_relative_gender is not null and v_relative_gender <> v_expected then
      raise exception '% está cadastrado(a) com o sexo oposto ao do vínculo escolhido.', v_relative_name;
    end if;

    if v_relation = 'spouse' then
      v_spouses := v_spouses + 1;
      if v_spouses > 1 then
        raise exception 'Só pode haver um cônjuge.';
      end if;
    end if;

    if v_relation = 'father' then
      v_fathers := v_fathers + 1;
      if v_fathers > 1 then
        raise exception 'Só pode haver um pai.';
      end if;
    elsif v_relation = 'mother' then
      v_mothers := v_mothers + 1;
      if v_mothers > 1 then
        raise exception 'Só pode haver uma mãe.';
      end if;
    end if;

    v_inverse := public.family_inverse(v_relation, v_person_gender);
    if v_inverse is null then
      raise exception 'Informe o sexo em Dados pessoais antes de adicionar este vínculo.';
    end if;

    insert into public.family_links (person_id, relative_id, relation)
    values (p_person_id, v_relative, v_relation),
           (v_relative, p_person_id, v_inverse);

    delete from public.family_hidden
     where (person_id = p_person_id and relative_id = v_relative)
        or (person_id = v_relative and relative_id = p_person_id);
  end loop;

  for v_hidden in select value::uuid from jsonb_array_elements_text(p_hidden) loop
    insert into public.family_hidden (person_id, relative_id)
    values (p_person_id, v_hidden), (v_hidden, p_person_id)
    on conflict do nothing;
  end loop;

  perform public.expand_family_links(p_person_id);

  perform public.prune_family_shares(v_before);
  perform public.sync_family_couples();

  update public.member_profiles mp
     set marital_status = 'married'
   where mp.marital_status is distinct from 'married'
     and exists (
       select 1 from public.family_links l where l.person_id = mp.person_id and l.relation = 'spouse'
     );

  update public.member_profiles mp
     set marital_status = null
   where mp.marital_status = 'married'
     and exists (
       select 1 from jsonb_to_recordset(v_before) as b(p uuid, r uuid, rel text)
        where b.p = mp.person_id and b.rel = 'spouse'
     )
     and not exists (
       select 1 from public.family_links l where l.person_id = mp.person_id and l.relation = 'spouse'
     );

  perform public.drop_derivable_links();

  perform public.log_family_changes(v_before);
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    raise exception '%', case v_constraint
      when 'family_links_one_spouse_key' then 'Quem já tem cônjuge não pode ter outro.'
      when 'family_links_one_father_key' then 'Uma das pessoas já tem pai cadastrado.'
      when 'family_links_one_mother_key' then 'Uma das pessoas já tem mãe cadastrada.'
      else 'Escolha cada pessoa uma vez só.'
    end;
end;
$function$;
