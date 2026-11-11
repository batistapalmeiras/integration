begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(8);

insert into auth.users (id) values
  ('f0000000-0000-4000-8000-0000000001a1'),
  ('f0000000-0000-4000-8000-0000000001a2'),
  ('f0000000-0000-4000-8000-0000000001a3'),
  ('f0000000-0000-4000-8000-0000000001a4');

insert into public.people (id, name, status) values
  ('f0000000-0000-4000-8000-0000000001b1', 'Teste Pastor', 'member'),
  ('f0000000-0000-4000-8000-0000000001b2', 'Teste Admin', 'member'),
  ('f0000000-0000-4000-8000-0000000001b3', 'Teste Equipe Um', 'member'),
  ('f0000000-0000-4000-8000-0000000001b4', 'Teste Equipe Dois', 'member'),
  ('f0000000-0000-4000-8000-0000000001b5', 'Teste Visitante', 'integration');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000001a1', 'pastor', 'f0000000-0000-4000-8000-0000000001b1'),
  ('f0000000-0000-4000-8000-0000000001a2', 'admin', 'f0000000-0000-4000-8000-0000000001b2'),
  ('f0000000-0000-4000-8000-0000000001a3', 'integration_team', 'f0000000-0000-4000-8000-0000000001b3'),
  ('f0000000-0000-4000-8000-0000000001a4', 'integration_team', 'f0000000-0000-4000-8000-0000000001b4');

set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000001a3", "role": "authenticated"}';

insert into public.pastoral_notes (id, person_id, body, created_by) values
  ('f0000000-0000-4000-8000-0000000001c1', 'f0000000-0000-4000-8000-0000000001b5', 'Da equipe um', 'f0000000-0000-4000-8000-0000000001a3'),
  ('f0000000-0000-4000-8000-0000000001c2', 'f0000000-0000-4000-8000-0000000001b5', 'Da equipe dois', 'f0000000-0000-4000-8000-0000000001a4'),
  ('f0000000-0000-4000-8000-0000000001c3', 'f0000000-0000-4000-8000-0000000001b5', 'Do admin', 'f0000000-0000-4000-8000-0000000001a2'),
  ('f0000000-0000-4000-8000-0000000001c4', 'f0000000-0000-4000-8000-0000000001b5', 'Do pastor', 'f0000000-0000-4000-8000-0000000001a1');

create function pg_temp.edit_note(p_user uuid, p_note uuid) returns integer language plpgsql as $$
declare
  v_count integer;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
  update public.pastoral_notes set body = 'Editada' where id = p_note;
  get diagnostics v_count = row_count;
  reset role;
  return v_count;
end;
$$;

select is(pg_temp.edit_note('f0000000-0000-4000-8000-0000000001a3', 'f0000000-0000-4000-8000-0000000001c1'), 1, 'author edits own note');
select is(pg_temp.edit_note('f0000000-0000-4000-8000-0000000001a3', 'f0000000-0000-4000-8000-0000000001c2'), 0, 'team member cannot edit a colleague note');
select is(pg_temp.edit_note('f0000000-0000-4000-8000-0000000001a2', 'f0000000-0000-4000-8000-0000000001c2'), 1, 'admin edits a team member note');
select is(pg_temp.edit_note('f0000000-0000-4000-8000-0000000001a2', 'f0000000-0000-4000-8000-0000000001c4'), 0, 'admin cannot edit a pastor note');
select is(pg_temp.edit_note('f0000000-0000-4000-8000-0000000001a1', 'f0000000-0000-4000-8000-0000000001c3'), 1, 'pastor edits an admin note');

set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000001a3", "role": "authenticated"}';
set local role authenticated;

select throws_ok(
  $$update public.pastoral_notes set created_by = 'f0000000-0000-4000-8000-0000000001a4' where id = 'f0000000-0000-4000-8000-0000000001c1'$$,
  '42501',
  null,
  'only the body can change'
);

reset role;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000001a2", "role": "authenticated"}';

select is(
  (select can_edit from public.list_person_notes('f0000000-0000-4000-8000-0000000001b5') where id = 'f0000000-0000-4000-8000-0000000001c1'),
  true,
  'list tells the admin it can edit a team member note'
);
select is(
  (select can_edit from public.list_person_notes('f0000000-0000-4000-8000-0000000001b5') where id = 'f0000000-0000-4000-8000-0000000001c4'),
  false,
  'list tells the admin it cannot edit a pastor note'
);

select * from finish();

rollback;
