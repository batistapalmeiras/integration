# Como testar o fluxo de reposição de aula

O botão "Copiar link de reposição" (na tela de detalhe de um visitante em
Integração) só aparece depois que a **última** aula da turma já passou da
data. Como as turmas de teste costumam ter datas no futuro, esse botão não
dá pra usar pra testar. O passo a passo abaixo cria/reseta a presença
pendente direto no banco, pra testar o link a qualquer momento.

## 1. Achar a matrícula e as aulas da turma ativa

Roda no SQL Editor do Supabase:

```sql
select e.id as enrollment_id, p.name, l.id as lesson_id, l.number, l.date
from public.enrollments e
join public.people p on p.id = e.person_id
join public.cohorts c on c.id = e.cohort_id
join public.lessons l on l.cohort_id = c.id
where c.status = 'active'
order by p.name, l.number;
```

Isso mostra, pra cada pessoa matriculada na turma ativa, o `lesson_id` de
cada uma das 4 aulas.

## 2. Gerar o link de reposição de UMA aula específica

Troca `<enrollment_id>` e `<lesson_id>` pelos valores da aula que você quer
testar (1, 2, 3 ou 4) do resultado do passo 1:

```sql
insert into public.lesson_attendance (enrollment_id, lesson_id, attended)
values ('<enrollment_id>', '<lesson_id>', false)
on conflict (enrollment_id, lesson_id) do update set attended = false, makeup_notes = null
returning id;
```

O `id` retornado é o token do link:

```
https://integracao-batistapalmeiras.vercel.app/turma/reposicao/{id}
```

## 3. Gerar o link das 4 aulas de uma vez (mais rápido)

Troca `'teste'` pelo nome da pessoa que você quer usar pro teste:

```sql
with target as (
  select e.id as enrollment_id, l.id as lesson_id, l.number
  from public.enrollments e
  join public.people p on p.id = e.person_id
  join public.cohorts c on c.id = e.cohort_id
  join public.lessons l on l.cohort_id = c.id
  where c.status = 'active' and p.name = 'teste'
), upserted as (
  insert into public.lesson_attendance (enrollment_id, lesson_id, attended)
  select enrollment_id, lesson_id, false from target
  on conflict (enrollment_id, lesson_id) do update set attended = false, makeup_notes = null
  returning lesson_id, id as makeup_token
)
select t.number as aula, u.makeup_token
from upserted u
join target t on t.lesson_id = u.lesson_id
order by t.number;
```

Isso devolve uma linha por aula (1 a 4), cada uma com seu próprio token —
monta os 4 links trocando `{id}` pelo `makeup_token` de cada linha.

## 4. Abrir e testar

Abre o link numa aba anônima (simula a pessoa, sem estar logado). Deve
aparecer o vídeo certo da aula, a declaração de presença pra marcar, e o
botão de confirmar.

## 5. Conferir e resetar pra testar de novo

Conferir se marcou:

```sql
select attended, makeup_notes from public.lesson_attendance where id = '<token>';
```

Resetar pra testar de novo:

```sql
update public.lesson_attendance set attended = false, makeup_notes = null where id = '<token>';
```
