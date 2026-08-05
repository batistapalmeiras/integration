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
  notes         text,
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

create policy "people_update_team_admin"
  on public.people for update
  using (public.current_role() in ('integration_team', 'admin'))
  with check (public.current_role() in ('integration_team', 'admin'));

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

create policy "status_history_insert_team_admin"
  on public.status_history for insert
  with check (public.current_role() in ('integration_team', 'admin'));

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
  confirmed           boolean not null default false,
  attended            boolean not null default false,
  presented_by_pastor boolean not null default false,
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

create policy "cohorts_manage_admin"
  on public.cohorts for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

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

create policy "lessons_manage_admin"
  on public.lessons for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

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
