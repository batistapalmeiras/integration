begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(5);

insert into auth.users (id) values ('f0000000-0000-4000-8000-0000000007a1');

insert into public.people (id, name, status) values
  ('f0000000-0000-4000-8000-0000000007b1', 'Teste Pastor', 'member'),
  ('f0000000-0000-4000-8000-0000000007b2', 'Teste Matheus', 'member'),
  ('f0000000-0000-4000-8000-0000000007b3', 'Teste Brenda', 'member'),
  ('f0000000-0000-4000-8000-0000000007b4', 'Teste Larissa', 'member'),
  ('f0000000-0000-4000-8000-0000000007b5', 'Teste Elia', 'member');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000007a1', 'pastor', 'f0000000-0000-4000-8000-0000000007b1');

insert into public.member_profiles (person_id, gender) values
  ('f0000000-0000-4000-8000-0000000007b2', 'male'),
  ('f0000000-0000-4000-8000-0000000007b3', 'female'),
  ('f0000000-0000-4000-8000-0000000007b4', 'female'),
  ('f0000000-0000-4000-8000-0000000007b5', 'female');

set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000007a1", "role": "authenticated"}';

select public.set_family_links('f0000000-0000-4000-8000-0000000007b2', '[
  {"relative_id": "f0000000-0000-4000-8000-0000000007b3", "relation": "spouse"},
  {"relative_id": "f0000000-0000-4000-8000-0000000007b4", "relation": "sibling"},
  {"relative_id": "f0000000-0000-4000-8000-0000000007b5", "relation": "mother"}
]'::jsonb);

select results_eq(
  $$ select relation, derived from public.get_family_links('f0000000-0000-4000-8000-0000000007b4') where person_id = 'f0000000-0000-4000-8000-0000000007b3' $$,
  $$ values ('sibling_in_law'::text, true) $$,
  'the sister of a married member has the wife as sister-in-law without anyone registering it'
);

select results_eq(
  $$ select relation, derived from public.get_family_links('f0000000-0000-4000-8000-0000000007b3') where person_id = 'f0000000-0000-4000-8000-0000000007b4' $$,
  $$ values ('sibling_in_law'::text, true) $$,
  'and the wife has the sister as sister-in-law'
);

select results_eq(
  $$ select relation, derived from public.get_family_links('f0000000-0000-4000-8000-0000000007b3') where person_id = 'f0000000-0000-4000-8000-0000000007b5' $$,
  $$ values ('parent_in_law'::text, true) $$,
  'the husband''s mother is the wife''s mother-in-law'
);

select is(
  (select count(*)::integer from public.family_links where relation = 'sibling_in_law'),
  0,
  'derived relations are not stored'
);

select public.set_family_links('f0000000-0000-4000-8000-0000000007b2', '[
  {"relative_id": "f0000000-0000-4000-8000-0000000007b4", "relation": "sibling"},
  {"relative_id": "f0000000-0000-4000-8000-0000000007b5", "relation": "mother"}
]'::jsonb);

select is_empty(
  $$ select 1 from public.get_family_links('f0000000-0000-4000-8000-0000000007b4') where person_id = 'f0000000-0000-4000-8000-0000000007b3' $$,
  'removing the marriage removes the derived relation'
);

select * from finish();

rollback;
