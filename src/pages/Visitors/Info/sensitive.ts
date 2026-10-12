// Local
import { formatDate } from '../../../domain/dates';
import { PersonSensitive } from '../../../domain/personSensitive';
import { WANTS_SMALL_GROUP_LABELS } from '../../../types/church';

export interface SensitiveEntry {
  label: string;
  value: string;
}

export function sensitiveEntries(data: PersonSensitive | null): SensitiveEntry[] {
  if (!data) return [];

  const entries: (SensitiveEntry | null)[] = [
    data.birth_date ? { label: 'Data de nascimento', value: formatDate(data.birth_date) } : null,
    data.attending_since ? { label: 'Frequenta a igreja desde', value: data.attending_since } : null,
    data.previous_church ? { label: 'Igreja anterior', value: data.previous_church } : null,
    data.origin_church ? { label: 'Igreja de origem', value: data.origin_church } : null,
    data.baptism_info ? { label: 'Batismo', value: data.baptism_info } : null,
    data.conversion_testimony ? { label: 'Testemunho de conversão', value: data.conversion_testimony } : null,
    data.marital_status_story ? { label: 'Estado civil', value: data.marital_status_story } : null,
    data.ministry_interests?.length
      ? { label: 'Interesse em ministérios', value: data.ministry_interests.join(', ') }
      : null,
    data.wants_small_group
      ? {
          label: 'Quer participar de um PG',
          value: WANTS_SMALL_GROUP_LABELS[data.wants_small_group as keyof typeof WANTS_SMALL_GROUP_LABELS] ?? data.wants_small_group,
        }
      : null,
    data.secret_society ? { label: 'Sociedade secreta', value: data.secret_society } : null,
    data.membership_note ? { label: 'Observações', value: data.membership_note } : null,
  ];

  return entries.filter((entry): entry is SensitiveEntry => !!entry);
}
