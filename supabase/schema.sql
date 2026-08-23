-- =============================================================================
-- Batista Palmeiras — Integration app schema
-- Member-integration pipeline: first contact -> welcome coffee -> classes -> membership
-- See project memory "project-integration-process-rules" for the closed business rules.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- One row per app user (volunteer). Created/managed by an admin — no public
-- self-signup trigger, since accounts are handed out by the church team.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null,
  role       text not null check (role in ('admin', 'integration_team', 'pastor', 'reception', 'teacher')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Returns the caller's role, or null if they have no profile row yet.
create function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles_update_own_name"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_manage"
  on public.profiles for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- -----------------------------------------------------------------------------
-- people (visitors / prospective members)
-- -----------------------------------------------------------------------------
create table public.people (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null,
  age           int,
  email         text,
  status        text not null default 'initial_contact' check (status in (
    'initial_contact', 'retry_contact', 'welcome_coffee', 'integration',
    'membership_pending', 'member', 'archived'
  )),
  notes                  text,
  -- Filled in by the person themselves via the public "Inscrição na
  -- Integração" form (see submit_integration_signup below), not by staff.
  attending_since        text,
  previous_church        text,
  baptism_info           text,
  conversion_testimony   text,
  marital_status_story   text,
  -- Filled in by staff on the Admin page when confirming someone as a
  -- member (see the 'member' status transition in the app) — required at
  -- that point, not before.
  small_group            text,
  ministry                text,
  -- Set the first time staff opens the WhatsApp compose box for this
  -- person's current contact stage — persisted so the "Resultado" form
  -- stays visible on a later visit instead of hiding again until they
  -- click "Abrir WhatsApp" a second time.
  whatsapp_opened_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.people enable row level security;

create policy "people_select_all_authenticated"
  on public.people for select
  using (auth.uid() is not null);

create policy "people_insert_reception_team_admin"
  on public.people for insert
  with check (public.current_role() in ('reception', 'integration_team', 'admin'));

create policy "people_update_team_pastor_admin"
  on public.people for update
  using (public.current_role() in ('integration_team', 'pastor', 'admin'))
  with check (public.current_role() in ('integration_team', 'pastor', 'admin'));

-- -----------------------------------------------------------------------------
-- status_history — audit trail of status transitions for a person
-- -----------------------------------------------------------------------------
create table public.status_history (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null references public.people (id) on delete cascade,
  from_status text,
  to_status  text not null,
  changed_by uuid references public.profiles (id),
  note       text,
  created_at timestamptz not null default now()
);

alter table public.status_history enable row level security;

create policy "status_history_select_all_authenticated"
  on public.status_history for select
  using (auth.uid() is not null);

create policy "status_history_insert_team_pastor_admin"
  on public.status_history for insert
  with check (public.current_role() in ('integration_team', 'pastor', 'admin'));

-- -----------------------------------------------------------------------------
-- contact_attempts — log of each WhatsApp contact attempt (unlimited retries)
-- -----------------------------------------------------------------------------
create table public.contact_attempts (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null references public.people (id) on delete cascade,
  channel    text not null check (channel in ('video', 'audio', 'text')),
  result     text not null check (result in ('accepted', 'declined', 'no_response')),
  made_by    uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.contact_attempts enable row level security;

create policy "contact_attempts_select_all_authenticated"
  on public.contact_attempts for select
  using (auth.uid() is not null);

create policy "contact_attempts_insert_team_admin"
  on public.contact_attempts for insert
  with check (public.current_role() in ('integration_team', 'admin'));

-- -----------------------------------------------------------------------------
-- coffee_events — the monthly welcome coffee (1st Sunday, 17:30)
-- -----------------------------------------------------------------------------
create table public.coffee_events (
  id         uuid primary key default gen_random_uuid(),
  event_date date not null,
  event_time time not null default '17:30',
  created_at timestamptz not null default now()
);

alter table public.coffee_events enable row level security;

create policy "coffee_events_select_all_authenticated"
  on public.coffee_events for select
  using (auth.uid() is not null);

create policy "coffee_events_manage_team_admin"
  on public.coffee_events for all
  using (public.current_role() in ('integration_team', 'admin'))
  with check (public.current_role() in ('integration_team', 'admin'));

-- -----------------------------------------------------------------------------
-- coffee_attendance
-- -----------------------------------------------------------------------------
create table public.coffee_attendance (
  id                  uuid primary key default gen_random_uuid(),
  person_id           uuid not null references public.people (id) on delete cascade,
  coffee_event_id     uuid not null references public.coffee_events (id) on delete cascade,
  attended            boolean not null default false,
  unique (person_id, coffee_event_id)
);

alter table public.coffee_attendance enable row level security;

create policy "coffee_attendance_select_all_authenticated"
  on public.coffee_attendance for select
  using (auth.uid() is not null);

create policy "coffee_attendance_manage_team_pastor_admin"
  on public.coffee_attendance for all
  using (public.current_role() in ('integration_team', 'pastor', 'admin'))
  with check (public.current_role() in ('integration_team', 'pastor', 'admin'));

-- -----------------------------------------------------------------------------
-- cohorts ("turmas") — only one active cohort at a time (enforced below)
-- -----------------------------------------------------------------------------
create table public.cohorts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  status     text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now()
);

create unique index cohorts_one_active on public.cohorts (status) where (status = 'active');

alter table public.cohorts enable row level security;

create policy "cohorts_select_all_authenticated"
  on public.cohorts for select
  using (auth.uid() is not null);

create policy "cohorts_manage_admin_teacher"
  on public.cohorts for all
  using (public.current_role() in ('admin', 'teacher'))
  with check (public.current_role() in ('admin', 'teacher'));

-- -----------------------------------------------------------------------------
-- lessons ("aulas") — the 4 classes of a cohort
-- -----------------------------------------------------------------------------
create table public.lessons (
  id         uuid primary key default gen_random_uuid(),
  cohort_id  uuid not null references public.cohorts (id) on delete cascade,
  number     int not null check (number between 1 and 4),
  date       date not null,
  unique (cohort_id, number)
);

alter table public.lessons enable row level security;

create policy "lessons_select_all_authenticated"
  on public.lessons for select
  using (auth.uid() is not null);

create policy "lessons_manage_admin_teacher"
  on public.lessons for all
  using (public.current_role() in ('admin', 'teacher'))
  with check (public.current_role() in ('admin', 'teacher'));

-- -----------------------------------------------------------------------------
-- enrollments ("matrículas") — a person enrolled in a cohort
-- -----------------------------------------------------------------------------
create table public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null references public.people (id) on delete cascade,
  cohort_id  uuid not null references public.cohorts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (person_id, cohort_id)
);

alter table public.enrollments enable row level security;

create policy "enrollments_select_all_authenticated"
  on public.enrollments for select
  using (auth.uid() is not null);

create policy "enrollments_manage_team_admin"
  on public.enrollments for all
  using (public.current_role() in ('integration_team', 'admin'))
  with check (public.current_role() in ('integration_team', 'admin'));

-- -----------------------------------------------------------------------------
-- lesson_attendance — presence per lesson; membership = 3 of 4 attended = true
-- -----------------------------------------------------------------------------
create table public.lesson_attendance (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  lesson_id     uuid not null references public.lessons (id) on delete cascade,
  attended      boolean not null default false,
  -- Filled in via the public makeup-attendance form (see
  -- submit_makeup_attendance below) when someone who missed a lesson
  -- confirms they watched the video for it instead.
  makeup_notes  text,
  unique (enrollment_id, lesson_id)
);

alter table public.lesson_attendance enable row level security;

create policy "lesson_attendance_select_all_authenticated"
  on public.lesson_attendance for select
  using (auth.uid() is not null);

create policy "lesson_attendance_manage_teacher_admin"
  on public.lesson_attendance for all
  using (public.current_role() in ('teacher', 'admin'))
  with check (public.current_role() in ('teacher', 'admin'));

-- -----------------------------------------------------------------------------
-- Convenience view: attended-lesson count per enrollment, to check the 3-of-4
-- membership rule from the app (no automatic status transition — a human
-- still promotes the person to 'membership_pending' / 'member').
-- -----------------------------------------------------------------------------
create view public.enrollment_attendance_summary as
select
  e.id as enrollment_id,
  e.person_id,
  e.cohort_id,
  count(la.*) filter (where la.attended) as lessons_attended,
  count(la.*) as lessons_recorded
from public.enrollments e
left join public.lesson_attendance la on la.enrollment_id = e.id
group by e.id, e.person_id, e.cohort_id;

-- -----------------------------------------------------------------------------
-- Public "Inscrição na Integração" flow (sent via WhatsApp after the welcome
-- coffee) — the ONLY things an unauthenticated visitor can do in this schema.
-- Three steps in the UI, three narrow entry points below:
--   1. intro screen           -> get_active_cohort_schedule()
--   2. phone check            -> check_welcome_coffee_phone()
--   3. full form submission   -> submit_integration_signup()
--
-- SECURITY DEFINER throughout: no RLS policy on people/cohorts/enrollments/
-- status_history ever grants anon direct access — anon can only ever call
-- these functions. find_welcome_coffee_person is the shared phone-lookup
-- used by steps 2 and 3; it has no grant to anon, so it's only reachable
-- through the two functions below that do grant to anon.
-- -----------------------------------------------------------------------------
create or replace function public.find_welcome_coffee_person(p_phone text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match_count int;
  v_person_id   uuid;
begin
  select count(*) into v_match_count
    from public.people
    where phone = p_phone and status = 'welcome_coffee';

  if v_match_count = 0 then
    raise exception 'Não encontramos seu cadastro com esse telefone. Fale com a Equipe de Integração.';
  end if;

  if v_match_count > 1 then
    raise exception 'Encontramos mais de um cadastro com esse telefone. Fale com a Equipe de Integração.';
  end if;

  select id into v_person_id
    from public.people
    where phone = p_phone and status = 'welcome_coffee'
    limit 1;

  return v_person_id;
end;
$$;

create or replace function public.get_active_cohort_schedule()
returns table (cohort_name text, lesson_dates date[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cohort_id   uuid;
  v_cohort_name text;
  v_lesson_dates date[];
begin
  select id, name into v_cohort_id, v_cohort_name
    from public.cohorts
    where status = 'active';

  -- No active cohort: return zero rows: the intro screen just skips the
  -- schedule block instead of erroring on a purely informational step.
  if v_cohort_id is null then
    return;
  end if;

  select array_agg(l.date order by l.number) into v_lesson_dates
    from public.lessons l
    where l.cohort_id = v_cohort_id;

  return query select v_cohort_name, v_lesson_dates;
end;
$$;

grant execute on function public.get_active_cohort_schedule() to anon;

create or replace function public.check_welcome_coffee_phone(p_phone text)
returns table (person_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id uuid;
begin
  v_person_id := public.find_welcome_coffee_person(p_phone);
  return query select name from public.people where id = v_person_id;
end;
$$;

grant execute on function public.check_welcome_coffee_phone(text) to anon;

create or replace function public.submit_integration_signup(
  p_phone                text,
  p_attending_since      text,
  p_previous_church      text,
  p_baptism_info         text,
  p_conversion_testimony text,
  p_marital_status_story text
)
returns table (cohort_name text, lesson_dates date[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id   uuid;
  v_cohort_id   uuid;
  v_cohort_name text;
  v_lesson_dates date[];
begin
  v_person_id := public.find_welcome_coffee_person(p_phone);

  select id, name into v_cohort_id, v_cohort_name
    from public.cohorts
    where status = 'active';

  if v_cohort_id is null then
    raise exception 'Não há turma ativa no momento. Fale com a Equipe de Integração.';
  end if;

  update public.people
    set attending_since = p_attending_since,
        previous_church = p_previous_church,
        baptism_info = p_baptism_info,
        conversion_testimony = p_conversion_testimony,
        marital_status_story = p_marital_status_story,
        status = 'integration',
        updated_at = now()
    where id = v_person_id;

  insert into public.enrollments (person_id, cohort_id)
    values (v_person_id, v_cohort_id)
    on conflict (person_id, cohort_id) do nothing;

  insert into public.status_history (person_id, from_status, to_status, note)
    values (v_person_id, 'welcome_coffee', 'integration', 'Inscrição via formulário público');

  select array_agg(l.date order by l.number) into v_lesson_dates
    from public.lessons l
    where l.cohort_id = v_cohort_id;

  return query select v_cohort_name, v_lesson_dates;
end;
$$;

grant execute on function public.submit_integration_signup(text, text, text, text, text, text) to anon;

-- -----------------------------------------------------------------------------
-- Public "reposição de aula" flow — someone who missed a lesson watches a
-- video (sent manually via WhatsApp, link built by staff on the Turma page)
-- and confirms it here. The lesson_attendance row's own id is the bearer
-- token: it's an unguessable gen_random_uuid() already, so no separate
-- token column/table is needed — the link is just
-- /turma/reposicao/{lesson_attendance.id}.
-- -----------------------------------------------------------------------------
create or replace function public.get_makeup_attendance_context(p_token uuid)
returns table (person_name text, lesson_number int, cohort_name text, already_confirmed boolean)
language plpgsql
security definer
set search_path = public
as $$
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
$$;

grant execute on function public.get_makeup_attendance_context(uuid) to anon;

create or replace function public.submit_makeup_attendance(p_token uuid, p_notes text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.lesson_attendance
    set attended = true,
        makeup_notes = p_notes
    where id = p_token;

  if not found then
    raise exception 'Link inválido ou expirado.';
  end if;
end;
$$;

grant execute on function public.submit_makeup_attendance(uuid, text) to anon;

-- -----------------------------------------------------------------------------
-- Auto-archive people who missed their welcome coffee. The coffee is a fixed
-- monthly event (1st Sunday, 17:30) — once that Sunday has passed without
-- attended = true, the person is archived automatically (archiving is
-- reversible; staff can reactivate and restart contact any time). Runs daily
-- via pg_cron rather than being tied to someone opening the app.
-- -----------------------------------------------------------------------------
create or replace function public.archive_missed_welcome_coffee()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person record;
begin
  for v_person in
    select distinct p.id
    from public.people p
    join public.coffee_attendance ca on ca.person_id = p.id
    join public.coffee_events ce on ce.id = ca.coffee_event_id
    where p.status = 'welcome_coffee'
      and ca.attended = false
      and ce.event_date < current_date
  loop
    update public.people
      set status = 'archived', updated_at = now()
      where id = v_person.id;

    insert into public.status_history (person_id, from_status, to_status, note)
      values (v_person.id, 'welcome_coffee', 'archived', 'Arquivado automaticamente — não compareceu ao café de boas-vindas');
  end loop;
end;
$$;

-- Requires the pg_cron extension. On Supabase this can usually be enabled
-- right here, but if this statement errors with a permissions issue, enable
-- "pg_cron" first via Database -> Extensions in the dashboard, then re-run
-- just the two statements below.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'archive-missed-welcome-coffee',
  '0 6 * * *', -- daily at 06:00 UTC (03:00 America/Sao_Paulo)
  $$ select public.archive_missed_welcome_coffee(); $$
);
