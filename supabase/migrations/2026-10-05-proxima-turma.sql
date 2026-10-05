-- 2026-10-05 — "próxima turma"
--
-- A inscrição pública caía sempre em `cohorts where status = 'active'`, sem
-- olhar se as aulas já tinham começado: quem foi ao café de 04/10 entrou na
-- turma que estava na 3ª aula. Passa a valer a mesma regra do café — a
-- pessoa entra na próxima turma, a que ainda não começou.
--
-- Escrito a partir das definições que estavam em produção em 05/10/2026.

-- 1. Duas turmas podem coexistir: a em andamento e a próxima, que o pastor
--    ou o admin abre à mão. O índice único impedia a segunda existir.
drop index if exists public.cohorts_one_active;

-- 2. "Turma aberta para inscrição" = a de menor data cuja 1ª aula ainda não
--    começou. 17:30 no horário de São Paulo, o mesmo corte do café e o mesmo
--    que o app usa para arquivar quem não se inscreveu.
create or replace function public.get_active_cohort_schedule()
returns table (cohort_name text, lesson_dates date[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cohort_id   uuid;
  v_cohort_name text;
  v_lesson_dates date[];
begin
  select c.id, c.name into v_cohort_id, v_cohort_name
    from public.cohorts c
    join public.lessons l on l.cohort_id = c.id and l.number = 1
    where c.status = 'active'
      and ((l.date + time '17:30') at time zone 'America/Sao_Paulo') > now()
    order by l.date
    limit 1;

  -- Nenhuma turma aberta: o formulário público já trata zero linhas
  -- mostrando o aviso de aguardar a próxima turma e bloqueando o Continuar.
  if v_cohort_id is null then
    return;
  end if;

  select array_agg(l.date order by l.number) into v_lesson_dates
    from public.lessons l
    where l.cohort_id = v_cohort_id;

  return query select v_cohort_name, v_lesson_dates;
end;
$$;

grant execute on function public.get_active_cohort_schedule() to anon;

create or replace function public.submit_integration_signup(
  p_phone                text,
  p_attending_since      text,
  p_previous_church      text,
  p_baptism_info         text,
  p_conversion_testimony text,
  p_marital_status_story text
)
returns table (cohort_name text, lesson_dates date[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id   uuid;
  v_cohort_id   uuid;
  v_cohort_name text;
  v_lesson_dates date[];
begin
  v_person_id := public.find_welcome_coffee_person(p_phone);

  select c.id, c.name into v_cohort_id, v_cohort_name
    from public.cohorts c
    join public.lessons l on l.cohort_id = c.id and l.number = 1
    where c.status = 'active'
      and ((l.date + time '17:30') at time zone 'America/Sao_Paulo') > now()
    order by l.date
    limit 1;

  if v_cohort_id is null then
    raise exception 'A próxima turma de Integração ainda não foi aberta. Fale com a Equipe de Integração.';
  end if;

  update public.people
    set attending_since = p_attending_since,
        previous_church = p_previous_church,
        baptism_info = p_baptism_info,
        conversion_testimony = p_conversion_testimony,
        marital_status_story = p_marital_status_story,
        status = 'integration',
        updated_at = now()
    where id = v_person_id;

  insert into public.enrollments (person_id, cohort_id)
    values (v_person_id, v_cohort_id)
    on conflict (person_id, cohort_id) do nothing;

  -- from_status era 'welcome_coffee' fixo, de antes do sub-status existir:
  -- quem preenche o formulário sai de 'pending_signup', não de
  -- 'welcome_coffee' (find_welcome_coffee_person só encontra quem está lá).
  insert into public.status_history (person_id, from_status, to_status, note)
    values (v_person_id, 'pending_signup', 'integration', 'Inscrição via formulário público');

  select array_agg(l.date order by l.number) into v_lesson_dates
    from public.lessons l
    where l.cohort_id = v_cohort_id;

  return query select v_cohort_name, v_lesson_dates;
end;
$$;

grant execute on function public.submit_integration_signup(text, text, text, text, text, text) to anon;

-- 3. Abrir, editar e encerrar turma passa a ser de pastor e admin. O
--    professor continua registrando presença (lesson_attendance tem policy
--    própria), só não mexe mais no calendário.
drop policy if exists "cohorts_manage_admin_teacher" on public.cohorts;
create policy "cohorts_manage_admin_pastor"
  on public.cohorts for all
  using (public.current_role() in ('admin', 'pastor'))
  with check (public.current_role() in ('admin', 'pastor'));

drop policy if exists "lessons_manage_admin_teacher" on public.lessons;
create policy "lessons_manage_admin_pastor"
  on public.lessons for all
  using (public.current_role() in ('admin', 'pastor'))
  with check (public.current_role() in ('admin', 'pastor'));
