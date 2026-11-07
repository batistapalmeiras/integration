begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(16);

insert into public.cohorts (id, name, status) values
  ('f0000000-0000-4000-8000-0000000000c1', 'Teste 1990', 'active'),
  ('f0000000-0000-4000-8000-0000000000c2', 'Teste 1991', 'active'),
  ('f0000000-0000-4000-8000-0000000000c3', 'Teste 2090', 'active'),
  ('f0000000-0000-4000-8000-0000000000c4', 'Teste hoje', 'active'),
  ('f0000000-0000-4000-8000-0000000000c5', 'Teste 1992 vazia', 'active'),
  ('f0000000-0000-4000-8000-0000000000c6', 'Teste 1992 com aluno', 'active');

insert into public.lessons (cohort_id, number, date)
select cohort.id, lesson.number, cohort.first_date + (lesson.number - 1) * 7
  from (values
    ('f0000000-0000-4000-8000-0000000000c1'::uuid, date '1990-02-04'),
    ('f0000000-0000-4000-8000-0000000000c2'::uuid, date '1991-03-10'),
    ('f0000000-0000-4000-8000-0000000000c3'::uuid, date '2090-02-05'),
    ('f0000000-0000-4000-8000-0000000000c4'::uuid, (now() at time zone 'America/Sao_Paulo')::date),
    ('f0000000-0000-4000-8000-0000000000c5'::uuid, date '1992-01-05'),
    ('f0000000-0000-4000-8000-0000000000c6'::uuid, date '1992-01-05')
  ) as cohort(id, first_date)
  cross join generate_series(1, 4) as lesson(number);

insert into public.coffee_events (id, event_date) values
  ('f0000000-0000-4000-8000-0000000000e1', '1991-03-01'),
  ('f0000000-0000-4000-8000-0000000000e2', '1990-05-05'),
  ('f0000000-0000-4000-8000-0000000000e3', '2090-06-01');

insert into public.people (id, name, status, signup_window_from) values
  ('f0000000-0000-4000-8000-0000000000a1', 'Teste perdeu a turma', 'pending_signup', '1990-01-01'),
  ('f0000000-0000-4000-8000-0000000000a2', 'Teste turma futura', 'pending_signup', '2090-01-01'),
  ('f0000000-0000-4000-8000-0000000000a3', 'Teste data do café', 'pending_signup', null),
  ('f0000000-0000-4000-8000-0000000000a4', 'Teste turma anterior ao café', 'pending_signup', '2089-12-01'),
  ('f0000000-0000-4000-8000-0000000000a5', 'Teste primeira aula hoje', 'pending_signup', (now() at time zone 'America/Sao_Paulo')::date),
  ('f0000000-0000-4000-8000-0000000000a6', 'Teste já inscrito', 'integration', '1990-01-01'),
  ('f0000000-0000-4000-8000-0000000000b1', 'Teste sem vaga', 'welcome_coffee', null),
  ('f0000000-0000-4000-8000-0000000000b2', 'Teste com vaga', 'welcome_coffee', null),
  ('f0000000-0000-4000-8000-0000000000b3', 'Teste pendente sem vaga', 'pending_signup', '2090-01-01'),
  ('f0000000-0000-4000-8000-0000000000d1', 'Teste aluno em integração', 'integration', null);

insert into public.coffee_attendance (person_id, coffee_event_id, attended) values
  ('f0000000-0000-4000-8000-0000000000a3', 'f0000000-0000-4000-8000-0000000000e1', true),
  ('f0000000-0000-4000-8000-0000000000b2', 'f0000000-0000-4000-8000-0000000000e2', false);

insert into public.enrollments (person_id, cohort_id) values
  ('f0000000-0000-4000-8000-0000000000d1', 'f0000000-0000-4000-8000-0000000000c6');

select public.run_pipeline_maintenance();

select is(
  (select status from public.people where id = 'f0000000-0000-4000-8000-0000000000a1'),
  'archived',
  'arquiva quem não se inscreveu até a primeira aula da turma do seu café'
);

select ok(
  exists (
    select 1 from public.status_history
     where person_id = 'f0000000-0000-4000-8000-0000000000a1'
       and from_status = 'pending_signup' and to_status = 'archived'
       and note = 'Não se inscreveu na turma até o início da primeira aula'
  ),
  'registra o arquivamento no histórico'
);

select is(
  (select status from public.people where id = 'f0000000-0000-4000-8000-0000000000a2'),
  'pending_signup',
  'não arquiva enquanto a primeira aula ainda não começou'
);

select is(
  (select status from public.people where id = 'f0000000-0000-4000-8000-0000000000a3'),
  'archived',
  'sem janela de inscrição, usa a data do café em que esteve presente'
);

select is(
  (select status from public.people where id = 'f0000000-0000-4000-8000-0000000000a4'),
  'pending_signup',
  'ignora turmas que começaram antes do café da pessoa'
);

select is(
  (select status from public.people where id = 'f0000000-0000-4000-8000-0000000000a5'),
  case when (now() at time zone 'America/Sao_Paulo')::time >= time '17:30' then 'archived' else 'pending_signup' end,
  'a primeira aula de hoje só conta a partir das 17:30 de Brasília'
);

select is(
  (select status from public.people where id = 'f0000000-0000-4000-8000-0000000000a6'),
  'integration',
  'não mexe em quem já se inscreveu'
);

select is(
  (select e.event_date
     from public.coffee_attendance a
     join public.coffee_events e on e.id = a.coffee_event_id
    where a.person_id = 'f0000000-0000-4000-8000-0000000000b1' and not a.attended),
  (select min(event_date) from public.coffee_events where event_date >= (now() at time zone 'America/Sao_Paulo')::date),
  'coloca quem está no café de boas-vindas sem vaga no próximo café'
);

select is(
  (select coffee_event_id from public.coffee_attendance
    where person_id = 'f0000000-0000-4000-8000-0000000000b2' and not attended),
  'f0000000-0000-4000-8000-0000000000e2'::uuid,
  'não muda a vaga de quem já tem uma'
);

select is(
  (select count(*)::integer from public.coffee_attendance where person_id = 'f0000000-0000-4000-8000-0000000000b3'),
  0,
  'só dá vaga a quem está no café de boas-vindas'
);

select is(
  (select status from public.cohorts where id = 'f0000000-0000-4000-8000-0000000000c5'),
  'closed',
  'encerra a turma cuja última aula passou e não tem ninguém em integração'
);

select is(
  (select status from public.cohorts where id = 'f0000000-0000-4000-8000-0000000000c6'),
  'active',
  'mantém aberta a turma que ainda tem alguém em integração'
);

select is(
  (select status from public.cohorts where id = 'f0000000-0000-4000-8000-0000000000c3'),
  'active',
  'mantém aberta a turma que ainda tem aulas pela frente'
);

select is(
  public.run_pipeline_maintenance(),
  '{"archived": 0, "seated": 0, "closed": 0}'::jsonb,
  'rodar de novo não muda nada'
);

select ok(
  not has_function_privilege('anon', 'public.run_pipeline_maintenance()', 'execute'),
  'visitantes sem login não podem rodar a manutenção'
);

set local request.jwt.claims = '{"sub": "f0000000-0000-4000-8000-0000000000ff", "role": "authenticated"}';

select throws_ok(
  'select public.run_pipeline_maintenance()',
  'P0001',
  'Sem permissão para rodar a manutenção do funil.',
  'usuário logado sem papel de equipe não pode rodar a manutenção'
);

select * from finish();

rollback;
