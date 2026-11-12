begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(4);

insert into public.small_groups (id, name) values ('f0000000-0000-4000-8000-0000000003a1', 'PG Teste');
insert into public.ministries (id, name) values ('f0000000-0000-4000-8000-0000000003a2', 'Ministério Teste');

insert into public.people (id, name, status, small_group_id) values
  ('f0000000-0000-4000-8000-0000000003b1', 'Teste Líder', 'member', 'f0000000-0000-4000-8000-0000000003a1'),
  ('f0000000-0000-4000-8000-0000000003b2', 'Teste Anfitrião', 'member', 'f0000000-0000-4000-8000-0000000003a1');

insert into public.small_group_roles (small_group_id, person_id, role) values
  ('f0000000-0000-4000-8000-0000000003a1', 'f0000000-0000-4000-8000-0000000003b1', 'leader'),
  ('f0000000-0000-4000-8000-0000000003a1', 'f0000000-0000-4000-8000-0000000003b2', 'host');

insert into public.person_ministries (person_id, ministry_id) values
  ('f0000000-0000-4000-8000-0000000003b1', 'f0000000-0000-4000-8000-0000000003a2');
insert into public.ministry_leaders (ministry_id, person_id) values
  ('f0000000-0000-4000-8000-0000000003a2', 'f0000000-0000-4000-8000-0000000003b1');

update public.people set name = 'Teste Líder Renomeado' where id = 'f0000000-0000-4000-8000-0000000003b1';
select is(
  (select leaders from public.list_small_groups() where id = 'f0000000-0000-4000-8000-0000000003a1'),
  array['Teste Líder Renomeado'],
  'a renamed leader keeps leading under the new name'
);

update public.people set small_group_id = null where id = 'f0000000-0000-4000-8000-0000000003b2';
select is(
  (select count(*)::int from public.small_group_roles where person_id = 'f0000000-0000-4000-8000-0000000003b2'),
  0,
  'leaving the small group drops the host role'
);
select is(
  (select count(*)::int from public.small_group_roles where person_id = 'f0000000-0000-4000-8000-0000000003b1'),
  1,
  'the leader who stayed keeps the role'
);

delete from public.person_ministries where person_id = 'f0000000-0000-4000-8000-0000000003b1';
select is(
  (select count(*)::int from public.ministry_leaders where person_id = 'f0000000-0000-4000-8000-0000000003b1'),
  0,
  'leaving the ministry drops the leader role'
);

select * from finish();

rollback;
