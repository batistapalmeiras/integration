begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(11);

insert into auth.users (id) values ('f0000000-0000-4000-8000-0000000003a1');

insert into public.people (id, name, status) values
  ('f0000000-0000-4000-8000-0000000003b1', 'Teste Pastor', 'member'),
  ('f0000000-0000-4000-8000-0000000003b2', 'Teste Ana', 'member'),
  ('f0000000-0000-4000-8000-0000000003b3', 'Teste Bia', 'member'),
  ('f0000000-0000-4000-8000-0000000003b4', 'Teste Caio', 'member'),
  ('f0000000-0000-4000-8000-0000000003b5', 'Teste Visitante', 'welcome_coffee');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000003a1', 'pastor', 'f0000000-0000-4000-8000-0000000003b1');

insert into public.member_profiles (person_id, gender) values
  ('f0000000-0000-4000-8000-0000000003b2', 'female'),
  ('f0000000-0000-4000-8000-0000000003b3', 'female'),
  ('f0000000-0000-4000-8000-0000000003b4', 'male');

set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000003a1", "role": "authenticated"}';

select lives_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b2', '[
       {"relative_id": "f0000000-0000-4000-8000-0000000003b3", "relation": "child"},
       {"relative_id": "f0000000-0000-4000-8000-0000000003b4", "relation": "spouse"}
     ]'::jsonb) $$,
  'the pastor saves the family links of a member'
);

select results_eq(
  $$ select relation from public.get_family_links('f0000000-0000-4000-8000-0000000003b3') $$,
  $$ values ('mother'::text) $$,
  'the other side of a link is written with the inverse relation, by the gender of the person'
);

select results_eq(
  $$ select relation from public.get_family_links('f0000000-0000-4000-8000-0000000003b4') $$,
  $$ values ('spouse'::text) $$,
  'a spouse is a spouse on both sides'
);

select throws_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b2', '[
       {"relative_id": "f0000000-0000-4000-8000-0000000003b3", "relation": "spouse"},
       {"relative_id": "f0000000-0000-4000-8000-0000000003b4", "relation": "spouse"}
     ]'::jsonb) $$,
  'P0001',
  'Só pode haver um cônjuge.',
  'a person cannot have two spouses'
);

select throws_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b2', '[
       {"relative_id": "f0000000-0000-4000-8000-0000000003b5", "relation": "sibling"}
     ]'::jsonb) $$,
  'P0001',
  'Só membros podem ter vínculos familiares.',
  'a relative that is not a member is refused'
);

select throws_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b5', '[]'::jsonb) $$,
  'P0001',
  'Só membros podem ter vínculos familiares.',
  'a visitor cannot have family links'
);

select lives_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b2', '[]'::jsonb) $$,
  'saving an empty list clears the links'
);

select is_empty(
  $$ select 1 from public.family_links where 'f0000000-0000-4000-8000-0000000003b2' in (person_id, relative_id) $$,
  'no link is left on either side'
);

select throws_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b2', '[
       {"relative_id": "f0000000-0000-4000-8000-0000000003b4", "relation": "mother"}
     ]'::jsonb) $$,
  'P0001',
  'Teste Caio está cadastrado(a) com o sexo oposto ao do vínculo escolhido.',
  'the relation has to match the gender of the member when it is known'
);

select lives_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b2', '[
       {"relative_id": "f0000000-0000-4000-8000-0000000003b4", "relation": "father"}
     ]'::jsonb) $$,
  'a father is accepted for a male member'
);

select throws_ok(
  $$ select public.set_family_links('f0000000-0000-4000-8000-0000000003b2', '[
       {"relative_id": "f0000000-0000-4000-8000-0000000003b3", "relation": "aunt"}
     ]'::jsonb) $$,
  'P0001',
  'Vínculo familiar inválido.',
  'a relation that does not exist is refused'
);

select * from finish();
rollback;
