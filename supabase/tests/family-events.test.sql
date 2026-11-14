begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(6);

insert into auth.users (id) values ('f0000000-0000-4000-8000-0000000008a1');

insert into public.people (id, name, status) values
  ('f0000000-0000-4000-8000-0000000008b1', 'Teste Pastor', 'member'),
  ('f0000000-0000-4000-8000-0000000008b2', 'Teste Ana', 'member'),
  ('f0000000-0000-4000-8000-0000000008b3', 'Teste Bruno', 'member'),
  ('f0000000-0000-4000-8000-0000000008b4', 'Teste Filho', 'member');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000008a1', 'pastor', 'f0000000-0000-4000-8000-0000000008b1');

insert into public.member_profiles (person_id, gender) values
  ('f0000000-0000-4000-8000-0000000008b2', 'female'),
  ('f0000000-0000-4000-8000-0000000008b3', 'male'),
  ('f0000000-0000-4000-8000-0000000008b4', 'male');

set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000008a1", "role": "authenticated"}';

select public.set_family_links('f0000000-0000-4000-8000-0000000008b2', '[
  {"relative_id": "f0000000-0000-4000-8000-0000000008b3", "relation": "spouse"},
  {"relative_id": "f0000000-0000-4000-8000-0000000008b4", "relation": "child"}
]'::jsonb);

select results_eq(
  $$ select event || ':' || (detail ->> 'relation') from public.list_member_events('f0000000-0000-4000-8000-0000000008b2') where event like 'family_%' order by detail ->> 'relation' $$,
  $$ values ('family_added:child'::text), ('family_added:spouse'::text) $$,
  'each relative added to the person is recorded with the relation'
);

select results_eq(
  $$ select author_name from public.list_member_events('f0000000-0000-4000-8000-0000000008b2') limit 1 $$,
  $$ values ('Teste Pastor'::text) $$,
  'the event keeps who made the change'
);

select results_eq(
  $$ select detail ->> 'relation' from public.list_member_events('f0000000-0000-4000-8000-0000000008b3') where detail ->> 'name' = 'Teste Filho' $$,
  $$ values ('child'::text) $$,
  'the spouse also gets the link, and the event is recorded for the spouse too'
);

select public.set_family_links('f0000000-0000-4000-8000-0000000008b2', '[
  {"relative_id": "f0000000-0000-4000-8000-0000000008b3", "relation": "spouse"},
  {"relative_id": "f0000000-0000-4000-8000-0000000008b4", "relation": "child"}
]'::jsonb);

select is(
  (select count(*) from public.list_member_events('f0000000-0000-4000-8000-0000000008b2') where event like 'family_%'),
  2::bigint,
  'saving the same family again records nothing'
);

select public.set_family_links('f0000000-0000-4000-8000-0000000008b2', '[
  {"relative_id": "f0000000-0000-4000-8000-0000000008b3", "relation": "spouse"}
]'::jsonb);

select results_eq(
  $$ select event || ':' || (detail ->> 'name') from public.list_member_events('f0000000-0000-4000-8000-0000000008b2') where event = 'family_removed' $$,
  $$ values ('family_removed:Teste Filho'::text) $$,
  'removing a relative is recorded with the name'
);

select is(
  (select count(*) from public.list_member_events('f0000000-0000-4000-8000-0000000008b3') where event = 'family_removed'),
  1::bigint,
  'the removal also reaches the spouse'
);

select * from finish();
rollback;
