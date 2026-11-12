begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(5);

insert into public.small_groups (id, name) values
  ('f0000000-0000-4000-8000-0000000004a1', 'PG A'),
  ('f0000000-0000-4000-8000-0000000004a2', 'PG B');
insert into public.people (id, name, status) values ('f0000000-0000-4000-8000-0000000004b1', 'Teste Um', 'member');

insert into public.person_small_groups (person_id, small_group_id) values
  ('f0000000-0000-4000-8000-0000000004b1', 'f0000000-0000-4000-8000-0000000004a1'),
  ('f0000000-0000-4000-8000-0000000004b1', 'f0000000-0000-4000-8000-0000000004a2');
select is(
  (select count(*)::int from public.person_small_groups where person_id = 'f0000000-0000-4000-8000-0000000004b1'),
  2,
  'a person can be in two small groups'
);

insert into public.small_group_roles (small_group_id, person_id, role) values
  ('f0000000-0000-4000-8000-0000000004a2', 'f0000000-0000-4000-8000-0000000004b1', 'leader');
delete from public.person_small_groups
 where person_id = 'f0000000-0000-4000-8000-0000000004b1' and small_group_id = 'f0000000-0000-4000-8000-0000000004a2';
select is(
  (select count(*)::int from public.small_group_roles where person_id = 'f0000000-0000-4000-8000-0000000004b1'),
  0,
  'leaving a small group drops the role there'
);

select throws_ok(
  $$insert into public.small_group_roles (small_group_id, person_id, role) values ('f0000000-0000-4000-8000-0000000004a2', 'f0000000-0000-4000-8000-0000000004b1', 'host')$$,
  '23503',
  null,
  'only someone in the small group can lead or host it'
);

select is(
  (select count(*)::int from public.small_group_roles where person_id = 'f0000000-0000-4000-8000-0000000004b1'),
  0,
  'the refused role was not saved'
);

update public.people set membership_status = 'active' where id = 'f0000000-0000-4000-8000-0000000004b1';
update public.people set membership_status = 'removed' where id = 'f0000000-0000-4000-8000-0000000004b1';
select is(
  (select count(*)::int from public.person_small_groups where person_id = 'f0000000-0000-4000-8000-0000000004b1'),
  0,
  'a removed member leaves every small group'
);

select * from finish();

rollback;
