// Local
import { formatDate, formatTimestampDate } from '../../../domain/dates';
import { LessonMakeup } from '../../../domain/lessonMakeups';
import { PersonSensitive } from '../../../domain/personSensitive';
import { ENTRY_TYPE_LABELS, WANTS_SMALL_GROUP_LABELS } from '../../../types/church';
import { Person } from '../../../features/visitors';

const NO_ANSWER = 'Sem resposta';

export interface InfoEntry {
  label: string;
  value: string;
  answered: boolean;
}

function entry(label: string, value: string | null | undefined): InfoEntry {
  return { label, value: value || NO_ANSWER, answered: !!value };
}

export function integrationEntries(data: PersonSensitive | null): InfoEntry[] {
  return [
    entry('Frequenta a igreja desde', data?.attending_since),
    entry('Igreja anterior', data?.previous_church),
    entry('Batismo', data?.baptism_info),
    entry('Testemunho de conversão', data?.conversion_testimony),
    entry('Estado civil', data?.marital_status_story),
  ];
}

export function membershipEntries(person: Person, data: PersonSensitive | null): InfoEntry[] {
  return [
    entry('Data de nascimento', data?.birth_date ? formatDate(data.birth_date) : null),
    entry(
      'Forma de entrada',
      person.entry_type ? ENTRY_TYPE_LABELS[person.entry_type as keyof typeof ENTRY_TYPE_LABELS] : null,
    ),
    entry('Igreja de origem', data?.origin_church),
    entry('Interesse em ministérios', data?.ministry_interests?.length ? data.ministry_interests.join(', ') : null),
    entry(
      'Quer participar de um PG',
      data?.wants_small_group
        ? WANTS_SMALL_GROUP_LABELS[data.wants_small_group as keyof typeof WANTS_SMALL_GROUP_LABELS] ??
            data.wants_small_group
        : null,
    ),
    entry('Sociedade secreta', data?.secret_society),
    entry('Observações', data?.membership_note),
    entry('Estatuto aceito em', person.statute_agreed_at ? formatDate(person.statute_agreed_at.slice(0, 10)) : null),
  ];
}

export function makeupEntries(makeup: LessonMakeup): InfoEntry[] {
  return [
    entry('Aula', `Aula ${makeup.lessonNumber} — ${makeup.cohortName}`),
    makeup.confirmedAt
      ? entry('Assistiu à aula em', formatTimestampDate(makeup.confirmedAt))
      : { label: 'Assistiu à aula em', value: 'Data não registrada', answered: false },
    entry('Declarou ter assistido à aula até o final', 'Sim'),
    entry('Teve alguma dúvida ou algo chamou a atenção', makeup.notes),
  ];
}
