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
  v_parent uuid;
  v_parent_gender text;
  v_partner uuid;
begin
  if not exists (
    select 1 from public.family_links where person_id = p_person_id and relation in ('father', 'mother')
  ) then
    select only_one.relative_id, g.gender into v_parent, v_parent_gender
      from (
        select min(x.relative_id::text)::uuid as relative_id, count(*) as total
          from (
            select distinct s.relative_id
              from public.family_links u
              cross join lateral (
                select l.relative_id from public.family_links l where l.person_id = u.relative_id and l.relation = 'sibling'
                union
                select d.relative_id from public.derive_family(u.relative_id) d where d.relation = 'sibling'
              ) s
             where u.person_id = p_person_id and u.relation = 'uncle' and s.relative_id <> p_person_id
          ) x
      ) only_one
      join public.member_profiles g on g.person_id = only_one.relative_id
     where only_one.total = 1 and g.gender in ('male', 'female');

    if v_parent is not null then
      select l.relative_id into v_partner from public.family_links l where l.person_id = v_parent and l.relation = 'spouse';
      delete from public.family_links
       where (person_id = p_person_id and relative_id in (v_parent, v_partner))
          or (relative_id = p_person_id and person_id in (v_parent, v_partner));
      insert into public.family_links (person_id, relative_id, relation)
      values (p_person_id, v_parent, case v_parent_gender when 'male' then 'father' else 'mother' end),
             (v_parent, p_person_id, 'child');
      v_added := v_added + 1;
      if v_partner is not null
         and not exists (select 1 from public.family_links where person_id = p_person_id and relation = case v_parent_gender when 'male' then 'mother' else 'father' end) then
        insert into public.family_links (person_id, relative_id, relation)
        values (p_person_id, v_partner, case v_parent_gender when 'male' then 'mother' else 'father' end),
               (v_partner, p_person_id, 'child');
        v_added := v_added + 1;
      end if;
    end if;
  end if;

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

