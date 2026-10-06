-- 2026-10-06 — ficha de interesse a qualquer momento
--
-- Preencher a ficha e virar candidato a membro eram a mesma coisa: a busca
-- pública só encontrava quem já tinha 4/4 aulas, e o submit promovia para
-- 'membership_pending'. Agora são dois atos distintos — qualquer pessoa
-- matriculada numa turma preenche quando quiser, e a elegibilidade continua
-- exigindo as 4 aulas (reposição conta como presença).
--
-- Escrito a partir das definições que estavam em produção em 06/10/2026.

-- 1. Progresso nas aulas, numa função só, porque três lugares precisam dele.
--    Usa a matrícula mais recente: quem foi remanejado de turma conta pela
--    turma em que está agora.
create or replace function public.membership_lesson_progress(p_person_id uuid)
returns table (lessons_attended int, lessons_total int)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(s.lessons_attended, 0)::int,
    (select count(*) from public.lessons l where l.cohort_id = e.cohort_id)::int
  from public.enrollments e
  left join public.enrollment_attendance_summary s on s.enrollment_id = e.id
  where e.person_id = p_person_id
  order by e.created_at desc
  limit 1;
$$;

-- 2. A busca passa a exigir só "está matriculado numa turma". Aceita também
--    quem já está em 'membership_pending': quem preencheu e volta à página
--    precisa ver a confirmação, e hoje via o erro vermelho, porque o próprio
--    submit tinha acabado de tirá-lo de 'integration'.
--
--    count(distinct) porque uma pessoa pode ter mais de uma matrícula
--    (remanejada de turma) e isso contava como "mais de um cadastro".
create or replace function public.find_membership_interest_person(p_phone text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match_count int;
  v_person_id   uuid;
begin
  select count(distinct p.id) into v_match_count
    from public.people p
    join public.enrollments e on e.person_id = p.id
    where p.phone = p_phone and p.status in ('integration', 'membership_pending');

  if v_match_count = 0 then
    raise exception 'Não encontramos seu cadastro na Integração com esse telefone. A ficha é para quem já está matriculado numa turma — fale com a Equipe de Integração.';
  end if;

  if v_match_count > 1 then
    raise exception 'Encontramos mais de um cadastro com esse telefone. Fale com a Equipe de Integração.';
  end if;

  select p.id into v_person_id
    from public.people p
    join public.enrollments e on e.person_id = p.id
    where p.phone = p_phone and p.status in ('integration', 'membership_pending')
    limit 1;

  return v_person_id;
end;
$$;

-- 3. A consulta devolve o progresso junto, que é o que a tela de
--    confirmação usa para dizer o que ainda falta.
--    (drop antes do create: mudar o tipo de retorno exige recriar.)
drop function if exists public.check_membership_interest_phone(text);

create function public.check_membership_interest_phone(p_phone text)
returns table (person_name text, already_submitted boolean, lessons_attended int, lessons_total int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id uuid;
begin
  v_person_id := public.find_membership_interest_person(p_phone);

  return query
    select p.name, p.statute_agreed_at is not null, g.lessons_attended, g.lessons_total
      from public.people p, public.membership_lesson_progress(p.id) g
      where p.id = v_person_id;
end;
$$;

grant execute on function public.check_membership_interest_phone(text) to anon;

-- 4. O envio sempre grava as respostas e o aceite do estatuto. A promoção
--    para 'membership_pending' é que fica condicionada às 4 aulas.
drop function if exists public.submit_membership_interest(text, date, text, text, text[], text, text, text);

create function public.submit_membership_interest(
  p_phone              text,
  p_birth_date         date,
  p_entry_type         text,
  p_origin_church      text,
  p_ministry_interests text[],
  p_secret_society     text,
  p_wants_small_group  text,
  p_membership_note    text
)
returns table (lessons_attended int, lessons_total int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id uuid;
  v_status    text;
  v_attended  int;
  v_total     int;
begin
  v_person_id := public.find_membership_interest_person(p_phone);

  select g.lessons_attended, g.lessons_total into v_attended, v_total
    from public.membership_lesson_progress(v_person_id) g;

  select p.status into v_status from public.people p where p.id = v_person_id;

  update public.people
    set birth_date = p_birth_date,
        entry_type = p_entry_type,
        origin_church = p_origin_church,
        statute_agreed_at = now(),
        ministry_interests = p_ministry_interests,
        secret_society = p_secret_society,
        wants_small_group = p_wants_small_group,
        membership_note = p_membership_note,
        updated_at = now()
    where id = v_person_id;

  if v_status = 'integration' and v_total > 0 and v_attended >= v_total then
    update public.people set status = 'membership_pending', updated_at = now() where id = v_person_id;

    insert into public.status_history (person_id, from_status, to_status, note)
      values (v_person_id, 'integration', 'membership_pending', 'Ficha de Interesse de Membresia preenchida');
  end if;

  return query select v_attended, v_total;
end;
$$;

grant execute on function public.submit_membership_interest(text, date, text, text, text[], text, text, text) to anon;

-- 5. Quem preencheu a ficha antes de terminar sobe sozinho ao fechar a
--    última presença. Tem que ser no banco: a presença também é registrada
--    pela página pública de reposição, então uma checagem no app deixaria de
--    fora justamente quem conclui assistindo ao vídeo.
create or replace function public.promote_membership_on_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id uuid;
  v_attended  int;
  v_total     int;
begin
  select e.person_id,
         (select count(*) from public.lesson_attendance la where la.enrollment_id = e.id and la.attended),
         (select count(*) from public.lessons l where l.cohort_id = e.cohort_id)
    into v_person_id, v_attended, v_total
    from public.enrollments e
    where e.id = new.enrollment_id;

  if v_person_id is null or v_total = 0 or v_attended < v_total then
    return new;
  end if;

  -- statute_agreed_at not null = a ficha já foi preenchida. Quem concluiu as
  -- aulas e nunca preencheu segue em 'integration', como sempre foi.
  update public.people
    set status = 'membership_pending', updated_at = now()
    where id = v_person_id and status = 'integration' and statute_agreed_at is not null;

  if found then
    insert into public.status_history (person_id, from_status, to_status, note)
      values (v_person_id, 'integration', 'membership_pending',
              'Concluiu as aulas de Integração com a ficha de interesse já preenchida');
  end if;

  return new;
end;
$$;

drop trigger if exists lesson_attendance_promotes_membership on public.lesson_attendance;

create trigger lesson_attendance_promotes_membership
  after insert or update of attended on public.lesson_attendance
  for each row
  when (new.attended)
  execute function public.promote_membership_on_attendance();
