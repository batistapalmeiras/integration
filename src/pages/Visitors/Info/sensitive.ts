// Local
import { formatDate } from '../../../domain/dates';
import { PersonSensitive } from '../../../domain/personSensitive';
import { WANTS_SMALL_GROUP_LABELS } from '../../../types/church';

export interface SensitiveEntry {
  label: string;
  value: string;
}

export interface SensitiveSection {
  title: string;
  entries: SensitiveEntry[];
}

function entry(label: string, value: string | null | undefined): SensitiveEntry | null {
  return value ? { label, value } : null;
}

function compact(entries: (SensitiveEntry | null)[]): SensitiveEntry[] {
  return entries.filter((e): e is SensitiveEntry => !!e);
}

export function sensitiveSections(data: PersonSensitive | null): SensitiveSection[] {
  if (!data) return [];

  const sections: SensitiveSection[] = [
    {
      title: 'Inscrição na Integração',
      entries: compact([
        entry('Frequenta a igreja desde', data.attending_since),
        entry('Igreja anterior', data.previous_church),
        entry('Batismo', data.baptism_info),
        entry('Testemunho de conversão', data.conversion_testimony),
        entry('Estado civil', data.marital_status_story),
      ]),
    },
    {
      title: 'Ficha de Interesse de Membresia',
      entries: compact([
        entry('Data de nascimento', data.birth_date ? formatDate(data.birth_date) : null),
        entry('Igreja de origem', data.origin_church),
        entry('Interesse em ministérios', data.ministry_interests?.length ? data.ministry_interests.join(', ') : null),
        entry(
          'Quer participar de um PG',
          data.wants_small_group
            ? WANTS_SMALL_GROUP_LABELS[data.wants_small_group as keyof typeof WANTS_SMALL_GROUP_LABELS] ??
                data.wants_small_group
            : null,
        ),
        entry('Sociedade secreta', data.secret_society),
        entry('Observações', data.membership_note),
      ]),
    },
  ];

  return sections.filter((section) => section.entries.length > 0);
}
