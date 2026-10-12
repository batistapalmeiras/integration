// Local
import { formatDate } from '../../../domain/dates';
import { PersonSensitive } from '../../../domain/personSensitive';
import { ENTRY_TYPE_LABELS, WANTS_SMALL_GROUP_LABELS } from '../../../types/church';
import { Person } from '../../../features/visitors';

export interface InfoEntry {
  label: string;
  value: string;
}

function entry(label: string, value: string | null | undefined): InfoEntry | null {
  return value ? { label, value } : null;
}

function compact(entries: (InfoEntry | null)[]): InfoEntry[] {
  return entries.filter((e): e is InfoEntry => !!e);
}

export function integrationEntries(data: PersonSensitive | null): InfoEntry[] {
  if (!data) return [];
  return compact([
    entry('Frequenta a igreja desde', data.attending_since),
    entry('Igreja anterior', data.previous_church),
    entry('Batismo', data.baptism_info),
    entry('Testemunho de conversão', data.conversion_testimony),
    entry('Estado civil', data.marital_status_story),
  ]);
}

export function membershipEntries(person: Person, data: PersonSensitive | null): InfoEntry[] {
  return compact([
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
    entry(
      'Estatuto aceito em',
      person.statute_agreed_at ? formatDate(person.statute_agreed_at.slice(0, 10)) : null,
    ),
  ]);
}
