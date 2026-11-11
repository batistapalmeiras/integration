begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(6);

select is(public.format_person_name('roberto goncalves de sa menezes'), 'Roberto Goncalves de Sa Menezes');
select is(public.format_person_name('MARIA DAS GRAÇAS DA SILVA E SOUSA'), 'Maria das Graças da Silva e Sousa');
select is(public.format_person_name('  Tiago   De Moraes Cruz '), 'Tiago de Moraes Cruz');
select is(public.format_person_name('de souza'), 'De Souza');

insert into public.people (id, name, status)
values ('f0000000-0000-4000-8000-0000000000f1', 'ana DOS santos', 'integration');

select is((select name from public.people where id = 'f0000000-0000-4000-8000-0000000000f1'), 'Ana dos Santos');

update public.people set name = 'ANA PAULA DOS SANTOS' where id = 'f0000000-0000-4000-8000-0000000000f1';

select is((select name from public.people where id = 'f0000000-0000-4000-8000-0000000000f1'), 'Ana Paula dos Santos');

select * from finish();

rollback;
