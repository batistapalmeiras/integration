begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(4);

insert into auth.users (id) values ('f0000000-0000-4000-8000-0000000006a1');

insert into public.people (id, name, status) values
  ('f0000000-0000-4000-8000-0000000006b1', 'Teste Pastor', 'member'),
  ('f0000000-0000-4000-8000-0000000006b2', 'Teste Ana', 'member'),
  ('f0000000-0000-4000-8000-0000000006b3', 'Teste Caio', 'member');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000006a1', 'pastor', 'f0000000-0000-4000-8000-0000000006b1');

insert into public.member_profiles (person_id, gender, marital_status) values
  ('f0000000-0000-4000-8000-0000000006b2', 'female', 'single'),
  ('f0000000-0000-4000-8000-0000000006b3', 'male', null);

set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000006a1", "role": "authenticated"}';

select public.set_family_links('f0000000-0000-4000-8000-0000000006b2', '[
  {"relative_id": "f0000000-0000-4000-8000-0000000006b3", "relation": "spouse"}
]'::jsonb);

select results_eq(
  $$ select marital_status from public.member_profiles where person_id = 'f0000000-0000-4000-8000-0000000006b2' $$,
  $$ values ('married'::text) $$,
  'adding a spouse turns a single member into married'
);

select results_eq(
  $$ select marital_status from public.member_profiles where person_id = 'f0000000-0000-4000-8000-0000000006b3' $$,
  $$ values ('married'::text) $$,
  'the spouse becomes married too, even with no marital status'
);

select public.set_family_links('f0000000-0000-4000-8000-0000000006b2', '[]'::jsonb);

select results_eq(
  $$ select marital_status from public.member_profiles where person_id = 'f0000000-0000-4000-8000-0000000006b2' $$,
  $$ values (null::text) $$,
  'removing the spouse clears the marital status of a married member'
);

select results_eq(
  $$ select marital_status from public.member_profiles where person_id = 'f0000000-0000-4000-8000-0000000006b3' $$,
  $$ values (null::text) $$,
  'and clears it on the spouse side too'
);

select * from finish();

rollback;
