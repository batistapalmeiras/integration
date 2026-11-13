begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

insert into auth.users (id) values
  ('f0000000-0000-4000-8000-0000000005a1'),
  ('f0000000-0000-4000-8000-0000000005a2');

insert into public.people (id, name, phone, status) values
  ('f0000000-0000-4000-8000-0000000005b1', 'Teste Equipe', '31900000051', 'member'),
  ('f0000000-0000-4000-8000-0000000005b2', 'Teste Visitante', '31900000052', 'welcome_coffee'),
  ('f0000000-0000-4000-8000-0000000005b3', 'Teste Membro', '31900000053', 'member'),
  ('f0000000-0000-4000-8000-0000000005b4', 'Teste Pastor', '31900000054', 'member');

insert into public.profiles (id, role, person_id) values
  ('f0000000-0000-4000-8000-0000000005a1', 'integration_team', 'f0000000-0000-4000-8000-0000000005b1'),
  ('f0000000-0000-4000-8000-0000000005a2', 'pastor', 'f0000000-0000-4000-8000-0000000005b4');

set local role authenticated;
set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000005a1", "role": "authenticated"}';

update public.people set name = 'Teste Visitante Silva', age = 30 where id = 'f0000000-0000-4000-8000-0000000005b2';
update public.people set whatsapp_opened_at = now() where id = 'f0000000-0000-4000-8000-0000000005b2';

select results_eq(
  $$ select event from public.list_visitor_events('f0000000-0000-4000-8000-0000000005b2') $$,
  $$ values ('record_updated'::text), ('whatsapp_opened'::text) $$,
  'a change of the data and the opening of the WhatsApp are recorded in order'
);

select results_eq(
  $$ select detail -> 'fields' from public.list_visitor_events('f0000000-0000-4000-8000-0000000005b2') where event = 'record_updated' $$,
  $$ values ('["age", "name"]'::jsonb) $$,
  'only the names of the fields that changed are kept, never their values'
);

select results_eq(
  $$ select author_name from public.list_visitor_events('f0000000-0000-4000-8000-0000000005b2') limit 1 $$,
  $$ values ('Teste Equipe'::text) $$,
  'the event keeps who did it'
);

update public.people set phone = '31900000052' where id = 'f0000000-0000-4000-8000-0000000005b2';

select is(
  (select count(*) from public.visitor_events where event = 'record_updated'),
  1::bigint,
  'saving the same values again records nothing'
);

update public.people set name = 'Teste Membro Novo' where id = 'f0000000-0000-4000-8000-0000000005b3';

select is_empty(
  $$ select 1 from public.visitor_events where person_id = 'f0000000-0000-4000-8000-0000000005b3' $$,
  'a member is not logged here'
);

select is_empty(
  $$ select 1 from public.list_visitor_events('f0000000-0000-4000-8000-0000000005b3') $$,
  'the team cannot read anything about a member'
);

set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000005a2", "role": "authenticated"}';

select is(
  (select count(*) from public.list_visitor_events('f0000000-0000-4000-8000-0000000005b2')),
  2::bigint,
  'the pastor reads the events of a visitor'
);

select * from finish();
rollback;
