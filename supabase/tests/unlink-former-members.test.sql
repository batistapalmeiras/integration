begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(5);

insert into public.small_groups (id, name) values ('f0000000-0000-4000-8000-0000000002a1', 'PG Teste');
insert into public.ministries (id, name) values ('f0000000-0000-4000-8000-0000000002a2', 'Ministério Teste');

insert into public.people (id, name, status, small_group_id) values
  ('f0000000-0000-4000-8000-0000000002b1', 'Teste Desligado', 'member', 'f0000000-0000-4000-8000-0000000002a1'),
  ('f0000000-0000-4000-8000-0000000002b2', 'Teste Ativo', 'member', 'f0000000-0000-4000-8000-0000000002a1');

insert into public.person_ministries (person_id, ministry_id) values
  ('f0000000-0000-4000-8000-0000000002b1', 'f0000000-0000-4000-8000-0000000002a2'),
  ('f0000000-0000-4000-8000-0000000002b2', 'f0000000-0000-4000-8000-0000000002a2');

update public.people set membership_status = 'active' where id in ('f0000000-0000-4000-8000-0000000002b1', 'f0000000-0000-4000-8000-0000000002b2');
update public.people set membership_status = 'removed' where id = 'f0000000-0000-4000-8000-0000000002b1';

select is((select small_group_id from public.people where id = 'f0000000-0000-4000-8000-0000000002b1'), null, 'a removed member leaves the small group');
select is((select count(*)::int from public.person_ministries where person_id = 'f0000000-0000-4000-8000-0000000002b1'), 0, 'a removed member leaves every ministry');
select is((select small_group_id from public.people where id = 'f0000000-0000-4000-8000-0000000002b2'), 'f0000000-0000-4000-8000-0000000002a1'::uuid, 'an active member stays in the small group');
select is((select count(*)::int from public.person_ministries where person_id = 'f0000000-0000-4000-8000-0000000002b2'), 1, 'an active member keeps the ministries');

update public.people set membership_status = 'transferred', small_group_id = 'f0000000-0000-4000-8000-0000000002a1' where id = 'f0000000-0000-4000-8000-0000000002b2';
select is((select small_group_id from public.people where id = 'f0000000-0000-4000-8000-0000000002b2'), null, 'a transfer also clears a small group set in the same update');

select * from finish();

rollback;
