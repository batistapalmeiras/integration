-- Consolidação em PG e ministério: um acompanhamento por vínculo.
-- Abre sozinho quando alguém entra num PG ou ministério. Some quando o pastor responde,
-- ou quando o vínculo é desfeito antes disso (erro ou desistência). Quem já foi respondido
-- fica na tabela como histórico.

create table public.consolidations (
  id uuid default gen_random_uuid() not null,
  person_id uuid not null,
  kind text not null,
  small_group_id uuid,
  ministry_id uuid,
  origin_group_id uuid,
  started_at timestamp with time zone default now() not null,
  closed_at timestamp with time zone,
  outcome text,
  closed_by uuid default auth.uid(),
  constraint consolidations_pkey primary key (id),
  constraint consolidations_kind_check check (kind in ('small_group', 'ministry')),
  constraint consolidations_group_check check (
    (kind = 'small_group' and small_group_id is not null and ministry_id is null)
    or (kind = 'ministry' and ministry_id is not null and small_group_id is null)
  ),
  constraint consolidations_outcome_check check (
    outcome is null or outcome in ('consolidated', 'not_consolidated', 'redirected')
  ),
  constraint consolidations_closed_check check ((closed_at is null) = (outcome is null)),
  constraint consolidations_person_id_fkey foreign key (person_id) references public.people (id) on delete cascade,
  constraint consolidations_small_group_id_fkey foreign key (small_group_id) references public.small_groups (id) on delete cascade,
  constraint consolidations_ministry_id_fkey foreign key (ministry_id) references public.ministries (id) on delete cascade,
  constraint consolidations_closed_by_fkey foreign key (closed_by) references public.profiles (id) on delete set null
);

create unique index consolidations_one_open_key
  on public.consolidations (person_id, kind, coalesce(small_group_id, ministry_id))
  where closed_at is null;

create index consolidations_person_idx on public.consolidations (person_id);

alter table public.consolidations enable row level security;

create policy consolidations_read_general_admin on public.consolidations
  as permissive for select to authenticated
  using (public."current_role"() = 'general_admin');

revoke all on public.consolidations from anon, authenticated;
grant select on public.consolidations to authenticated;

create view public.consolidation_queue with (security_invoker = true) as
  select c.id,
         c.person_id,
         c.kind,
         c.small_group_id,
         c.ministry_id,
         c.origin_group_id,
         c.started_at,
         c.started_at + interval '2 months' as due_at,
         now() >= c.started_at + interval '2 months' as overdue
    from public.consolidations c
   where c.closed_at is null;

grant select on public.consolidation_queue to authenticated;

-- Gatilhos: abrir ao vincular e cancelar ao desfazer o vínculo.

create or replace function public.open_consolidation()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if coalesce(current_setting('app.consolidation_skip_open', true), '') = 'on' then
    return null;
  end if;
  if tg_table_name = 'person_small_groups' then
    insert into public.consolidations (person_id, kind, small_group_id)
    values (new.person_id, 'small_group', new.small_group_id);
  else
    insert into public.consolidations (person_id, kind, ministry_id)
    values (new.person_id, 'ministry', new.ministry_id);
  end if;
  return null;
end;
$function$;

create or replace function public.cancel_consolidation()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if tg_table_name = 'person_small_groups' then
    delete from public.consolidations
     where closed_at is null and kind = 'small_group'
       and person_id = old.person_id and small_group_id = old.small_group_id;
  else
    delete from public.consolidations
     where closed_at is null and kind = 'ministry'
       and person_id = old.person_id and ministry_id = old.ministry_id;
  end if;
  return null;
end;
$function$;

create trigger person_small_groups_open_consolidation
  after insert on public.person_small_groups
  for each row execute function public.open_consolidation();

create trigger person_small_groups_cancel_consolidation
  after delete on public.person_small_groups
  for each row execute function public.cancel_consolidation();

create trigger person_ministries_open_consolidation
  after insert on public.person_ministries
  for each row execute function public.open_consolidation();

create trigger person_ministries_cancel_consolidation
  after delete on public.person_ministries
  for each row execute function public.cancel_consolidation();

-- Troca de grupo: o pastor move a pessoa de um PG (ou ministério) para outro.
-- Se ela volta ao grupo de onde a consolidação começou, a consolidação é cancelada e
-- nenhuma nova é aberta. Caso contrário, abre uma nova para o grupo de destino.

create or replace function public.move_person_group(
  p_person_id uuid,
  p_kind text,
  p_from_id uuid,
  p_to_id uuid
)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_open public.consolidations;
  v_origin uuid;
begin
  if public."current_role"() <> 'general_admin' then
    raise exception 'Só o pastor pode trocar a pessoa de PG ou ministério.';
  end if;
  if p_kind not in ('small_group', 'ministry') then
    raise exception 'Tipo de grupo inválido.';
  end if;

  select * into v_open
    from public.consolidations c
   where c.person_id = p_person_id and c.kind = p_kind and c.closed_at is null
     and coalesce(c.small_group_id, c.ministry_id) = p_from_id;
  v_origin := coalesce(v_open.origin_group_id, p_from_id);

  perform set_config('app.consolidation_skip_open', 'on', true);

  if p_kind = 'small_group' then
    delete from public.person_small_groups where person_id = p_person_id and small_group_id = p_from_id;
    insert into public.person_small_groups (person_id, small_group_id) values (p_person_id, p_to_id);
  else
    delete from public.person_ministries where person_id = p_person_id and ministry_id = p_from_id;
    insert into public.person_ministries (person_id, ministry_id) values (p_person_id, p_to_id);
  end if;

  perform set_config('app.consolidation_skip_open', '', true);

  if v_origin = p_to_id then
    return;
  end if;

  insert into public.consolidations (person_id, kind, small_group_id, ministry_id, origin_group_id)
  values (
    p_person_id,
    p_kind,
    case when p_kind = 'small_group' then p_to_id end,
    case when p_kind = 'ministry' then p_to_id end,
    v_origin
  );
end;
$function$;

-- Resposta final do pastor.

create or replace function public.close_consolidation(p_consolidation_id uuid, p_outcome text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_row public.consolidations;
begin
  if public."current_role"() <> 'general_admin' then
    raise exception 'Só o pastor pode registrar a resposta da consolidação.';
  end if;
  if p_outcome not in ('consolidated', 'not_consolidated') then
    raise exception 'Resposta inválida.';
  end if;

  select * into v_row from public.consolidations where id = p_consolidation_id and closed_at is null for update;
  if not found then
    raise exception 'Esta consolidação já foi respondida.';
  end if;

  update public.consolidations
     set closed_at = now(), outcome = p_outcome, closed_by = auth.uid()
   where id = v_row.id;

  if p_outcome = 'not_consolidated' then
    if v_row.kind = 'small_group' then
      delete from public.person_small_groups where person_id = v_row.person_id and small_group_id = v_row.small_group_id;
    else
      delete from public.person_ministries where person_id = v_row.person_id and ministry_id = v_row.ministry_id;
    end if;
  end if;
end;
$function$;

-- Redirecionar: encerra esta consolidação e leva a pessoa a outro PG ou ministério.

create or replace function public.redirect_consolidation(
  p_consolidation_id uuid,
  p_to_kind text,
  p_to_id uuid
)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_row public.consolidations;
  v_origin uuid;
begin
  if public."current_role"() <> 'general_admin' then
    raise exception 'Só o pastor pode redirecionar a pessoa.';
  end if;
  if p_to_kind not in ('small_group', 'ministry') then
    raise exception 'Tipo de grupo inválido.';
  end if;

  select * into v_row from public.consolidations where id = p_consolidation_id and closed_at is null for update;
  if not found then
    raise exception 'Esta consolidação já foi respondida.';
  end if;
  if coalesce(v_row.small_group_id, v_row.ministry_id) = p_to_id then
    raise exception 'A pessoa já está nesse grupo.';
  end if;

  v_origin := coalesce(v_row.origin_group_id, coalesce(v_row.small_group_id, v_row.ministry_id));

  update public.consolidations
     set closed_at = now(), outcome = 'redirected', closed_by = auth.uid()
   where id = v_row.id;

  if v_row.kind = 'small_group' then
    delete from public.person_small_groups where person_id = v_row.person_id and small_group_id = v_row.small_group_id;
  else
    delete from public.person_ministries where person_id = v_row.person_id and ministry_id = v_row.ministry_id;
  end if;

  perform set_config('app.consolidation_skip_open', 'on', true);
  if p_to_kind = 'small_group' then
    insert into public.person_small_groups (person_id, small_group_id) values (v_row.person_id, p_to_id);
  else
    insert into public.person_ministries (person_id, ministry_id) values (v_row.person_id, p_to_id);
  end if;
  perform set_config('app.consolidation_skip_open', '', true);

  if v_origin = p_to_id then
    return;
  end if;

  insert into public.consolidations (person_id, kind, small_group_id, ministry_id, origin_group_id)
  values (
    v_row.person_id,
    p_to_kind,
    case when p_to_kind = 'small_group' then p_to_id end,
    case when p_to_kind = 'ministry' then p_to_id end,
    v_origin
  );
end;
$function$;

revoke all on function public.open_consolidation() from public, anon, authenticated;
revoke all on function public.cancel_consolidation() from public, anon, authenticated;
revoke all on function public.move_person_group(uuid, text, uuid, uuid) from public, anon;
revoke all on function public.close_consolidation(uuid, text) from public, anon;
revoke all on function public.redirect_consolidation(uuid, text, uuid) from public, anon;
grant execute on function public.move_person_group(uuid, text, uuid, uuid) to authenticated;
grant execute on function public.close_consolidation(uuid, text) to authenticated;
grant execute on function public.redirect_consolidation(uuid, text, uuid) to authenticated;
