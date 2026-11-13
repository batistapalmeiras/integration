begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

insert into auth.users (id) values
  ('f0000000-0000-4000-8000-0000000004a1'),
  ('f0000000-0000-4000-8000-0000000004a2');

insert into public.people (id, name, status, membership_status) values
  ('f0000000-0000-4000-8000-0000000004b1', 'Teste Pastor', 'member', 'active'),
  ('f0000000-0000-4000-8000-0000000004b2', 'Teste Ana', 'member', 'active'),
  ('f0000000-0000-4000-8000-0000000004b3', 'Teste Visitante', 'welcome_coffee', null),
  ('f0000000-0000-4000-8000-0000000004b4', 'Teste Equipe', 'member', 'active');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000004a1', 'pastor', 'f0000000-0000-4000-8000-0000000004b1'),
  ('f0000000-0000-4000-8000-0000000004a2', 'integration_team', 'f0000000-0000-4000-8000-0000000004b4');

insert into public.small_groups (id, name) values ('f0000000-0000-4000-8000-0000000004c1', 'PG Teste');
insert into public.member_profiles (person_id, cpf, marital_status) values
  ('f0000000-0000-4000-8000-0000000004b2', '11111111111', 'single');

set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000004a1", "role": "authenticated"}';

insert into public.person_small_groups (person_id, small_group_id)
values ('f0000000-0000-4000-8000-0000000004b2', 'f0000000-0000-4000-8000-0000000004c1');
delete from public.person_small_groups where person_id = 'f0000000-0000-4000-8000-0000000004b2';

select results_eq(
  $$ select event from public.list_member_events('f0000000-0000-4000-8000-0000000004b2') $$,
  $$ values ('small_group_joined'::text), ('small_group_left'::text) $$,
  'joining and leaving a small group are recorded in order'
);

select results_eq(
  $$ select author_name from public.list_member_events('f0000000-0000-4000-8000-0000000004b2') limit 1 $$,
  $$ values ('Teste Pastor'::text) $$,
  'the event keeps who did it'
);

update public.people set membership_status = 'transferred' where id = 'f0000000-0000-4000-8000-0000000004b2';

select results_eq(
  $$ select detail ->> 'to' from public.list_member_events('f0000000-0000-4000-8000-0000000004b2') where event = 'membership_status_changed' $$,
  $$ values ('transferred'::text) $$,
  'a change of the membership status is recorded with the new value'
);

update public.member_profiles set cpf = '22222222222', marital_status = 'married' where person_id = 'f0000000-0000-4000-8000-0000000004b2';

select results_eq(
  $$ select detail -> 'fields' from public.list_member_events('f0000000-0000-4000-8000-0000000004b2') where event = 'record_updated' $$,
  $$ values ('["cpf", "marital_status"]'::jsonb) $$,
  'an edit of the record keeps the names of the fields, never their values'
);

update public.member_profiles set cpf = '22222222222' where person_id = 'f0000000-0000-4000-8000-0000000004b2';

select is(
  (select count(*) from public.member_events where event = 'record_updated'),
  1::bigint,
  'saving the same values again records nothing'
);

insert into public.person_small_groups (person_id, small_group_id)
values ('f0000000-0000-4000-8000-0000000004b3', 'f0000000-0000-4000-8000-0000000004c1');

select is_empty(
  $$ select 1 from public.member_events where person_id = 'f0000000-0000-4000-8000-0000000004b3' $$,
  'nothing is recorded for someone who is not a member yet'
);

delete from public.people where id = 'f0000000-0000-4000-8000-0000000004b2';

select is_empty(
  $$ select 1 from public.member_events where person_id = 'f0000000-0000-4000-8000-0000000004b2' $$,
  'the history goes away with the person'
);

set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000004a2", "role": "authenticated"}';

select is_empty(
  $$ select 1 from public.list_member_events('f0000000-0000-4000-8000-0000000004b4') $$,
  'only the pastor reads the history of a member'
);

reset role;
insert into public.member_events (person_id, event) values ('f0000000-0000-4000-8000-0000000004b4', 'record_updated');
set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000004a1", "role": "authenticated"}';

select is(
  (select count(*) from public.list_member_events('f0000000-0000-4000-8000-0000000004b4')),
  1::bigint,
  'the pastor reads it'
);

select * from finish();
rollback;
