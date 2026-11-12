begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(4);

insert into auth.users (id) values
  ('f0000000-0000-4000-8000-0000000002a1'),
  ('f0000000-0000-4000-8000-0000000002a2');

insert into public.people (id, name, status) values
  ('f0000000-0000-4000-8000-0000000002b1', 'Teste Pastor', 'member'),
  ('f0000000-0000-4000-8000-0000000002b2', 'Teste Equipe', 'member'),
  ('f0000000-0000-4000-8000-0000000002b3', 'Teste Visitante', 'welcome_coffee'),
  ('f0000000-0000-4000-8000-0000000002b4', 'Teste Membro', 'member');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000002a1', 'pastor', 'f0000000-0000-4000-8000-0000000002b1'),
  ('f0000000-0000-4000-8000-0000000002a2', 'integration_team', 'f0000000-0000-4000-8000-0000000002b2');

insert into public.status_history (person_id, from_status, to_status, changed_by, created_at) values
  ('f0000000-0000-4000-8000-0000000002b3', 'initial_contact', 'welcome_coffee', 'f0000000-0000-4000-8000-0000000002a2', '2026-11-09 10:00-03'),
  ('f0000000-0000-4000-8000-0000000002b3', 'welcome_coffee', 'retry_contact', null, '2026-11-10 10:00-03'),
  ('f0000000-0000-4000-8000-0000000002b4', 'membership_pending', 'member', 'f0000000-0000-4000-8000-0000000002a1', '2026-11-11 10:00-03');

set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000002a2", "role": "authenticated"}';

select results_eq(
  $$ select author_name from public.list_person_history('f0000000-0000-4000-8000-0000000002b3') $$,
  $$ values ('Teste Equipe'::text), (null::text) $$,
  'the team sees who did each change and which ones the system did'
);

select is_empty(
  $$ select 1 from public.list_person_history('f0000000-0000-4000-8000-0000000002b4') $$,
  'the team does not see the history of a member'
);

set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000002a1", "role": "authenticated"}';

select results_eq(
  $$ select author_name from public.list_person_history('f0000000-0000-4000-8000-0000000002b4') $$,
  $$ values ('Teste Pastor'::text) $$,
  'the pastor sees the history of a member'
);

select results_eq(
  $$ select to_status from public.list_person_history('f0000000-0000-4000-8000-0000000002b3') $$,
  $$ values ('welcome_coffee'::text), ('retry_contact'::text) $$,
  'the changes come in the order they happened'
);

select * from finish();
rollback;
