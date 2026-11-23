set check_function_bodies = false;

create extension if not exists pg_cron with schema pg_catalog;

create extension if not exists pg_stat_statements with schema extensions;

create extension if not exists pgcrypto with schema extensions;

create extension if not exists unaccent with schema extensions;

create extension if not exists "uuid-ossp" with schema extensions;

create table public.coffee_attendance (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  coffee_event_id uuid not null,
  attended boolean default false not null
);

create table public.coffee_events (
  id uuid default gen_random_uuid() not null,
  event_date date not null,
  event_time time without time zone default '17:30:00'::time without time zone not null,
  created_at timestamp with time zone default now() not null
);

create table public.cohorts (
  id uuid default gen_random_uuid() not null,
  name text not null,
  status text default 'active'::text not null,
  created_at timestamp with time zone default now() not null
);

create table public.contact_attempts (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  channel text not null,
  result text not null,
  made_by uuid,
  created_at timestamp with time zone default now() not null
);

create table public.councils (
  id uuid default gen_random_uuid() not null,
  meeting_date date not null,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone default now() not null
);

create table public.enrollments (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  cohort_id uuid not null,
  created_at timestamp with time zone default now() not null
);

create table public.family_hidden (
  person_id uuid not null,
  relative_id uuid not null,
  created_at timestamp with time zone default now() not null
);

create table public.family_links (
  person_id uuid not null,
  relative_id uuid not null,
  relation text not null,
  created_at timestamp with time zone default now() not null
);

create table public.lesson_attendance (
  id uuid default gen_random_uuid() not null,
  enrollment_id uuid not null,
  lesson_id uuid not null,
  attended boolean default false not null
);

create table public.lesson_makeups (
  lesson_attendance_id uuid not null,
  notes text
);

create table public.lessons (
  id uuid default gen_random_uuid() not null,
  cohort_id uuid not null,
  number integer not null,
  date date not null
);

create table public.member_events (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  event text not null,
  detail jsonb default '{}'::jsonb not null,
  changed_by uuid default auth.uid(),
  created_at timestamp with time zone default clock_timestamp() not null
);

create table public.member_flags (
  person_id uuid not null,
  flag text not null,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone default now() not null
);

create table public.member_profiles (
  person_id uuid not null,
  gender text,
  marital_status text,
  baptism_church text,
  address_zip text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_reference text,
  cpf text,
  photo_updated_at timestamp with time zone,
  photo_folder text
);

create table public.membership_alert_resolutions (
  person_id uuid not null,
  code text not null,
  resolved_by uuid default auth.uid(),
  resolved_at timestamp with time zone default now() not null
);

create table public.ministries (
  id uuid default gen_random_uuid() not null,
  name text not null,
  created_at timestamp with time zone default now() not null,
  kind text default 'manual'::text not null
);

create table public.ministry_leaders (
  ministry_id uuid not null,
  person_id uuid not null
);

create table public.parent_links (
  parent_id uuid not null,
  child_id uuid not null,
  role text not null,
  created_at timestamp with time zone default now() not null
);

create table public.pastoral_notes (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  body text not null,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone default now() not null,
  private boolean default false not null
);

create table public.people (
  id uuid default gen_random_uuid() not null,
  name text not null,
  phone text,
  status text default 'initial_contact'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  age integer,
  email text,
  whatsapp_opened_at timestamp with time zone,
  coffee_retry_used boolean default false not null,
  entry_type text,
  class_invite_sent_at timestamp with time zone,
  membership_interest_sent_at timestamp with time zone,
  membership_status text,
  signup_window_from date,
  visited_on date default service_sunday(now()),
  origin text default 'integration'::text not null,
  council_id uuid,
  membership_form_at timestamp with time zone
);

create table public.person_ministries (
  person_id uuid not null,
  ministry_id uuid not null,
  created_at timestamp with time zone default now() not null
);

create table public.person_sensitive (
  person_id uuid not null,
  attending_since text,
  previous_church text,
  baptism_info text,
  conversion_testimony text,
  marital_status_story text,
  birth_date date,
  origin_church text,
  ministry_interests text[],
  secret_society text,
  wants_small_group text,
  membership_note text,
  updated_at timestamp with time zone default now() not null
);

create table public.person_small_groups (
  person_id uuid not null,
  small_group_id uuid not null,
  created_at timestamp with time zone default now() not null
);

create table public.profiles (
  id uuid not null,
  role text not null,
  created_at timestamp with time zone default now() not null,
  active boolean default true not null,
  must_change_password boolean default false not null,
  person_id uuid not null
);

create table public.small_group_roles (
  small_group_id uuid not null,
  person_id uuid not null,
  role text not null
);

create table public.small_groups (
  id uuid default gen_random_uuid() not null,
  name text not null,
  created_at timestamp with time zone default now() not null,
  meeting_day text
);

create table public.spouse_links (
  person_a_id uuid not null,
  person_b_id uuid not null,
  created_at timestamp with time zone default now() not null
);

create table public.status_history (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  from_status text,
  to_status text not null,
  changed_by uuid,
  note text,
  created_at timestamp with time zone default now() not null
);

create table public.visitor_events (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  event text not null,
  detail jsonb default '{}'::jsonb not null,
  changed_by uuid default auth.uid(),
  created_at timestamp with time zone default clock_timestamp() not null
);

CREATE OR REPLACE FUNCTION public.annual_pipeline_counts(p_year integer)
 RETURNS TABLE(initial_contact bigint, welcome_coffee bigint, integration bigint, member bigint, archived bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with bounds as (
    select make_date(p_year, 1, 1)::timestamptz as starts_at, make_date(p_year + 1, 1, 1)::timestamptz as ends_at
  ),
  history as (
    select h.to_status
      from public.status_history h
      join public.people p on p.id = h.person_id, bounds b
      where h.created_at >= b.starts_at and h.created_at < b.ends_at
        and p.origin = 'integration'
  )
  select
    (select count(*) from public.people p, bounds b
       where p.origin = 'integration' and p.created_at >= b.starts_at and p.created_at < b.ends_at),
    count(*) filter (where to_status = 'welcome_coffee'),
    count(*) filter (where to_status = 'integration'),
    count(*) filter (where to_status = 'member'),
    count(*) filter (where to_status = 'archived')
  from history;
$function$
;

CREATE OR REPLACE FUNCTION public.attach_membership_photo(p_person_id uuid, p_photo_token text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
  declare
    v_folder text;
  begin
    if p_photo_token is null or p_photo_token !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Envie sua foto para continuar.';
    end if;

    v_folder := 'submissions/' || p_photo_token;

    if not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'member-photos' and o.name = v_folder || '/photo.jpg'
    ) then
      raise exception 'Não encontramos sua foto. Envie a foto de novo.';
    end if;

    insert into public.member_profiles (person_id, photo_folder, photo_updated_at)
    values (p_person_id, v_folder, now())
    on conflict (person_id) do update
      set photo_folder = excluded.photo_folder,
          photo_updated_at = excluded.photo_updated_at;
  end;
  $function$
;

CREATE OR REPLACE FUNCTION public.can_edit_person_note(p_created_by uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(
    p_created_by = auth.uid()
      or public."current_role"() = 'general_admin'
      or (
        public."current_role"() = 'admin'
        and exists (
          select 1 from public.profiles pr
           where pr.id = p_created_by and pr.role in ('integration_team', 'teacher')
        )
      ),
    false
  );
$function$
;

CREATE OR REPLACE FUNCTION public.can_manage_person_notes(p_person_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public."current_role"() = 'general_admin'
      or (
        public."current_role"() in ('integration_team', 'teacher', 'admin')
        and exists (select 1 from public.people p where p.id = p_person_id and p.status <> 'member')
      );
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_person(p_status text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select auth.uid() is not null
     and (p_status is distinct from 'member' or public."current_role"() in ('general_admin', 'admin'));
$function$
;

CREATE OR REPLACE FUNCTION public.can_see_person_note(p_private boolean, p_created_by uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select not p_private or p_created_by = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.can_write_person(p_status text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select public."current_role"() = 'general_admin'
      or (p_status is distinct from 'member' and public."current_role"() in ('integration_team', 'admin'));
$function$
;

CREATE OR REPLACE FUNCTION public.changed_fields(p_old jsonb, p_new jsonb, p_skip text[])
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select coalesce(array_agg(k order by k), '{}')
    from jsonb_object_keys(p_new) as k
   where k <> all (p_skip) and (p_new -> k) is distinct from (p_old -> k);
$function$
;

CREATE OR REPLACE FUNCTION public.check_membership_interest_phone(p_phone text)
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_membership_signup_cpf(p_cpf text)
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if exists (
    select 1 from public.member_profiles m where m.cpf = nullif(regexp_replace(p_cpf, '\D', '', 'g'), '')
  ) then
    raise exception 'Já temos um cadastro com esse CPF. Fale com a equipe da Classe de Integração.';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.check_welcome_coffee_phone(p_phone text)
 RETURNS TABLE(person_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_person_id uuid;
begin
  v_person_id := public.find_welcome_coffee_person(p_phone);
  return query select name from public.people where id = v_person_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.count_integration_people_by_status()
 RETURNS TABLE(status text, total bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select p.status, count(*)
    from public.people p
    where p.origin = 'integration'
    group by p.status;
$function$
;

CREATE OR REPLACE FUNCTION public.create_cohort(p_name text, p_lesson_dates date[])
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_cohort_id uuid;
begin
  if coalesce(array_length(p_lesson_dates, 1), 0) = 0 then
    raise exception 'A turma precisa ter as datas das aulas.';
  end if;

  insert into cohorts (name) values (p_name) returning id into v_cohort_id;

  insert into lessons (cohort_id, number, date)
  select v_cohort_id, lesson.number::integer, lesson.date
  from unnest(p_lesson_dates) with ordinality as lesson(date, number);

  return v_cohort_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.current_profile()
 RETURNS TABLE(id uuid, name text, role text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select pr.id, p.name, pr.role
    from public.profiles pr
    join public.people p on p.id = pr.person_id
   where pr.id = auth.uid() and p.membership_status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public."current_role"()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when pr.role = 'developer' then 'general_admin' else pr.role end
    from public.profiles pr
    join public.people p on p.id = pr.person_id
   where pr.id = auth.uid() and p.membership_status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public.derive_family(p_person_id uuid)
 RETURNS TABLE(relation text, relative_id uuid)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with
    parents as (select fl.person_id as child, fl.relative_id as parent from public.family_links fl where fl.relation in ('father', 'mother')),
    spouses as (select fl.person_id as a, fl.relative_id as b from public.family_links fl where fl.relation = 'spouse'),
    stored_uncles as (select fl.person_id as person, fl.relative_id as uncle from public.family_links fl where fl.relation = 'uncle'),
    stored_nephews as (select fl.person_id as person, fl.relative_id as nephew from public.family_links fl where fl.relation = 'nephew'),
    siblings as (
      select fl.person_id as a, fl.relative_id as b from public.family_links fl where fl.relation = 'sibling'
      union
      select first_child.child, second_child.child from parents first_child
        join parents second_child on first_child.parent = second_child.parent and first_child.child <> second_child.child
    ),
    found as (
      select 'sibling'::text as relation, s.b as relative_id from siblings s where s.a = p_person_id
      union all select 'grandparent', grand.parent from parents mine join parents grand on grand.child = mine.parent where mine.child = p_person_id
      union all select 'grandchild', kid.child from parents own join parents kid on kid.parent = own.child where own.parent = p_person_id
      union all select 'parent_in_law', p.parent from spouses s join parents p on p.child = s.b where s.a = p_person_id
      union all select 'child_in_law', s.b from parents own join spouses s on s.a = own.child where own.parent = p_person_id
      union all select 'sibling_in_law', s.b from siblings sib join spouses s on s.a = sib.b where sib.a = p_person_id
      union all select 'sibling_in_law', sib.b from spouses s join siblings sib on sib.a = s.b where s.a = p_person_id
      union all select 'uncle', sib.b from parents mine join siblings sib on sib.a = mine.parent where mine.child = p_person_id
      union all select 'uncle', s.b from parents mine join siblings sib on sib.a = mine.parent join spouses s on s.a = sib.b where mine.child = p_person_id
      union all select 'uncle', s.b from stored_uncles su join spouses s on s.a = su.uncle where su.person = p_person_id
      union all select 'nephew', kid.child from siblings sib join parents kid on kid.parent = sib.b where sib.a = p_person_id
      union all select 'nephew', kid.child from spouses s join siblings sib on sib.a = s.b join parents kid on kid.parent = sib.b where s.a = p_person_id
      union all select 'nephew', sn.nephew from spouses s join stored_nephews sn on sn.person = s.b where s.a = p_person_id
      union all select 'cousin', kid.child from parents mine join siblings sib on sib.a = mine.parent join parents kid on kid.parent = sib.b where mine.child = p_person_id
      union all select 'cousin', kid.child from stored_uncles su join parents kid on kid.parent = su.uncle where su.person = p_person_id
      union all select 'cousin', kid.child from stored_uncles su join spouses s on s.a = su.uncle join parents kid on kid.parent = s.b where su.person = p_person_id
      union all select 'cousin', sn.nephew from parents mine join stored_nephews sn on sn.person = mine.parent where mine.child = p_person_id
    )
  select distinct on (f.relative_id)
         case f.relation
           when 'grandparent' then case g.gender when 'male' then 'grandfather' when 'female' then 'grandmother' end
           when 'child_in_law' then case g.gender when 'male' then 'son_in_law' when 'female' then 'daughter_in_law' end
           else f.relation end,
         f.relative_id
    from found f left join public.member_profiles g on g.person_id = f.relative_id
   where f.relative_id <> p_person_id and (f.relation not in ('grandparent', 'child_in_law') or g.gender in ('male', 'female'))
   order by f.relative_id, array_position(array['sibling', 'grandparent', 'grandchild', 'parent_in_law', 'child_in_law', 'sibling_in_law', 'uncle', 'nephew', 'cousin'], f.relation);
$function$
;

CREATE OR REPLACE FUNCTION public.drop_derivable_links()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  delete from public.family_links l
   where l.relation in ('grandfather', 'grandmother', 'grandchild', 'parent_in_law', 'son_in_law',
                        'daughter_in_law', 'sibling_in_law', 'uncle', 'nephew', 'cousin')
     and exists (
       select 1 from public.derive_family(l.person_id) d
        where d.relative_id = l.relative_id and d.relation = l.relation
     );
$function$
;

CREATE OR REPLACE FUNCTION public.expand_family_links(p_person_id uuid)
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
$function$
;

CREATE OR REPLACE FUNCTION public.expand_family_person(p_person_id uuid)
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
$function$
;

CREATE OR REPLACE FUNCTION public.family_compose(p_link text, p_next text)
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
$function$
;

CREATE OR REPLACE FUNCTION public.family_inverse(p_relation text, p_gender text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when p_relation = 'spouse' then 'spouse'
    when p_relation = 'child' then case p_gender when 'male' then 'father' when 'female' then 'mother' end
    when p_relation in ('father', 'mother') then 'child'
    when p_relation in ('grandfather', 'grandmother') then 'grandchild'
    when p_relation = 'grandchild' then case p_gender when 'male' then 'grandfather' when 'female' then 'grandmother' end
    when p_relation = 'sibling' then 'sibling'
    when p_relation = 'parent_in_law' then case p_gender when 'male' then 'son_in_law' when 'female' then 'daughter_in_law' end
    when p_relation in ('son_in_law', 'daughter_in_law') then 'parent_in_law'
    when p_relation = 'sibling_in_law' then 'sibling_in_law'
    when p_relation = 'uncle' then 'nephew'
    when p_relation = 'nephew' then 'uncle'
    when p_relation = 'cousin' then 'cousin'
    when p_relation = 'friend' then 'friend'
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.family_mirror(p_relation text, p_relative_gender text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case when p_relation = 'child' then 'child' end;
$function$
;

CREATE OR REPLACE FUNCTION public.family_parent_gender(p_person_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select coalesce(
    (select mp.gender from public.member_profiles mp where mp.person_id = p_person_id),
    (select case spouse.gender when 'male' then 'female' when 'female' then 'male' end
       from public.family_links l
       join public.member_profiles spouse on spouse.person_id = l.relative_id
      where l.person_id = p_person_id and l.relation = 'spouse')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.family_relation_gender(p_relation text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when p_relation in ('grandfather', 'father', 'son_in_law') then 'male'
    when p_relation in ('grandmother', 'mother', 'daughter_in_law') then 'female'
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.find_membership_interest_person(p_phone text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    raise exception 'Não encontramos seu cadastro na Integração com esse telefone. A ficha é para quem já está matriculado numa turma — fale com a equipe da Classe de Integração.';
  end if;

  if v_match_count > 1 then
    raise exception 'Encontramos mais de um cadastro com esse telefone. Fale com a equipe da Classe de Integração.';
  end if;

  select p.id into v_person_id
    from public.people p
    join public.enrollments e on e.person_id = p.id
    where regexp_replace(p.phone, '\D', '', 'g') = v_digits
      and p.status in ('integration', 'membership_pending')
    limit 1;

  return v_person_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.find_welcome_coffee_person(p_phone text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.format_people_name()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.name := public.format_person_name(new.name);
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.format_person_name(p_name text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select string_agg(
           case
             when word.position > 1 and lower(word.value) in ('de', 'da', 'do', 'das', 'dos', 'e') then lower(word.value)
             else initcap(word.value)
           end,
           ' ' order by word.position)
    from regexp_split_to_table(btrim(p_name), '\s+') with ordinality as word(value, position)
   where word.value <> '';
$function$
;

CREATE OR REPLACE FUNCTION public.get_active_cohort_schedule()
 RETURNS TABLE(cohort_name text, lesson_dates date[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_cohort_id   uuid;
  v_cohort_name text;
  v_lesson_dates date[];
begin
  select c.id, c.name into v_cohort_id, v_cohort_name
    from public.cohorts c
    join public.lessons l on l.cohort_id = c.id and l.number = 1
    where c.status = 'active'
      and ((l.date + time '17:30') at time zone 'America/Sao_Paulo') > now()
    order by l.date
    limit 1;

  -- Nenhuma turma aberta: o formulário público já trata zero linhas
  -- mostrando o aviso de aguardar a próxima turma e bloqueando o Continuar.
  if v_cohort_id is null then
    return;
  end if;

  select array_agg(l.date order by l.number) into v_lesson_dates
    from public.lessons l
    where l.cohort_id = v_cohort_id;

  return query select v_cohort_name, v_lesson_dates;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_family_links(p_person_id uuid)
 RETURNS TABLE(relation text, person_id uuid, name text, gender text, derived boolean)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with stored as (
    select l.relation, l.relative_id from public.family_links l where l.person_id = p_person_id
  ),
  everyone as (
    select s.relation, s.relative_id, false as derived from stored s
    union all
    select d.relation, d.relative_id, true
      from public.derive_family(p_person_id) d
     where not exists (select 1 from stored s where s.relative_id = d.relative_id)
       and not exists (
         select 1 from public.family_hidden h where h.person_id = p_person_id and h.relative_id = d.relative_id
       )
  )
  select e.relation, p.id, p.name, mp.gender, e.derived
    from everyone e
    join public.people p on p.id = e.relative_id
    left join public.member_profiles mp on mp.person_id = p.id;
$function$
;

CREATE OR REPLACE FUNCTION public.get_family(p_person_id uuid)
 RETURNS TABLE(relation text, person_id uuid, name text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select 'spouse', p.id, p.name
    from public.spouse_links s
    join public.people p on p.id = case when s.person_a_id = p_person_id then s.person_b_id else s.person_a_id end
   where p_person_id in (s.person_a_id, s.person_b_id)
  union all
  select l.role, p.id, p.name
    from public.parent_links l
    join public.people p on p.id = l.parent_id
   where l.child_id = p_person_id
  union all
  select 'child', p.id, p.name
    from public.parent_links l
    join public.people p on p.id = l.child_id
   where l.parent_id = p_person_id;
$function$
;

CREATE OR REPLACE FUNCTION public.get_makeup_attendance_context(p_token uuid)
 RETURNS TABLE(person_name text, lesson_number integer, cohort_name text, already_confirmed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_person_name text;
  v_lesson_number int;
  v_cohort_name text;
  v_attended boolean;
begin
  select p.name, l.number, c.name, la.attended
    into v_person_name, v_lesson_number, v_cohort_name, v_attended
    from public.lesson_attendance la
    join public.enrollments e on e.id = la.enrollment_id
    join public.people p on p.id = e.person_id
    join public.lessons l on l.id = la.lesson_id
    join public.cohorts c on c.id = l.cohort_id
    where la.id = p_token;

  if v_person_name is null then
    raise exception 'Link inválido ou expirado.';
  end if;

  return query select v_person_name, v_lesson_number, v_cohort_name, v_attended;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.guard_automatic_ministry_links()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  declare
    v_row public.person_ministries;
  begin
    if tg_op = 'DELETE' then
      v_row := old;
    else
      v_row := new;
    end if;
    if pg_trigger_depth() = 1
       and coalesce(current_setting('app.automatic_ministry_sync', true), '') <> 'on'
       and exists (select 1 from public.ministries where id = v_row.ministry_id and kind <> 'manual') then
      raise exception 'Os líderes de PG entram e saem deste ministério automaticamente, pelos Pequenos Grupos.';
    end if;
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end;
  $function$
;

CREATE OR REPLACE FUNCTION public.guard_profile_privileges()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_actor text := public."current_role"();
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.id is distinct from old.id or new.created_at is distinct from old.created_at then
    raise exception 'Não é permitido alterar este campo.';
  end if;

  if new.role is not distinct from old.role then
    return new;
  end if;

  if old.id = auth.uid() then
    raise exception 'Você não pode mudar a sua própria permissão.';
  end if;

  if v_actor = 'general_admin' then
    return new;
  end if;

  if v_actor = 'admin'
     and old.role in ('integration_team', 'teacher')
     and new.role in ('integration_team', 'teacher') then
    return new;
  end if;

  raise exception 'Você não tem permissão para mudar a permissão desta pessoa.';
end;
$function$
;

CREATE OR REPLACE FUNCTION public.guard_single_spouse()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if exists (
    select 1 from public.spouse_links
     where (person_a_id in (new.person_a_id, new.person_b_id) or person_b_id in (new.person_a_id, new.person_b_id))
       and not (person_a_id = new.person_a_id and person_b_id = new.person_b_id)
  ) then
    raise exception 'Essa pessoa já tem cônjuge cadastrado.';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.integration_people_years()
 RETURNS TABLE(year integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select distinct extract(year from p.created_at at time zone 'America/Sao_Paulo')::integer
    from public.people p
    where p.origin = 'integration'
    order by 1 desc;
$function$
;

CREATE OR REPLACE FUNCTION public.list_member_events(p_person_id uuid)
 RETURNS TABLE(event text, detail jsonb, created_at timestamp with time zone, author_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select e.event, e.detail, e.created_at, pe.name
    from public.member_events e
    left join public.profiles pr on pr.id = e.changed_by
    left join public.people pe on pe.id = pr.person_id
   where e.person_id = p_person_id
     and public."current_role"() = 'general_admin'
   order by e.created_at;
$function$
;

CREATE OR REPLACE FUNCTION public.list_ministries()
 RETURNS TABLE(id uuid, name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select id, name from public.ministries order by name;
$function$
;

CREATE OR REPLACE FUNCTION public.list_person_history(p_person_id uuid)
 RETURNS TABLE(from_status text, to_status text, note text, created_at timestamp with time zone, author_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select h.from_status, h.to_status, h.note, h.created_at, pe.name
    from public.status_history h
    left join public.profiles pr on pr.id = h.changed_by
    left join public.people pe on pe.id = pr.person_id
   where h.person_id = p_person_id
     and public.can_manage_person_notes(p_person_id)
   order by h.created_at;
$function$
;

CREATE OR REPLACE FUNCTION public.list_person_notes(p_person_id uuid)
 RETURNS TABLE(id uuid, body text, created_at timestamp with time zone, author_name text, private boolean, can_edit boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select n.id, n.body, n.created_at, pe.name, n.private, public.can_edit_person_note(n.created_by)
    from public.pastoral_notes n
    left join public.profiles pr on pr.id = n.created_by
    left join public.people pe on pe.id = pr.person_id
   where n.person_id = p_person_id
     and public.can_manage_person_notes(p_person_id)
     and public.can_see_person_note(n.private, n.created_by)
   order by n.created_at desc;
$function$
;

CREATE OR REPLACE FUNCTION public.list_small_groups()
 RETURNS TABLE(id uuid, name text, leaders text[])
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select g.id,
         g.name,
         coalesce(
           (select array_agg(p.name order by p.name)
              from public.small_group_roles r
              join public.people p on p.id = r.person_id
             where r.small_group_id = g.id and r.role = 'leader'),
           '{}'
         )
    from public.small_groups g
   order by g.name;
$function$
;

CREATE OR REPLACE FUNCTION public.list_visitor_events(p_person_id uuid)
 RETURNS TABLE(event text, detail jsonb, created_at timestamp with time zone, author_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select e.event, e.detail, e.created_at, pe.name
    from public.visitor_events e
    left join public.profiles pr on pr.id = e.changed_by
    left join public.people pe on pe.id = pr.person_id
   where e.person_id = p_person_id
     and public.can_manage_person_notes(p_person_id)
   order by e.created_at;
$function$
;

CREATE OR REPLACE FUNCTION public.log_community_link()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row record;
  v_name text;
  v_event text;
  v_detail jsonb;
begin
  if tg_op = 'DELETE' then
    v_row := old;
  else
    v_row := new;
  end if;

  if tg_table_name = 'person_small_groups' then
    select name into v_name from public.small_groups where id = v_row.small_group_id;
    v_event := case tg_op when 'INSERT' then 'small_group_joined' else 'small_group_left' end;
    v_detail := jsonb_build_object('name', v_name);
  elsif tg_table_name = 'person_ministries' then
    select name into v_name from public.ministries where id = v_row.ministry_id;
    v_event := case tg_op when 'INSERT' then 'ministry_joined' else 'ministry_left' end;
    v_detail := jsonb_build_object('name', v_name);
  elsif tg_table_name = 'small_group_roles' then
    select name into v_name from public.small_groups where id = v_row.small_group_id;
    v_event := case tg_op when 'INSERT' then 'small_group_role_added' else 'small_group_role_removed' end;
    v_detail := jsonb_build_object('name', v_name, 'role', v_row.role);
  else
    select name into v_name from public.ministries where id = v_row.ministry_id;
    v_event := case tg_op when 'INSERT' then 'ministry_leader_added' else 'ministry_leader_removed' end;
    v_detail := jsonb_build_object('name', v_name);
  end if;

  perform public.log_member_event(v_row.person_id, v_event, v_detail);
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_family_changes(p_before jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row record;
begin
  for v_row in
    select 'family_added'::text as event, l.person_id, l.relation, l.relative_id
      from public.family_links l
     where not exists (
       select 1 from jsonb_to_recordset(p_before) as b(p uuid, r uuid, rel text)
        where b.p = l.person_id and b.r = l.relative_id and b.rel = l.relation
     )
    union all
    select 'family_removed'::text, b.p, b.rel, b.r
      from jsonb_to_recordset(p_before) as b(p uuid, r uuid, rel text)
     where not exists (
       select 1 from public.family_links l
        where l.person_id = b.p and l.relative_id = b.r and l.relation = b.rel
     )
  loop
    perform public.log_member_event(
      v_row.person_id,
      v_row.event,
      jsonb_build_object(
        'relation', v_row.relation,
        'name', (select name from public.people where id = v_row.relative_id),
        'gender', (select gender from public.member_profiles where person_id = v_row.relative_id)
      )
    );
  end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_lesson_attendance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_person uuid;
  v_number integer;
  v_cohort text;
begin
  if tg_op = 'INSERT' and not new.attended then
    return null;
  end if;
  if tg_op = 'UPDATE' and new.attended = old.attended then
    return null;
  end if;

  select e.person_id, l.number, c.name
    into v_person, v_number, v_cohort
    from public.enrollments e
    join public.lessons l on l.id = new.lesson_id
    join public.cohorts c on c.id = l.cohort_id
   where e.id = new.enrollment_id;

  if v_person is not null then
    perform public.log_visitor_event(
      v_person,
      case when new.attended then 'lesson_attended' else 'lesson_unmarked' end,
      jsonb_build_object('lesson', v_number, 'cohort', v_cohort)
    );
  end if;
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_member_event(p_person_id uuid, p_event text, p_detail jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if exists (select 1 from public.people where id = p_person_id and status = 'member') then
    insert into public.member_events (person_id, event, detail)
    values (p_person_id, p_event, coalesce(p_detail, '{}'::jsonb));
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_member_flag()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  declare
    v_row public.member_flags;
  begin
    if tg_op = 'DELETE' then
      v_row := old;
    else
      v_row := new;
    end if;
    perform public.log_member_event(
      v_row.person_id,
      case tg_op when 'INSERT' then 'flag_added' else 'flag_removed' end,
      jsonb_build_object('flag', v_row.flag)
    );
    return null;
  end;
  $function$
;

CREATE OR REPLACE FUNCTION public.log_people_member_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_fields text[];
  v_from_date date;
  v_to_date date;
begin
  if new.status <> 'member' then
    return null;
  end if;

  if old.membership_status is not null and old.membership_status is distinct from new.membership_status then
    perform public.log_member_event(
      new.id, 'membership_status_changed',
      jsonb_build_object('from', old.membership_status, 'to', new.membership_status)
    );
  end if;

  if old.council_id is distinct from new.council_id then
    select meeting_date into v_from_date from public.councils where id = old.council_id;
    select meeting_date into v_to_date from public.councils where id = new.council_id;
    perform public.log_member_event(
      new.id, 'council_changed', jsonb_build_object('from', v_from_date, 'to', v_to_date)
    );
  end if;

  if old.status = 'member' then
    v_fields := public.changed_fields(
      jsonb_build_object('name', old.name, 'phone', old.phone, 'email', old.email, 'entry_type', old.entry_type),
      jsonb_build_object('name', new.name, 'phone', new.phone, 'email', new.email, 'entry_type', new.entry_type),
      '{}'
    );
    if array_length(v_fields, 1) > 0 then
      perform public.log_member_event(new.id, 'record_updated', jsonb_build_object('fields', v_fields));
    end if;
  end if;

  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_people_visitor_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_fields text[];
begin
  if new.status = 'member' or old.status = 'member' then
    return null;
  end if;

  v_fields := public.changed_fields(
    jsonb_build_object('name', old.name, 'phone', old.phone, 'age', old.age, 'email', old.email),
    jsonb_build_object('name', new.name, 'phone', new.phone, 'age', new.age, 'email', new.email),
    '{}'
  );
  if array_length(v_fields, 1) > 0 then
    perform public.log_visitor_event(new.id, 'record_updated', jsonb_build_object('fields', v_fields));
  end if;

  if old.whatsapp_opened_at is null and new.whatsapp_opened_at is not null then
    perform public.log_visitor_event(new.id, 'whatsapp_opened', '{}');
  end if;
  if new.class_invite_sent_at is not null and new.class_invite_sent_at is distinct from old.class_invite_sent_at then
    perform public.log_visitor_event(new.id, 'class_invite_sent', '{}');
  end if;
  if new.membership_interest_sent_at is not null
     and new.membership_interest_sent_at is distinct from old.membership_interest_sent_at then
    perform public.log_visitor_event(new.id, 'membership_interest_sent', '{}');
  end if;

  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_record_updated()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_fields text[];
begin
  v_fields := public.changed_fields(to_jsonb(old), to_jsonb(new), array['person_id', 'updated_at']);
  if tg_table_name = 'person_sensitive' then
    v_fields := array(select f from unnest(v_fields) as f where f in ('birth_date', 'origin_church'));
  end if;
  if array_length(v_fields, 1) > 0 then
    perform public.log_member_event(new.person_id, 'record_updated', jsonb_build_object('fields', v_fields));
  end if;
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_visitor_event(p_person_id uuid, p_event text, p_detail jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.visitor_events (person_id, event, detail)
  values (p_person_id, p_event, coalesce(p_detail, '{}'::jsonb));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_coffee_attended(p_attendance_id uuid, p_person_id uuid, p_actor_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_event_date date;
begin
  select e.event_date into v_event_date
    from public.coffee_attendance a
    join public.coffee_events e on e.id = a.coffee_event_id
    where a.id = p_attendance_id;

  if v_event_date > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Só dá para marcar presença a partir do dia do café.';
  end if;

  update public.coffee_attendance
    set attended = true
    where id = p_attendance_id;

  update public.people
    set status = 'pending_signup', updated_at = now()
    where id = p_person_id;

  insert into public.status_history (person_id, from_status, to_status, changed_by, note)
    values (p_person_id, 'welcome_coffee', 'pending_signup', p_actor_id, 'Compareceu ao café de boas-vindas');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_general_admin_notes_private()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.private := public."current_role"() = 'general_admin';
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.membership_lesson_progress(p_person_id uuid)
 RETURNS TABLE(lessons_attended integer, lessons_total integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    coalesce(s.lessons_attended, 0)::int,
    (select count(*) from public.lessons l where l.cohort_id = e.cohort_id)::int
  from public.enrollments e
  left join public.enrollment_attendance_summary s on s.enrollment_id = e.id
  where e.person_id = p_person_id
  order by e.created_at desc
  limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.place_in_coffee(p_person_id uuid, p_coffee_event_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_attendance_id uuid;
begin
  update public.coffee_attendance
    set coffee_event_id = p_coffee_event_id
    where person_id = p_person_id and not attended
    returning id into v_attendance_id;

  if v_attendance_id is null then
    insert into public.coffee_attendance (person_id, coffee_event_id)
      values (p_person_id, p_coffee_event_id)
      returning id into v_attendance_id;
  end if;

  return v_attendance_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.promote_membership_on_attendance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_person_id uuid;
  v_attended  int;
  v_total     int;
begin
  select e.person_id,
         (select count(*) from public.lesson_attendance la where la.enrollment_id = e.id and la.attended),
         (select count(*) from public.lessons l where l.cohort_id = e.cohort_id)
    into v_person_id, v_attended, v_total
    from public.enrollments e
    where e.id = new.enrollment_id;

  if v_person_id is null or v_total = 0 or v_attended < v_total then
    return new;
  end if;

  -- membership_form_at not null = a ficha já foi preenchida. Quem concluiu as
  -- aulas e nunca preencheu segue em 'integration', como sempre foi.
  update public.people
    set status = 'membership_pending', updated_at = now()
    where id = v_person_id and status = 'integration' and membership_form_at is not null;

  if found then
    insert into public.status_history (person_id, from_status, to_status, note)
      values (v_person_id, 'integration', 'membership_pending',
              'Concluiu as aulas de Integração com a ficha de interesse já preenchida');
  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.propagate_family_to_spouse(p_person_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_spouse uuid;
  v_row record;
begin
  select relative_id into v_spouse
    from public.family_links where person_id = p_person_id and relation = 'spouse';
  if v_spouse is null then
    return;
  end if;

  for v_row in
    select relative_id, relation from public.family_links
     where person_id = p_person_id and relation <> 'spouse' and relative_id <> v_spouse
  loop
    perform public.share_family_link(v_spouse, v_row.relative_id, v_row.relation);
  end loop;

  for v_row in
    select relative_id, relation from public.family_links
     where person_id = v_spouse and relation <> 'spouse' and relative_id <> p_person_id
  loop
    perform public.share_family_link(p_person_id, v_row.relative_id, v_row.relation);
  end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.prune_family_shares(p_before jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row record;
  v_spouse uuid;
  v_gender text;
  v_mirror text;
  v_changed boolean := true;
  v_round integer := 0;
begin
  while v_changed and v_round < 6 loop
    v_changed := false;
    v_round := v_round + 1;
    for v_row in
      select b.p as person_id, b.r as relative_id, b.rel as relation
        from jsonb_to_recordset(p_before) as b(p uuid, r uuid, rel text)
       where b.rel <> 'spouse'
         and not exists (
           select 1 from public.family_links l
            where l.person_id = b.p and l.relative_id = b.r and l.relation = b.rel
         )
    loop
      select relative_id into v_spouse
        from public.family_links where person_id = v_row.person_id and relation = 'spouse';
      if v_spouse is not null then
        select gender into v_gender from public.member_profiles where person_id = v_row.relative_id;
        v_mirror := public.family_mirror(v_row.relation, v_gender);
        delete from public.family_links
         where person_id = v_spouse and relative_id = v_row.relative_id and relation = v_mirror;
        if found then
          delete from public.family_links where person_id = v_row.relative_id and relative_id = v_spouse;
          v_changed := true;
        end if;
      end if;
    end loop;
  end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.run_pipeline_maintenance()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_upcoming_event uuid;
  v_person uuid;
  v_archived integer := 0;
  v_seated integer := 0;
  v_closed integer := 0;
begin
  if auth.uid() is not null and coalesce(public."current_role"(), '') not in ('integration_team', 'admin', 'general_admin') then
    raise exception 'Sem permissão para rodar a manutenção do funil.';
  end if;

  with cohort_starts as (
    select c.id,
           (select l.date from public.lessons l where l.cohort_id = c.id order by (l.number <> 1), l.number limit 1) as first_date
      from public.cohorts c
  ),
  candidates as (
    select p.id,
           coalesce(
             p.signup_window_from,
             (select max(e.event_date)
                from public.coffee_attendance a
                join public.coffee_events e on e.id = a.coffee_event_id
                where a.person_id = p.id and a.attended)
           ) as coffee_date
      from public.people p
      where p.status = 'pending_signup'
  ),
  missed as (
    select candidate.id
      from candidates candidate
      cross join lateral (
        select cs.first_date
          from cohort_starts cs
          where candidate.coffee_date is null or cs.first_date >= candidate.coffee_date
          order by
            case
              when candidate.coffee_date is null
               and cs.first_date is not null
               and ((cs.first_date + time '17:30') at time zone 'America/Sao_Paulo') > now()
              then 0 else 1
            end,
            cs.first_date nulls first
          limit 1
      ) target
      where target.first_date is not null
        and ((target.first_date + time '17:30') at time zone 'America/Sao_Paulo') <= now()
  ),
  archived as (
    update public.people p
       set status = 'archived', updated_at = now()
     where p.id in (select id from missed) and p.status = 'pending_signup'
     returning p.id
  )
  insert into public.status_history (person_id, from_status, to_status, changed_by, note)
  select a.id, 'pending_signup', 'archived', null, 'Não se inscreveu na turma até o início da primeira aula'
    from archived a;
  get diagnostics v_archived = row_count;

  select e.id into v_upcoming_event
    from public.coffee_events e
    where e.event_date >= v_today
    order by e.event_date
    limit 1;

  if v_upcoming_event is not null then
    for v_person in
      select p.id
        from public.people p
        where p.status = 'welcome_coffee'
          and not exists (
            select 1 from public.coffee_attendance a where a.person_id = p.id and not a.attended
          )
    loop
      perform public.place_in_coffee(v_person, v_upcoming_event);
      v_seated := v_seated + 1;
    end loop;
  end if;

  update public.cohorts c
     set status = 'closed'
   where c.status = 'active'
     and (select l.date from public.lessons l where l.cohort_id = c.id order by l.number desc limit 1) < v_today
     and not exists (
       select 1
         from public.enrollments en
         join public.people p on p.id = en.person_id
         where en.cohort_id = c.id and p.status = 'integration'
     );
  get diagnostics v_closed = row_count;

  return jsonb_build_object('archived', v_archived, 'seated', v_seated, 'closed', v_closed);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.save_membership_answers(p_person_id uuid, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text)
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
$function$
;

CREATE OR REPLACE FUNCTION public.service_sunday(p_at timestamp with time zone)
 RETURNS date
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select (p_at at time zone 'America/Sao_Paulo')::date
       - extract(dow from (p_at at time zone 'America/Sao_Paulo'))::int;
$function$
;

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

  if exists (
    select 1 from public.family_links l
     where l.person_id = p_person_id
       and not exists (
         select 1 from jsonb_to_recordset(v_before) as b(p uuid, r uuid, rel text)
          where b.p = l.person_id and b.r = l.relative_id and b.rel = l.relation
       )
  ) then
    delete from public.family_hidden where p_person_id in (person_id, relative_id);
  end if;

  for v_hidden in select value::uuid from jsonb_array_elements_text(p_hidden) loop
    insert into public.family_hidden (person_id, relative_id)
    values (p_person_id, v_hidden), (v_hidden, p_person_id)
    on conflict do nothing;
  end loop;

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
$function$
;

CREATE OR REPLACE FUNCTION public.set_family(p_person_id uuid, p_spouse_id uuid DEFAULT NULL::uuid, p_father_id uuid DEFAULT NULL::uuid, p_mother_id uuid DEFAULT NULL::uuid, p_child_ids uuid[] DEFAULT '{}'::uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_role text;
  v_gender text;
begin
  if public."current_role"() is distinct from 'general_admin' then
    raise exception 'Só o Administrador Geral pode alterar a família.';
  end if;

  delete from public.spouse_links where p_person_id in (person_a_id, person_b_id);
  if p_spouse_id is not null then
    insert into public.spouse_links (person_a_id, person_b_id)
    values (least(p_person_id, p_spouse_id), greatest(p_person_id, p_spouse_id));
  end if;

  delete from public.parent_links where child_id = p_person_id;
  if p_father_id is not null then
    insert into public.parent_links (parent_id, child_id, role) values (p_father_id, p_person_id, 'father');
  end if;
  if p_mother_id is not null then
    insert into public.parent_links (parent_id, child_id, role) values (p_mother_id, p_person_id, 'mother');
  end if;

  delete from public.parent_links
   where parent_id = p_person_id and not (child_id = any (coalesce(p_child_ids, '{}')));

  if coalesce(array_length(p_child_ids, 1), 0) > 0 then
    select gender into v_gender from public.member_profiles where person_id = p_person_id;
    v_role := case v_gender when 'male' then 'father' when 'female' then 'mother' end;
    if v_role is null then
      raise exception 'Informe o sexo em Dados pessoais antes de ligar os filhos.';
    end if;

    insert into public.parent_links (parent_id, child_id, role)
    select p_person_id, child, v_role from unnest(p_child_ids) as child
    on conflict (parent_id, child_id) do update set role = excluded.role;
  end if;
exception
  when unique_violation then
    raise exception 'Um dos filhos já tem % cadastrado(a).', case v_role when 'father' then 'pai' else 'mãe' end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_lesson_dates(p_cohort_id uuid, p_lesson_dates date[])
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_updated integer;
begin
  update lessons
  set date = lesson.date
  from unnest(p_lesson_dates) with ordinality as lesson(date, number)
  where lessons.cohort_id = p_cohort_id
    and lessons.number = lesson.number;

  get diagnostics v_updated = row_count;
  if v_updated <> coalesce(array_length(p_lesson_dates, 1), 0) then
    raise exception 'As datas não correspondem às aulas da turma.';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.share_family_link(p_target uuid, p_relative uuid, p_relation_of_spouse text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_relative_gender text;
  v_target_gender text;
  v_mirror text;
  v_inverse text;
begin
  select gender into v_relative_gender from public.member_profiles where person_id = p_relative;
  v_mirror := public.family_mirror(p_relation_of_spouse, v_relative_gender);
  if v_mirror is null then
    return;
  end if;
  if exists (select 1 from public.family_links where person_id = p_target and relative_id = p_relative) then
    return;
  end if;

  v_target_gender := public.family_parent_gender(p_target);
  v_inverse := public.family_inverse(v_mirror, v_target_gender);
  if v_inverse is null then
    return;
  end if;

  insert into public.family_links (person_id, relative_id, relation)
  values (p_target, p_relative, v_mirror), (p_relative, p_target, v_inverse);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.start_confirmed_member_active()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if new.status = 'member' and new.membership_status is null then
    new.membership_status := 'active';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_integration_signup(p_phone text, p_attending_since text, p_previous_church text, p_baptism_info text, p_conversion_testimony text, p_marital_status_story text)
 RETURNS TABLE(cohort_name text, lesson_dates date[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_person_id   uuid;
  v_cohort_id   uuid;
  v_cohort_name text;
  v_lesson_dates date[];
begin
  v_person_id := public.find_welcome_coffee_person(p_phone);

  select c.id, c.name into v_cohort_id, v_cohort_name
    from public.cohorts c
    join public.lessons l on l.cohort_id = c.id and l.number = 1
    where c.status = 'active'
      and ((l.date + time '17:30') at time zone 'America/Sao_Paulo') > now()
    order by l.date
    limit 1;

  if v_cohort_id is null then
    raise exception 'A próxima turma de Integração ainda não foi aberta. Fale com a Equipe de Integração.';
  end if;

  insert into public.person_sensitive (person_id, attending_since, previous_church, baptism_info, conversion_testimony, marital_status_story)
    values (v_person_id, p_attending_since, p_previous_church, p_baptism_info, p_conversion_testimony, p_marital_status_story)
    on conflict (person_id) do update
      set attending_since = excluded.attending_since,
          previous_church = excluded.previous_church,
          baptism_info = excluded.baptism_info,
          conversion_testimony = excluded.conversion_testimony,
          marital_status_story = excluded.marital_status_story,
          updated_at = now();

  update public.people
    set status = 'integration',
        updated_at = now()
    where id = v_person_id;

  insert into public.enrollments (person_id, cohort_id)
    values (v_person_id, v_cohort_id)
    on conflict (person_id, cohort_id) do nothing;

  insert into public.status_history (person_id, from_status, to_status, note)
    values (v_person_id, 'pending_signup', 'integration', 'Inscrição via formulário público');

  select array_agg(l.date order by l.number) into v_lesson_dates
    from public.lessons l
    where l.cohort_id = v_cohort_id;

  return query select v_cohort_name, v_lesson_dates;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_makeup_attendance(p_token uuid, p_notes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.lesson_attendance set attended = true where id = p_token;
  if not found then
    raise exception 'Link inválido ou expirado.';
  end if;

  insert into public.lesson_makeups (lesson_attendance_id, notes)
  values (p_token, p_notes)
  on conflict (lesson_attendance_id) do update set notes = excluded.notes;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_membership_form(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text)
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
  $function$
;

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
  $function$
;

CREATE OR REPLACE FUNCTION public.suggest_family_links(p_person_id uuid, p_links jsonb)
 RETURNS TABLE(relation text, person_id uuid, name text, gender text, derived boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_link jsonb;
  v_relative uuid;
  v_relation text;
  v_gender text;
  v_inverse text;
  v_result jsonb := '[]'::jsonb;
begin
  if public."current_role"() is distinct from 'general_admin' then
    raise exception 'Só o Administrador Geral pode alterar a família.';
  end if;

  v_gender := public.family_parent_gender(p_person_id);

  begin
    delete from public.family_links l where p_person_id in (l.person_id, l.relative_id);
    delete from public.family_hidden h where p_person_id in (h.person_id, h.relative_id);

    for v_link in select * from jsonb_array_elements(p_links) loop
      v_relative := (v_link ->> 'relative_id')::uuid;
      v_relation := v_link ->> 'relation';
      v_inverse := case when v_relation is null then null else public.family_inverse(v_relation, v_gender) end;
      if v_inverse is null or v_relative = p_person_id
         or not exists (select 1 from public.people p where p.id = v_relative and p.status = 'member') then
        continue;
      end if;
      begin
        insert into public.family_links (person_id, relative_id, relation)
        values (p_person_id, v_relative, v_relation), (v_relative, p_person_id, v_inverse);
      exception when others then
        null;
      end;
    end loop;

    perform public.expand_family_links(p_person_id);
    perform public.propagate_family_to_spouse(p_person_id);
    perform public.drop_derivable_links();

    select coalesce(jsonb_agg(to_jsonb(g)), '[]'::jsonb) into v_result from public.get_family_links(p_person_id) g;

    raise exception 'family preview' using errcode = 'ZZ001';
  exception when sqlstate 'ZZ001' then
    null;
  end;

  return query
    select r.relation, r.person_id, r.name, r.gender, r.derived
      from jsonb_to_recordset(v_result) as r(relation text, person_id uuid, name text, gender text, derived boolean);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_family_couples()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_before bigint;
  v_after bigint;
  v_round integer := 0;
  v_person uuid;
begin
  loop
    select count(*) into v_before from public.family_links;
    for v_person in select person_id from public.family_links where relation = 'spouse' loop
      perform public.propagate_family_to_spouse(v_person);
    end loop;
    select count(*) into v_after from public.family_links;
    v_round := v_round + 1;
    exit when v_after = v_before or v_round >= 6;
  end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_login_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid;
begin
  select pr.id into v_user_id from public.profiles pr where pr.person_id = new.id;
  if v_user_id is null then
    return new;
  end if;

  if btrim(coalesce(new.email, '')) = '' then
    raise exception 'Voluntários precisam de e-mail no cadastro, porque ele é o login.';
  end if;

  update auth.users
     set email = lower(btrim(new.email)), updated_at = now()
   where id = v_user_id;

  update auth.identities
     set identity_data = identity_data || jsonb_build_object('email', lower(btrim(new.email))), updated_at = now()
   where user_id = v_user_id and provider = 'email';

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_small_group_leader_ministry_from_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  begin
    if tg_op in ('DELETE', 'UPDATE') and old.role = 'leader' then
      perform public.sync_small_group_leader_ministry(old.person_id);
    end if;
    if tg_op in ('INSERT', 'UPDATE') and new.role = 'leader' then
      perform public.sync_small_group_leader_ministry(new.person_id);
    end if;
    return null;
  end;
  $function$
;

CREATE OR REPLACE FUNCTION public.sync_small_group_leader_ministry(p_person_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  declare
    v_ministry_id uuid;
  begin
    select id into v_ministry_id from public.ministries where kind = 'small_group_leaders';
    if v_ministry_id is null then
      return;
    end if;
    perform set_config('app.automatic_ministry_sync', 'on', true);
    if exists (select 1 from public.small_group_roles where person_id = p_person_id and role = 'leader') then
      insert into public.person_ministries (person_id, ministry_id)
      values (p_person_id, v_ministry_id)
      on conflict do nothing;
    else
      delete from public.person_ministries where person_id = p_person_id and ministry_id = v_ministry_id;
    end if;
    perform set_config('app.automatic_ministry_sync', '', true);
  end;
  $function$
;

CREATE OR REPLACE FUNCTION public.team_contacts(p_stage text)
 RETURNS TABLE(name text, phone text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select split_part(btrim(pe.name), ' ', 1), pe.phone
    from public.profiles pr
    join public.people pe on pe.id = pr.person_id
   where pr.role = any (
           case p_stage
             when 'class' then array['admin', 'teacher']
             else array['integration_team']
           end
         )
     and pe.membership_status = 'active'
     and pe.phone is not null
     and pe.phone <> ''
   order by pe.name;
$function$
;

CREATE OR REPLACE FUNCTION public.unlink_former_member()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  begin
    if new.membership_status in ('transferred', 'removed', 'deceased')
       and new.membership_status is distinct from old.membership_status then
      delete from public.person_small_groups where person_id = new.id;
      delete from public.person_ministries where person_id = new.id;
      delete from public.member_flags where person_id = new.id;
    end if;
    return new;
  end;
  $function$
;

CREATE OR REPLACE FUNCTION public.update_own_identity(p_name text, p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if btrim(coalesce(p_name, '')) = '' or btrim(coalesce(p_email, '')) = '' then
    raise exception 'Informe o nome e o e-mail.';
  end if;

  update public.people p
     set name = btrim(p_name),
         email = lower(btrim(p_email)),
         updated_at = now()
    from public.profiles pr
   where pr.id = auth.uid()
     and p.id = pr.person_id;

  if not found then
    raise exception 'Perfil do usuário não encontrado.';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_volunteer_identity(p_profile_id uuid, p_name text, p_email text, p_phone text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_actor text := public."current_role"();
  v_target_role text;
begin
  if btrim(coalesce(p_name, '')) = '' or btrim(coalesce(p_email, '')) = '' then
    raise exception 'Informe o nome e o e-mail.';
  end if;

  select role into v_target_role from public.profiles where id = p_profile_id;
  if v_target_role is null then
    raise exception 'Voluntário não encontrado.';
  end if;

  if not (
    p_profile_id = auth.uid()
    or v_actor = 'general_admin'
    or (v_actor = 'admin' and v_target_role in ('integration_team', 'teacher'))
  ) then
    raise exception 'Você não tem permissão para editar este voluntário.';
  end if;

  update public.people p
     set name = btrim(p_name),
         email = lower(btrim(p_email)),
         phone = nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), ''),
         updated_at = now()
    from public.profiles pr
   where pr.id = p_profile_id
     and p.id = pr.person_id;
end;
$function$
;

alter table public.coffee_attendance add constraint coffee_attendance_pkey PRIMARY KEY (id);

alter table public.coffee_events add constraint coffee_events_pkey PRIMARY KEY (id);

alter table public.cohorts add constraint cohorts_pkey PRIMARY KEY (id);

alter table public.contact_attempts add constraint contact_attempts_pkey PRIMARY KEY (id);

alter table public.councils add constraint councils_pkey PRIMARY KEY (id);

alter table public.enrollments add constraint enrollments_pkey PRIMARY KEY (id);

alter table public.family_hidden add constraint family_hidden_pkey PRIMARY KEY (person_id, relative_id);

alter table public.family_links add constraint family_links_pkey PRIMARY KEY (person_id, relative_id);

alter table public.lesson_attendance add constraint lesson_attendance_pkey PRIMARY KEY (id);

alter table public.lesson_makeups add constraint lesson_makeups_pkey PRIMARY KEY (lesson_attendance_id);

alter table public.lessons add constraint lessons_pkey PRIMARY KEY (id);

alter table public.member_events add constraint member_events_pkey PRIMARY KEY (id);

alter table public.member_flags add constraint member_flags_pkey PRIMARY KEY (person_id, flag);

alter table public.member_profiles add constraint member_profiles_pkey PRIMARY KEY (person_id);

alter table public.membership_alert_resolutions add constraint membership_alert_resolutions_pkey PRIMARY KEY (person_id, code);

alter table public.ministries add constraint ministries_pkey PRIMARY KEY (id);

alter table public.ministry_leaders add constraint ministry_leaders_pkey PRIMARY KEY (ministry_id, person_id);

alter table public.parent_links add constraint parent_links_pkey PRIMARY KEY (parent_id, child_id);

alter table public.pastoral_notes add constraint pastoral_notes_pkey PRIMARY KEY (id);

alter table public.people add constraint people_pkey PRIMARY KEY (id);

alter table public.person_ministries add constraint person_ministries_pkey PRIMARY KEY (person_id, ministry_id);

alter table public.person_sensitive add constraint person_sensitive_pkey PRIMARY KEY (person_id);

alter table public.person_small_groups add constraint person_small_groups_pkey PRIMARY KEY (person_id, small_group_id);

alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);

alter table public.small_group_roles add constraint small_group_roles_pkey PRIMARY KEY (small_group_id, person_id, role);

alter table public.small_groups add constraint small_groups_pkey PRIMARY KEY (id);

alter table public.spouse_links add constraint spouse_links_pkey PRIMARY KEY (person_a_id, person_b_id);

alter table public.status_history add constraint status_history_pkey PRIMARY KEY (id);

alter table public.visitor_events add constraint visitor_events_pkey PRIMARY KEY (id);

alter table public.coffee_attendance add constraint coffee_attendance_person_id_coffee_event_id_key UNIQUE (person_id, coffee_event_id);

alter table public.councils add constraint councils_meeting_date_key UNIQUE (meeting_date);

alter table public.enrollments add constraint enrollments_person_id_cohort_id_key UNIQUE (person_id, cohort_id);

alter table public.lesson_attendance add constraint lesson_attendance_enrollment_id_lesson_id_key UNIQUE (enrollment_id, lesson_id);

alter table public.lessons add constraint lessons_cohort_id_number_key UNIQUE (cohort_id, number);

alter table public.member_profiles add constraint member_profiles_cpf_key UNIQUE (cpf);

alter table public.ministries add constraint ministries_name_key UNIQUE (name);

alter table public.parent_links add constraint parent_links_child_id_role_key UNIQUE (child_id, role);

alter table public.profiles add constraint profiles_person_id_key UNIQUE (person_id);

alter table public.small_groups add constraint small_groups_name_key UNIQUE (name);

alter table public.cohorts add constraint cohorts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'closed'::text])));

alter table public.contact_attempts add constraint contact_attempts_channel_check CHECK ((channel = ANY (ARRAY['video'::text, 'audio'::text, 'text'::text])));

alter table public.contact_attempts add constraint contact_attempts_result_check CHECK ((result = ANY (ARRAY['accepted'::text, 'declined'::text, 'no_response'::text])));

alter table public.family_hidden add constraint family_hidden_check CHECK ((person_id <> relative_id));

alter table public.family_links add constraint family_links_check CHECK ((person_id <> relative_id));

alter table public.family_links add constraint family_links_relation_check CHECK ((relation = ANY (ARRAY['spouse'::text, 'child'::text, 'grandfather'::text, 'grandmother'::text, 'father'::text, 'mother'::text, 'sibling'::text, 'grandchild'::text, 'parent_in_law'::text, 'son_in_law'::text, 'daughter_in_law'::text, 'sibling_in_law'::text, 'uncle'::text, 'nephew'::text, 'cousin'::text, 'friend'::text])));

alter table public.lessons add constraint lessons_number_check CHECK (((number >= 1) AND (number <= 4)));

alter table public.member_events add constraint member_events_event_check CHECK ((event = ANY (ARRAY['membership_status_changed'::text, 'council_changed'::text, 'record_updated'::text, 'small_group_joined'::text, 'small_group_left'::text, 'ministry_joined'::text, 'ministry_left'::text, 'small_group_role_added'::text, 'small_group_role_removed'::text, 'ministry_leader_added'::text, 'ministry_leader_removed'::text, 'family_added'::text, 'family_removed'::text, 'flag_added'::text, 'flag_removed'::text])));

alter table public.member_flags add constraint member_flags_flag_check CHECK ((flag = ANY (ARRAY['absent'::text, 'attention'::text])));

alter table public.member_profiles add constraint member_profiles_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text])));

alter table public.member_profiles add constraint member_profiles_marital_status_check CHECK ((marital_status = ANY (ARRAY['single'::text, 'married'::text, 'widowed'::text, 'divorced'::text, 'stable_union'::text])));

alter table public.membership_alert_resolutions add constraint membership_alert_resolutions_code_check CHECK ((code = ANY (ARRAY['secret_society'::text, 'baptism'::text])));

alter table public.ministries add constraint ministries_kind_check CHECK ((kind = ANY (ARRAY['manual'::text, 'small_group_leaders'::text])));

alter table public.parent_links add constraint parent_links_check CHECK ((parent_id <> child_id));

alter table public.parent_links add constraint parent_links_role_check CHECK ((role = ANY (ARRAY['father'::text, 'mother'::text])));

alter table public.people add constraint people_entry_type_check CHECK ((entry_type = ANY (ARRAY['baptism'::text, 'transfer_letter'::text, 'acclamation'::text, 'reconciliation'::text])));

alter table public.people add constraint people_membership_status_check CHECK ((membership_status = ANY (ARRAY['active'::text, 'transferred'::text, 'removed'::text, 'deceased'::text])));

alter table public.people add constraint people_membership_status_only_members CHECK (((status = 'member'::text) = (membership_status IS NOT NULL)));

alter table public.people add constraint people_origin_check CHECK ((origin = ANY (ARRAY['integration'::text, 'imported'::text, 'membership_signup'::text])));

alter table public.people add constraint people_status_check CHECK ((status = ANY (ARRAY['initial_contact'::text, 'retry_contact'::text, 'welcome_coffee'::text, 'pending_signup'::text, 'integration'::text, 'membership_pending'::text, 'member'::text, 'archived'::text])));

alter table public.person_sensitive add constraint person_sensitive_wants_small_group_check CHECK ((wants_small_group = ANY (ARRAY['yes'::text, 'not_now'::text, 'already'::text])));

alter table public.profiles add constraint profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'integration_team'::text, 'general_admin'::text, 'teacher'::text, 'developer'::text])));

alter table public.small_group_roles add constraint small_group_roles_role_check CHECK ((role = ANY (ARRAY['leader'::text, 'host'::text])));

alter table public.small_groups add constraint small_groups_meeting_day_check CHECK ((meeting_day = ANY (ARRAY['monday'::text, 'tuesday'::text, 'wednesday'::text, 'thursday'::text, 'friday'::text, 'saturday'::text])));

alter table public.spouse_links add constraint spouse_links_check CHECK ((person_a_id < person_b_id));

alter table public.visitor_events add constraint visitor_events_event_check CHECK ((event = ANY (ARRAY['record_updated'::text, 'whatsapp_opened'::text, 'class_invite_sent'::text, 'membership_interest_sent'::text, 'lesson_attended'::text, 'lesson_unmarked'::text])));

alter table public.coffee_attendance add constraint coffee_attendance_coffee_event_id_fkey FOREIGN KEY (coffee_event_id) REFERENCES coffee_events(id) ON DELETE CASCADE;

alter table public.coffee_attendance add constraint coffee_attendance_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.contact_attempts add constraint contact_attempts_made_by_fkey FOREIGN KEY (made_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.contact_attempts add constraint contact_attempts_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.councils add constraint councils_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.enrollments add constraint enrollments_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE CASCADE;

alter table public.enrollments add constraint enrollments_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.family_hidden add constraint family_hidden_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.family_hidden add constraint family_hidden_relative_id_fkey FOREIGN KEY (relative_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.family_links add constraint family_links_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.family_links add constraint family_links_relative_id_fkey FOREIGN KEY (relative_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.lesson_attendance add constraint lesson_attendance_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE;

alter table public.lesson_attendance add constraint lesson_attendance_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

alter table public.lesson_makeups add constraint lesson_makeups_lesson_attendance_id_fkey FOREIGN KEY (lesson_attendance_id) REFERENCES lesson_attendance(id) ON DELETE CASCADE;

alter table public.lessons add constraint lessons_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE CASCADE;

alter table public.member_events add constraint member_events_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.member_events add constraint member_events_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.member_flags add constraint member_flags_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.member_flags add constraint member_flags_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.member_profiles add constraint member_profiles_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.membership_alert_resolutions add constraint membership_alert_resolutions_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.membership_alert_resolutions add constraint membership_alert_resolutions_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.ministry_leaders add constraint ministry_leaders_ministry_id_fkey FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE;

alter table public.ministry_leaders add constraint ministry_leaders_person_id_ministry_id_fkey FOREIGN KEY (person_id, ministry_id) REFERENCES person_ministries(person_id, ministry_id) ON DELETE CASCADE;

alter table public.parent_links add constraint parent_links_child_id_fkey FOREIGN KEY (child_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.parent_links add constraint parent_links_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.pastoral_notes add constraint pastoral_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.pastoral_notes add constraint pastoral_notes_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.people add constraint people_council_id_fkey FOREIGN KEY (council_id) REFERENCES councils(id) ON DELETE SET NULL;

alter table public.person_ministries add constraint person_ministries_ministry_id_fkey FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE;

alter table public.person_ministries add constraint person_ministries_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.person_sensitive add constraint person_sensitive_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.person_small_groups add constraint person_small_groups_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.person_small_groups add constraint person_small_groups_small_group_id_fkey FOREIGN KEY (small_group_id) REFERENCES small_groups(id) ON DELETE CASCADE;

alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public.profiles add constraint profiles_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE RESTRICT;

alter table public.small_group_roles add constraint small_group_roles_membership_fkey FOREIGN KEY (person_id, small_group_id) REFERENCES person_small_groups(person_id, small_group_id) ON DELETE CASCADE;

alter table public.small_group_roles add constraint small_group_roles_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.small_group_roles add constraint small_group_roles_small_group_id_fkey FOREIGN KEY (small_group_id) REFERENCES small_groups(id) ON DELETE CASCADE;

alter table public.spouse_links add constraint spouse_links_person_a_id_fkey FOREIGN KEY (person_a_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.spouse_links add constraint spouse_links_person_b_id_fkey FOREIGN KEY (person_b_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.status_history add constraint status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.status_history add constraint status_history_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

alter table public.visitor_events add constraint visitor_events_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

alter table public.visitor_events add constraint visitor_events_person_id_fkey FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX coffee_attendance_one_open_per_person ON public.coffee_attendance USING btree (person_id) WHERE (NOT attended);

CREATE UNIQUE INDEX family_links_one_father_key ON public.family_links USING btree (person_id) WHERE (relation = 'father'::text);

CREATE UNIQUE INDEX family_links_one_mother_key ON public.family_links USING btree (person_id) WHERE (relation = 'mother'::text);

CREATE UNIQUE INDEX family_links_one_spouse_key ON public.family_links USING btree (person_id) WHERE (relation = 'spouse'::text);

CREATE INDEX member_events_person_idx ON public.member_events USING btree (person_id, created_at);

CREATE UNIQUE INDEX ministries_one_automatic_kind ON public.ministries USING btree (kind) WHERE (kind <> 'manual'::text);

CREATE INDEX people_council_id_idx ON public.people USING btree (council_id);

CREATE UNIQUE INDEX people_phone_key ON public.people USING btree (phone) WHERE ((phone IS NOT NULL) AND (status <> 'archived'::text));

CREATE INDEX person_ministries_ministry_id_idx ON public.person_ministries USING btree (ministry_id);

CREATE INDEX visitor_events_person_idx ON public.visitor_events USING btree (person_id, created_at);

create view public.enrollment_attendance_summary with (security_invoker=true) as
 SELECT e.id AS enrollment_id,
    e.person_id,
    e.cohort_id,
    count(la.*) FILTER (WHERE la.attended) AS lessons_attended,
    count(la.*) AS lessons_recorded
   FROM (enrollments e
     LEFT JOIN lesson_attendance la ON ((la.enrollment_id = e.id)))
  GROUP BY e.id, e.person_id, e.cohort_id;

create view public.membership_alerts with (security_invoker=true) as
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

CREATE TRIGGER lesson_attendance_events AFTER INSERT OR UPDATE OF attended ON public.lesson_attendance FOR EACH ROW EXECUTE FUNCTION log_lesson_attendance();

CREATE TRIGGER lesson_attendance_promotes_membership AFTER INSERT OR UPDATE OF attended ON public.lesson_attendance FOR EACH ROW WHEN (new.attended) EXECUTE FUNCTION promote_membership_on_attendance();

CREATE TRIGGER member_flags_events AFTER INSERT OR DELETE ON public.member_flags FOR EACH ROW EXECUTE FUNCTION log_member_flag();

CREATE TRIGGER member_profiles_record_updated AFTER UPDATE ON public.member_profiles FOR EACH ROW EXECUTE FUNCTION log_record_updated();

CREATE TRIGGER ministry_leaders_events AFTER INSERT OR DELETE ON public.ministry_leaders FOR EACH ROW EXECUTE FUNCTION log_community_link();

CREATE TRIGGER pastoral_notes_private_for_general_admin BEFORE INSERT ON public.pastoral_notes FOR EACH ROW EXECUTE FUNCTION mark_general_admin_notes_private();

CREATE TRIGGER format_people_name BEFORE INSERT OR UPDATE OF name ON public.people FOR EACH ROW EXECUTE FUNCTION format_people_name();

CREATE TRIGGER people_confirmed_member_starts_active BEFORE INSERT OR UPDATE OF status ON public.people FOR EACH ROW EXECUTE FUNCTION start_confirmed_member_active();

CREATE TRIGGER people_member_events AFTER UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION log_people_member_events();

CREATE TRIGGER people_visitor_events AFTER UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION log_people_visitor_events();

CREATE TRIGGER sync_login_email AFTER UPDATE OF email ON public.people FOR EACH ROW WHEN ((new.email IS DISTINCT FROM old.email)) EXECUTE FUNCTION sync_login_email();

CREATE TRIGGER unlink_former_member BEFORE UPDATE OF membership_status ON public.people FOR EACH ROW EXECUTE FUNCTION unlink_former_member();

CREATE TRIGGER person_ministries_events AFTER INSERT OR DELETE ON public.person_ministries FOR EACH ROW EXECUTE FUNCTION log_community_link();

CREATE TRIGGER person_ministries_guard_automatic BEFORE INSERT OR DELETE ON public.person_ministries FOR EACH ROW EXECUTE FUNCTION guard_automatic_ministry_links();

CREATE TRIGGER person_sensitive_record_updated AFTER UPDATE ON public.person_sensitive FOR EACH ROW EXECUTE FUNCTION log_record_updated();

CREATE TRIGGER person_small_groups_events AFTER INSERT OR DELETE ON public.person_small_groups FOR EACH ROW EXECUTE FUNCTION log_community_link();

CREATE TRIGGER guard_profile_privileges BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION guard_profile_privileges();

CREATE TRIGGER small_group_roles_events AFTER INSERT OR DELETE ON public.small_group_roles FOR EACH ROW EXECUTE FUNCTION log_community_link();

CREATE TRIGGER small_group_roles_leader_ministry AFTER INSERT OR DELETE OR UPDATE ON public.small_group_roles FOR EACH ROW EXECUTE FUNCTION sync_small_group_leader_ministry_from_role();

CREATE TRIGGER spouse_links_single_spouse BEFORE INSERT OR UPDATE ON public.spouse_links FOR EACH ROW EXECUTE FUNCTION guard_single_spouse();

alter table public.coffee_attendance enable row level security;

alter table public.coffee_events enable row level security;

alter table public.cohorts enable row level security;

alter table public.contact_attempts enable row level security;

alter table public.councils enable row level security;

alter table public.enrollments enable row level security;

alter table public.family_hidden enable row level security;

alter table public.family_links enable row level security;

alter table public.lesson_attendance enable row level security;

alter table public.lesson_makeups enable row level security;

alter table public.lessons enable row level security;

alter table public.member_events enable row level security;

alter table public.member_flags enable row level security;

alter table public.member_profiles enable row level security;

alter table public.membership_alert_resolutions enable row level security;

alter table public.ministries enable row level security;

alter table public.ministry_leaders enable row level security;

alter table public.parent_links enable row level security;

alter table public.pastoral_notes enable row level security;

alter table public.people enable row level security;

alter table public.person_ministries enable row level security;

alter table public.person_sensitive enable row level security;

alter table public.person_small_groups enable row level security;

alter table public.profiles enable row level security;

alter table public.small_group_roles enable row level security;

alter table public.small_groups enable row level security;

alter table public.spouse_links enable row level security;

alter table public.status_history enable row level security;

alter table public.visitor_events enable row level security;

create policy coffee_attendance_manage_team_general_admin_admin on public.coffee_attendance as permissive for all to public
  using (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])))
  with check (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])));

create policy coffee_attendance_select_all_authenticated on public.coffee_attendance as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy coffee_events_manage_team_admin on public.coffee_events as permissive for all to public
  using (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])))
  with check (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])));

create policy coffee_events_select_all_authenticated on public.coffee_events as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy cohorts_manage_admin_general_admin on public.cohorts as permissive for all to public
  using (("current_role"() = ANY (ARRAY['admin'::text, 'general_admin'::text])))
  with check (("current_role"() = ANY (ARRAY['admin'::text, 'general_admin'::text])));

create policy cohorts_select_all_authenticated on public.cohorts as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy contact_attempts_insert_team_admin on public.contact_attempts as permissive for insert to public
  with check (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])));

create policy contact_attempts_select_visible_people on public.contact_attempts as permissive for select to public
  using ((EXISTS ( SELECT 1
   FROM people p
  WHERE (p.id = contact_attempts.person_id))));

create policy contact_attempts_update_team_admin on public.contact_attempts as permissive for update to public
  using (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])))
  with check (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])));

create policy councils_delete_general_admin on public.councils as permissive for delete to public
  using (("current_role"() = 'general_admin'::text));

create policy councils_insert_general_admin on public.councils as permissive for insert to public
  with check (("current_role"() = 'general_admin'::text));

create policy councils_select_leadership on public.councils as permissive for select to public
  using (("current_role"() = ANY (ARRAY['general_admin'::text, 'admin'::text])));

create policy councils_update_general_admin on public.councils as permissive for update to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy enrollments_manage_team_admin on public.enrollments as permissive for all to public
  using (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])))
  with check (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])));

create policy enrollments_select_all_authenticated on public.enrollments as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy family_hidden_read_general_admin on public.family_hidden as permissive for select to public
  using (("current_role"() = 'general_admin'::text));

create policy family_links_read_general_admin on public.family_links as permissive for select to public
  using (("current_role"() = 'general_admin'::text));

create policy lesson_attendance_manage_teacher_admin on public.lesson_attendance as permissive for all to public
  using (("current_role"() = ANY (ARRAY['teacher'::text, 'admin'::text, 'general_admin'::text])))
  with check (("current_role"() = ANY (ARRAY['teacher'::text, 'admin'::text, 'general_admin'::text])));

create policy lesson_attendance_select_all_authenticated on public.lesson_attendance as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy lesson_makeups_select_general_admin_admin_teacher on public.lesson_makeups as permissive for select to public
  using ((("current_role"() = ANY (ARRAY['general_admin'::text, 'admin'::text, 'teacher'::text])) AND (EXISTS ( SELECT 1
   FROM ((lesson_attendance la
     JOIN enrollments e ON ((e.id = la.enrollment_id)))
     JOIN people p ON ((p.id = e.person_id)))
  WHERE (la.id = lesson_makeups.lesson_attendance_id)))));

create policy lessons_manage_admin_general_admin on public.lessons as permissive for all to public
  using (("current_role"() = ANY (ARRAY['admin'::text, 'general_admin'::text])))
  with check (("current_role"() = ANY (ARRAY['admin'::text, 'general_admin'::text])));

create policy lessons_select_all_authenticated on public.lessons as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy member_events_read_general_admin on public.member_events as permissive for select to public
  using (("current_role"() = 'general_admin'::text));

create policy member_flags_manage_general_admin on public.member_flags as permissive for all to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy member_profiles_manage_general_admin on public.member_profiles as permissive for all to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy membership_alert_resolutions_insert_general_admin on public.membership_alert_resolutions as permissive for insert to public
  with check (("current_role"() = 'general_admin'::text));

create policy membership_alert_resolutions_select_general_admin_admin on public.membership_alert_resolutions as permissive for select to public
  using ((("current_role"() = ANY (ARRAY['general_admin'::text, 'admin'::text])) AND (EXISTS ( SELECT 1
   FROM people p
  WHERE (p.id = membership_alert_resolutions.person_id)))));

create policy membership_alert_resolutions_delete_general_admin on public.membership_alert_resolutions as permissive for delete to public
  using (("current_role"() = 'general_admin'::text));

create policy ministries_manage_general_admin on public.ministries as permissive for all to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy ministries_select_all_authenticated on public.ministries as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy ministry_leaders_manage_general_admin on public.ministry_leaders as permissive for all to authenticated
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy ministry_leaders_select_authenticated on public.ministry_leaders as permissive for select to authenticated
  using ((auth.uid() IS NOT NULL));

create policy parent_links_manage_general_admin on public.parent_links as permissive for all to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy pastoral_notes_delete on public.pastoral_notes as permissive for delete to public
  using ((can_manage_person_notes(person_id) AND can_see_person_note(private, created_by)));

create policy pastoral_notes_insert on public.pastoral_notes as permissive for insert to authenticated
  with check ((can_manage_person_notes(person_id) AND (created_by = auth.uid())));

create policy pastoral_notes_select on public.pastoral_notes as permissive for select to public
  using ((can_manage_person_notes(person_id) AND can_see_person_note(private, created_by)));

create policy pastoral_notes_update on public.pastoral_notes as permissive for update to authenticated
  using ((can_manage_person_notes(person_id) AND can_see_person_note(private, created_by) AND can_edit_person_note(created_by)))
  with check ((can_manage_person_notes(person_id) AND can_see_person_note(private, created_by) AND can_edit_person_note(created_by) AND (btrim(body) <> ''::text)));

create policy people_delete_team_general_admin_admin_initial_contact on public.people as permissive for delete to public
  using ((("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])) AND (status = 'initial_contact'::text)));

create policy people_insert_can_write on public.people as permissive for insert to public
  with check (can_write_person(status));

create policy people_select_can_read on public.people as permissive for select to public
  using (can_read_person(status));

create policy people_update_can_write on public.people as permissive for update to public
  using (can_write_person(status))
  with check (can_write_person(status));

create policy person_ministries_delete_general_admin on public.person_ministries as permissive for delete to public
  using (("current_role"() = 'general_admin'::text));

create policy person_ministries_insert_general_admin on public.person_ministries as permissive for insert to public
  with check (("current_role"() = 'general_admin'::text));

create policy person_ministries_select_visible_people on public.person_ministries as permissive for select to public
  using ((EXISTS ( SELECT 1
   FROM people p
  WHERE (p.id = person_ministries.person_id))));

create policy person_sensitive_manage_admin_integration on public.person_sensitive as permissive for all to public
  using ((("current_role"() = 'admin'::text) AND (EXISTS ( SELECT 1
   FROM people p
  WHERE ((p.id = person_sensitive.person_id) AND (p.status <> 'member'::text))))))
  with check ((("current_role"() = 'admin'::text) AND (EXISTS ( SELECT 1
   FROM people p
  WHERE ((p.id = person_sensitive.person_id) AND (p.status <> 'member'::text))))));

create policy person_sensitive_manage_general_admin on public.person_sensitive as permissive for all to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy person_small_groups_delete_general_admin on public.person_small_groups as permissive for delete to authenticated
  using (("current_role"() = 'general_admin'::text));

create policy person_small_groups_insert_general_admin on public.person_small_groups as permissive for insert to authenticated
  with check (("current_role"() = 'general_admin'::text));

create policy person_small_groups_select_visible_people on public.person_small_groups as permissive for select to authenticated
  using ((EXISTS ( SELECT 1
   FROM people p
  WHERE (p.id = person_small_groups.person_id))));

create policy profiles_manage_admin_general_admin on public.profiles as permissive for all to public
  using ((("current_role"() = 'general_admin'::text) OR (("current_role"() = 'admin'::text) AND (role = ANY (ARRAY['integration_team'::text, 'teacher'::text])))))
  with check ((("current_role"() = 'general_admin'::text) OR (("current_role"() = 'admin'::text) AND (role = ANY (ARRAY['integration_team'::text, 'teacher'::text])))));

create policy profiles_select_own_or_admin on public.profiles as permissive for select to public
  using (((id = auth.uid()) OR ("current_role"() = ANY (ARRAY['admin'::text, 'general_admin'::text]))));

create policy profiles_update_own_name on public.profiles as permissive for update to public
  using ((id = auth.uid()))
  with check ((id = auth.uid()));

create policy small_group_roles_manage_general_admin on public.small_group_roles as permissive for all to authenticated
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy small_group_roles_select_authenticated on public.small_group_roles as permissive for select to authenticated
  using ((auth.uid() IS NOT NULL));

create policy small_groups_manage_general_admin on public.small_groups as permissive for all to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy small_groups_select_all_authenticated on public.small_groups as permissive for select to public
  using ((auth.uid() IS NOT NULL));

create policy spouse_links_manage_general_admin on public.spouse_links as permissive for all to public
  using (("current_role"() = 'general_admin'::text))
  with check (("current_role"() = 'general_admin'::text));

create policy status_history_insert_team_general_admin_admin on public.status_history as permissive for insert to public
  with check (("current_role"() = ANY (ARRAY['integration_team'::text, 'general_admin'::text, 'admin'::text])));

create policy status_history_select_visible_people on public.status_history as permissive for select to public
  using ((EXISTS ( SELECT 1
   FROM people p
  WHERE (p.id = status_history.person_id))));

create policy visitor_events_read on public.visitor_events as permissive for select to public
  using (can_manage_person_notes(person_id));

create policy member_photos_delete_general_admin on storage.objects as permissive for delete to public
  using (((bucket_id = 'member-photos'::text) AND ("current_role"() = 'general_admin'::text)));

create policy member_photos_insert_general_admin on storage.objects as permissive for insert to public
  with check (((bucket_id = 'member-photos'::text) AND ("current_role"() = 'general_admin'::text)));

create policy member_photos_insert_submission on storage.objects as permissive for insert to anon, authenticated
  with check (((bucket_id = 'member-photos'::text) AND ((storage.foldername(name))[1] = 'submissions'::text)));

create policy member_photos_select_general_admin on storage.objects as permissive for select to public
  using (((bucket_id = 'member-photos'::text) AND ("current_role"() = 'general_admin'::text)));

create policy member_photos_update_general_admin on storage.objects as permissive for update to public
  using (((bucket_id = 'member-photos'::text) AND ("current_role"() = 'general_admin'::text)))
  with check (((bucket_id = 'member-photos'::text) AND ("current_role"() = 'general_admin'::text)));

revoke all on function public.annual_pipeline_counts(p_year integer) from public, anon, authenticated;
grant execute on function public.annual_pipeline_counts(p_year integer) to authenticated;
grant execute on function public.annual_pipeline_counts(p_year integer) to service_role;

revoke all on function public.attach_membership_photo(p_person_id uuid, p_photo_token text) from public, anon, authenticated;
grant execute on function public.attach_membership_photo(p_person_id uuid, p_photo_token text) to service_role;

revoke all on function public.can_edit_person_note(p_created_by uuid) from public, anon, authenticated;
grant execute on function public.can_edit_person_note(p_created_by uuid) to anon;
grant execute on function public.can_edit_person_note(p_created_by uuid) to authenticated;
grant execute on function public.can_edit_person_note(p_created_by uuid) to service_role;

revoke all on function public.can_manage_person_notes(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.can_manage_person_notes(p_person_id uuid) to anon;
grant execute on function public.can_manage_person_notes(p_person_id uuid) to authenticated;
grant execute on function public.can_manage_person_notes(p_person_id uuid) to service_role;

revoke all on function public.can_read_person(p_status text) from public, anon, authenticated;
grant execute on function public.can_read_person(p_status text) to authenticated;
grant execute on function public.can_read_person(p_status text) to service_role;

revoke all on function public.can_see_person_note(p_private boolean, p_created_by uuid) from public, anon, authenticated;
grant execute on function public.can_see_person_note(p_private boolean, p_created_by uuid) to anon;
grant execute on function public.can_see_person_note(p_private boolean, p_created_by uuid) to authenticated;
grant execute on function public.can_see_person_note(p_private boolean, p_created_by uuid) to service_role;

revoke all on function public.can_write_person(p_status text) from public, anon, authenticated;
grant execute on function public.can_write_person(p_status text) to authenticated;
grant execute on function public.can_write_person(p_status text) to service_role;

revoke all on function public.changed_fields(p_old jsonb, p_new jsonb, p_skip text[]) from public, anon, authenticated;
grant execute on function public.changed_fields(p_old jsonb, p_new jsonb, p_skip text[]) to anon;
grant execute on function public.changed_fields(p_old jsonb, p_new jsonb, p_skip text[]) to authenticated;
grant execute on function public.changed_fields(p_old jsonb, p_new jsonb, p_skip text[]) to service_role;

revoke all on function public.check_membership_interest_phone(p_phone text) from public, anon, authenticated;
grant execute on function public.check_membership_interest_phone(p_phone text) to anon;
grant execute on function public.check_membership_interest_phone(p_phone text) to authenticated;
grant execute on function public.check_membership_interest_phone(p_phone text) to service_role;

revoke all on function public.check_membership_signup_cpf(p_cpf text) from public, anon, authenticated;
grant execute on function public.check_membership_signup_cpf(p_cpf text) to anon;
grant execute on function public.check_membership_signup_cpf(p_cpf text) to authenticated;
grant execute on function public.check_membership_signup_cpf(p_cpf text) to service_role;

revoke all on function public.check_welcome_coffee_phone(p_phone text) from public, anon, authenticated;
grant execute on function public.check_welcome_coffee_phone(p_phone text) to anon;
grant execute on function public.check_welcome_coffee_phone(p_phone text) to authenticated;
grant execute on function public.check_welcome_coffee_phone(p_phone text) to service_role;

revoke all on function public.count_integration_people_by_status() from public, anon, authenticated;
grant execute on function public.count_integration_people_by_status() to authenticated;
grant execute on function public.count_integration_people_by_status() to service_role;

revoke all on function public.create_cohort(p_name text, p_lesson_dates date[]) from public, anon, authenticated;
grant execute on function public.create_cohort(p_name text, p_lesson_dates date[]) to authenticated;
grant execute on function public.create_cohort(p_name text, p_lesson_dates date[]) to service_role;

revoke all on function public.current_profile() from public, anon, authenticated;
grant execute on function public.current_profile() to anon;
grant execute on function public.current_profile() to authenticated;
grant execute on function public.current_profile() to service_role;

revoke all on function public."current_role"() from public, anon, authenticated;
grant execute on function public."current_role"() to anon;
grant execute on function public."current_role"() to authenticated;
grant execute on function public."current_role"() to service_role;

revoke all on function public.derive_family(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.derive_family(p_person_id uuid) to anon;
grant execute on function public.derive_family(p_person_id uuid) to authenticated;
grant execute on function public.derive_family(p_person_id uuid) to service_role;

revoke all on function public.drop_derivable_links() from public, anon, authenticated;
grant execute on function public.drop_derivable_links() to anon;
grant execute on function public.drop_derivable_links() to authenticated;
grant execute on function public.drop_derivable_links() to service_role;

revoke all on function public.expand_family_links(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.expand_family_links(p_person_id uuid) to service_role;

revoke all on function public.expand_family_person(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.expand_family_person(p_person_id uuid) to service_role;

revoke all on function public.family_compose(p_link text, p_next text) from public, anon, authenticated;
grant execute on function public.family_compose(p_link text, p_next text) to service_role;

revoke all on function public.family_inverse(p_relation text, p_gender text) from public, anon, authenticated;
grant execute on function public.family_inverse(p_relation text, p_gender text) to anon;
grant execute on function public.family_inverse(p_relation text, p_gender text) to authenticated;
grant execute on function public.family_inverse(p_relation text, p_gender text) to service_role;

revoke all on function public.family_mirror(p_relation text, p_relative_gender text) from public, anon, authenticated;
grant execute on function public.family_mirror(p_relation text, p_relative_gender text) to anon;
grant execute on function public.family_mirror(p_relation text, p_relative_gender text) to authenticated;
grant execute on function public.family_mirror(p_relation text, p_relative_gender text) to service_role;

revoke all on function public.family_parent_gender(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.family_parent_gender(p_person_id uuid) to anon;
grant execute on function public.family_parent_gender(p_person_id uuid) to authenticated;
grant execute on function public.family_parent_gender(p_person_id uuid) to service_role;

revoke all on function public.family_relation_gender(p_relation text) from public, anon, authenticated;
grant execute on function public.family_relation_gender(p_relation text) to anon;
grant execute on function public.family_relation_gender(p_relation text) to authenticated;
grant execute on function public.family_relation_gender(p_relation text) to service_role;

revoke all on function public.find_membership_interest_person(p_phone text) from public, anon, authenticated;
grant execute on function public.find_membership_interest_person(p_phone text) to service_role;

revoke all on function public.find_welcome_coffee_person(p_phone text) from public, anon, authenticated;
grant execute on function public.find_welcome_coffee_person(p_phone text) to service_role;

revoke all on function public.format_people_name() from public, anon, authenticated;
grant execute on function public.format_people_name() to anon;
grant execute on function public.format_people_name() to authenticated;
grant execute on function public.format_people_name() to service_role;

revoke all on function public.format_person_name(p_name text) from public, anon, authenticated;
grant execute on function public.format_person_name(p_name text) to anon;
grant execute on function public.format_person_name(p_name text) to authenticated;
grant execute on function public.format_person_name(p_name text) to service_role;

revoke all on function public.get_active_cohort_schedule() from public, anon, authenticated;
grant execute on function public.get_active_cohort_schedule() to anon;
grant execute on function public.get_active_cohort_schedule() to authenticated;
grant execute on function public.get_active_cohort_schedule() to service_role;

revoke all on function public.get_family_links(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.get_family_links(p_person_id uuid) to anon;
grant execute on function public.get_family_links(p_person_id uuid) to authenticated;
grant execute on function public.get_family_links(p_person_id uuid) to service_role;

revoke all on function public.get_family(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.get_family(p_person_id uuid) to authenticated;
grant execute on function public.get_family(p_person_id uuid) to service_role;

revoke all on function public.get_makeup_attendance_context(p_token uuid) from public, anon, authenticated;
grant execute on function public.get_makeup_attendance_context(p_token uuid) to anon;
grant execute on function public.get_makeup_attendance_context(p_token uuid) to authenticated;
grant execute on function public.get_makeup_attendance_context(p_token uuid) to service_role;

revoke all on function public.guard_automatic_ministry_links() from public, anon, authenticated;
grant execute on function public.guard_automatic_ministry_links() to service_role;

revoke all on function public.guard_profile_privileges() from public, anon, authenticated;
grant execute on function public.guard_profile_privileges() to anon;
grant execute on function public.guard_profile_privileges() to authenticated;
grant execute on function public.guard_profile_privileges() to service_role;

revoke all on function public.guard_single_spouse() from public, anon, authenticated;
grant execute on function public.guard_single_spouse() to anon;
grant execute on function public.guard_single_spouse() to authenticated;
grant execute on function public.guard_single_spouse() to service_role;

revoke all on function public.integration_people_years() from public, anon, authenticated;
grant execute on function public.integration_people_years() to authenticated;
grant execute on function public.integration_people_years() to service_role;

revoke all on function public.list_member_events(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.list_member_events(p_person_id uuid) to anon;
grant execute on function public.list_member_events(p_person_id uuid) to authenticated;
grant execute on function public.list_member_events(p_person_id uuid) to service_role;

revoke all on function public.list_ministries() from public, anon, authenticated;
grant execute on function public.list_ministries() to anon;
grant execute on function public.list_ministries() to authenticated;
grant execute on function public.list_ministries() to service_role;

revoke all on function public.list_person_history(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.list_person_history(p_person_id uuid) to anon;
grant execute on function public.list_person_history(p_person_id uuid) to authenticated;
grant execute on function public.list_person_history(p_person_id uuid) to service_role;

revoke all on function public.list_person_notes(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.list_person_notes(p_person_id uuid) to anon;
grant execute on function public.list_person_notes(p_person_id uuid) to authenticated;
grant execute on function public.list_person_notes(p_person_id uuid) to service_role;

revoke all on function public.list_small_groups() from public, anon, authenticated;
grant execute on function public.list_small_groups() to anon;
grant execute on function public.list_small_groups() to authenticated;
grant execute on function public.list_small_groups() to service_role;

revoke all on function public.list_visitor_events(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.list_visitor_events(p_person_id uuid) to anon;
grant execute on function public.list_visitor_events(p_person_id uuid) to authenticated;
grant execute on function public.list_visitor_events(p_person_id uuid) to service_role;

revoke all on function public.log_community_link() from public, anon, authenticated;
grant execute on function public.log_community_link() to anon;
grant execute on function public.log_community_link() to authenticated;
grant execute on function public.log_community_link() to service_role;

revoke all on function public.log_family_changes(p_before jsonb) from public, anon, authenticated;
grant execute on function public.log_family_changes(p_before jsonb) to anon;
grant execute on function public.log_family_changes(p_before jsonb) to authenticated;
grant execute on function public.log_family_changes(p_before jsonb) to service_role;

revoke all on function public.log_lesson_attendance() from public, anon, authenticated;
grant execute on function public.log_lesson_attendance() to anon;
grant execute on function public.log_lesson_attendance() to authenticated;
grant execute on function public.log_lesson_attendance() to service_role;

revoke all on function public.log_member_event(p_person_id uuid, p_event text, p_detail jsonb) from public, anon, authenticated;
grant execute on function public.log_member_event(p_person_id uuid, p_event text, p_detail jsonb) to anon;
grant execute on function public.log_member_event(p_person_id uuid, p_event text, p_detail jsonb) to authenticated;
grant execute on function public.log_member_event(p_person_id uuid, p_event text, p_detail jsonb) to service_role;

revoke all on function public.log_member_flag() from public, anon, authenticated;
grant execute on function public.log_member_flag() to anon;
grant execute on function public.log_member_flag() to authenticated;
grant execute on function public.log_member_flag() to service_role;

revoke all on function public.log_people_member_events() from public, anon, authenticated;
grant execute on function public.log_people_member_events() to anon;
grant execute on function public.log_people_member_events() to authenticated;
grant execute on function public.log_people_member_events() to service_role;

revoke all on function public.log_people_visitor_events() from public, anon, authenticated;
grant execute on function public.log_people_visitor_events() to anon;
grant execute on function public.log_people_visitor_events() to authenticated;
grant execute on function public.log_people_visitor_events() to service_role;

revoke all on function public.log_record_updated() from public, anon, authenticated;
grant execute on function public.log_record_updated() to anon;
grant execute on function public.log_record_updated() to authenticated;
grant execute on function public.log_record_updated() to service_role;

revoke all on function public.log_visitor_event(p_person_id uuid, p_event text, p_detail jsonb) from public, anon, authenticated;
grant execute on function public.log_visitor_event(p_person_id uuid, p_event text, p_detail jsonb) to anon;
grant execute on function public.log_visitor_event(p_person_id uuid, p_event text, p_detail jsonb) to authenticated;
grant execute on function public.log_visitor_event(p_person_id uuid, p_event text, p_detail jsonb) to service_role;

revoke all on function public.mark_coffee_attended(p_attendance_id uuid, p_person_id uuid, p_actor_id uuid) from public, anon, authenticated;
grant execute on function public.mark_coffee_attended(p_attendance_id uuid, p_person_id uuid, p_actor_id uuid) to authenticated;
grant execute on function public.mark_coffee_attended(p_attendance_id uuid, p_person_id uuid, p_actor_id uuid) to service_role;

revoke all on function public.mark_general_admin_notes_private() from public, anon, authenticated;
grant execute on function public.mark_general_admin_notes_private() to anon;
grant execute on function public.mark_general_admin_notes_private() to authenticated;
grant execute on function public.mark_general_admin_notes_private() to service_role;

revoke all on function public.membership_lesson_progress(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.membership_lesson_progress(p_person_id uuid) to service_role;

revoke all on function public.place_in_coffee(p_person_id uuid, p_coffee_event_id uuid) from public, anon, authenticated;
grant execute on function public.place_in_coffee(p_person_id uuid, p_coffee_event_id uuid) to authenticated;
grant execute on function public.place_in_coffee(p_person_id uuid, p_coffee_event_id uuid) to service_role;

revoke all on function public.promote_membership_on_attendance() from public, anon, authenticated;
grant execute on function public.promote_membership_on_attendance() to service_role;

revoke all on function public.propagate_family_to_spouse(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.propagate_family_to_spouse(p_person_id uuid) to anon;
grant execute on function public.propagate_family_to_spouse(p_person_id uuid) to authenticated;
grant execute on function public.propagate_family_to_spouse(p_person_id uuid) to service_role;

revoke all on function public.prune_family_shares(p_before jsonb) from public, anon, authenticated;
grant execute on function public.prune_family_shares(p_before jsonb) to anon;
grant execute on function public.prune_family_shares(p_before jsonb) to authenticated;
grant execute on function public.prune_family_shares(p_before jsonb) to service_role;

revoke all on function public.run_pipeline_maintenance() from public, anon, authenticated;
grant execute on function public.run_pipeline_maintenance() to authenticated;
grant execute on function public.run_pipeline_maintenance() to service_role;

revoke all on function public.save_membership_answers(p_person_id uuid, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text) from public, anon, authenticated;
grant execute on function public.save_membership_answers(p_person_id uuid, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text) to service_role;

revoke all on function public.service_sunday(p_at timestamp with time zone) from public, anon, authenticated;
grant execute on function public.service_sunday(p_at timestamp with time zone) to anon;
grant execute on function public.service_sunday(p_at timestamp with time zone) to authenticated;
grant execute on function public.service_sunday(p_at timestamp with time zone) to service_role;

revoke all on function public.set_family_links(p_person_id uuid, p_links jsonb, p_hidden jsonb DEFAULT '[]'::jsonb) from public, anon, authenticated;
grant execute on function public.set_family_links(p_person_id uuid, p_links jsonb, p_hidden jsonb DEFAULT '[]'::jsonb) to authenticated;
grant execute on function public.set_family_links(p_person_id uuid, p_links jsonb, p_hidden jsonb DEFAULT '[]'::jsonb) to service_role;

revoke all on function public.set_family(p_person_id uuid, p_spouse_id uuid, p_father_id uuid, p_mother_id uuid, p_child_ids uuid[]) from public, anon, authenticated;
grant execute on function public.set_family(p_person_id uuid, p_spouse_id uuid, p_father_id uuid, p_mother_id uuid, p_child_ids uuid[]) to anon;
grant execute on function public.set_family(p_person_id uuid, p_spouse_id uuid, p_father_id uuid, p_mother_id uuid, p_child_ids uuid[]) to authenticated;
grant execute on function public.set_family(p_person_id uuid, p_spouse_id uuid, p_father_id uuid, p_mother_id uuid, p_child_ids uuid[]) to service_role;

revoke all on function public.set_lesson_dates(p_cohort_id uuid, p_lesson_dates date[]) from public, anon, authenticated;
grant execute on function public.set_lesson_dates(p_cohort_id uuid, p_lesson_dates date[]) to authenticated;
grant execute on function public.set_lesson_dates(p_cohort_id uuid, p_lesson_dates date[]) to service_role;

revoke all on function public.share_family_link(p_target uuid, p_relative uuid, p_relation_of_spouse text) from public, anon, authenticated;
grant execute on function public.share_family_link(p_target uuid, p_relative uuid, p_relation_of_spouse text) to anon;
grant execute on function public.share_family_link(p_target uuid, p_relative uuid, p_relation_of_spouse text) to authenticated;
grant execute on function public.share_family_link(p_target uuid, p_relative uuid, p_relation_of_spouse text) to service_role;

revoke all on function public.start_confirmed_member_active() from public, anon, authenticated;
grant execute on function public.start_confirmed_member_active() to anon;
grant execute on function public.start_confirmed_member_active() to authenticated;
grant execute on function public.start_confirmed_member_active() to service_role;

revoke all on function public.submit_integration_signup(p_phone text, p_attending_since text, p_previous_church text, p_baptism_info text, p_conversion_testimony text, p_marital_status_story text) from public, anon, authenticated;
grant execute on function public.submit_integration_signup(p_phone text, p_attending_since text, p_previous_church text, p_baptism_info text, p_conversion_testimony text, p_marital_status_story text) to anon;
grant execute on function public.submit_integration_signup(p_phone text, p_attending_since text, p_previous_church text, p_baptism_info text, p_conversion_testimony text, p_marital_status_story text) to authenticated;
grant execute on function public.submit_integration_signup(p_phone text, p_attending_since text, p_previous_church text, p_baptism_info text, p_conversion_testimony text, p_marital_status_story text) to service_role;

revoke all on function public.submit_makeup_attendance(p_token uuid, p_notes text) from public, anon, authenticated;
grant execute on function public.submit_makeup_attendance(p_token uuid, p_notes text) to anon;
grant execute on function public.submit_makeup_attendance(p_token uuid, p_notes text) to authenticated;
grant execute on function public.submit_makeup_attendance(p_token uuid, p_notes text) to service_role;

revoke all on function public.submit_membership_form(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) from public, anon, authenticated;
grant execute on function public.submit_membership_form(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) to anon;
grant execute on function public.submit_membership_form(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) to authenticated;
grant execute on function public.submit_membership_form(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) to service_role;

revoke all on function public.submit_membership_signup(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) from public, anon, authenticated;
grant execute on function public.submit_membership_signup(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) to anon;
grant execute on function public.submit_membership_signup(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) to authenticated;
grant execute on function public.submit_membership_signup(p_phone text, p_name text, p_gender text, p_cpf text, p_birth_date date, p_marital_status text, p_email text, p_address_zip text, p_address_street text, p_address_number text, p_address_complement text, p_address_neighborhood text, p_address_city text, p_address_state text, p_entry_type text, p_baptism_church text, p_last_church text, p_ministry_interests text[], p_wants_small_group text, p_small_group_id uuid, p_secret_society text, p_membership_note text, p_photo_token text) to service_role;

revoke all on function public.suggest_family_links(p_person_id uuid, p_links jsonb) from public, anon, authenticated;
grant execute on function public.suggest_family_links(p_person_id uuid, p_links jsonb) to authenticated;
grant execute on function public.suggest_family_links(p_person_id uuid, p_links jsonb) to service_role;

revoke all on function public.sync_family_couples() from public, anon, authenticated;
grant execute on function public.sync_family_couples() to anon;
grant execute on function public.sync_family_couples() to authenticated;
grant execute on function public.sync_family_couples() to service_role;

revoke all on function public.sync_login_email() from public, anon, authenticated;
grant execute on function public.sync_login_email() to anon;
grant execute on function public.sync_login_email() to authenticated;
grant execute on function public.sync_login_email() to service_role;

revoke all on function public.sync_small_group_leader_ministry_from_role() from public, anon, authenticated;
grant execute on function public.sync_small_group_leader_ministry_from_role() to service_role;

revoke all on function public.sync_small_group_leader_ministry(p_person_id uuid) from public, anon, authenticated;
grant execute on function public.sync_small_group_leader_ministry(p_person_id uuid) to service_role;

revoke all on function public.team_contacts(p_stage text) from public, anon, authenticated;
grant execute on function public.team_contacts(p_stage text) to anon;
grant execute on function public.team_contacts(p_stage text) to authenticated;
grant execute on function public.team_contacts(p_stage text) to service_role;

revoke all on function public.unlink_former_member() from public, anon, authenticated;
grant execute on function public.unlink_former_member() to service_role;

revoke all on function public.update_own_identity(p_name text, p_email text) from public, anon, authenticated;
grant execute on function public.update_own_identity(p_name text, p_email text) to anon;
grant execute on function public.update_own_identity(p_name text, p_email text) to authenticated;
grant execute on function public.update_own_identity(p_name text, p_email text) to service_role;

revoke all on function public.update_volunteer_identity(p_profile_id uuid, p_name text, p_email text, p_phone text) from public, anon, authenticated;
grant execute on function public.update_volunteer_identity(p_profile_id uuid, p_name text, p_email text, p_phone text) to anon;
grant execute on function public.update_volunteer_identity(p_profile_id uuid, p_name text, p_email text, p_phone text) to authenticated;
grant execute on function public.update_volunteer_identity(p_profile_id uuid, p_name text, p_email text, p_phone text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('member-photos', 'member-photos', f, 524288, '{image/jpeg}'::text[]) on conflict (id) do nothing;

select cron.schedule('pipeline-maintenance', '*/15 * * * *', 'select public.run_pipeline_maintenance()');
