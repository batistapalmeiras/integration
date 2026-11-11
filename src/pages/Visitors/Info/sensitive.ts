// Local
import { formatDate, formatTimestampDate } from '../../../domain/dates';
import { LessonMakeup } from '../../../domain/lessonMakeups';
import { PersonSensitive } from '../../../domain/personSensitive';
import { ENTRY_TYPE_LABELS, MEMBERSHIP_ANSWER_LABELS, WANTS_SMALL_GROUP_LABELS } from '../../../types/church';
import { Person } from '../../../features/visitors';

const NO_ANSWER = 'Sem resposta';

export interface InfoEntry {
  label: string;
  value: string;
  answered: boolean;
  wide: boolean;
}

function entry(label: string, value: string | null | undefined): InfoEntry {
  return { label, value: value || NO_ANSWER, answered: !!value, wide: false };
}

function wideEntry(label: string, value: string | null | undefined): InfoEntry {
  return { ...entry(label, value), wide: true };
}

export function integrationEntries(data: PersonSensitive | null): InfoEntry[] {
  return [
    entry('Frequenta a igreja desde', data?.attending_since),
    entry('Igreja anterior', data?.previous_church),
    wideEntry('Batismo', data?.baptism_info),
    wideEntry('Testemunho de conversão', data?.conversion_testimony),
    wideEntry('Estado civil', data?.marital_status_story),
  ];
}

export function membershipCommunityEntries(data: PersonSensitive | null): InfoEntry[] {
  return [
    entry(
      MEMBERSHIP_ANSWER_LABELS.wantsSmallGroup,
      data?.wants_small_group
        ? (WANTS_SMALL_GROUP_LABELS[data.wants_small_group as keyof typeof WANTS_SMALL_GROUP_LABELS] ??
            data.wants_small_group)
        : null,
    ),
    entry(
      MEMBERSHIP_ANSWER_LABELS.ministryInterests,
      data?.ministry_interests?.length ? data.ministry_interests.join(', ') : null,
    ),
  ];
}

export function membershipEntries(person: Person, data: PersonSensitive | null): InfoEntry[] {
  const [wantsSmallGroup, ministryInterests] = membershipCommunityEntries(data);
  return [
    entry('Data de nascimento', data?.birth_date ? formatDate(data.birth_date) : null),
    entry(
      MEMBERSHIP_ANSWER_LABELS.entryType,
      person.entry_type ? ENTRY_TYPE_LABELS[person.entry_type as keyof typeof ENTRY_TYPE_LABELS] : null,
    ),
    entry(MEMBERSHIP_ANSWER_LABELS.originChurch, data?.origin_church),
    wantsSmallGroup,
    entry(MEMBERSHIP_ANSWER_LABELS.secretSociety, data?.secret_society),
    entry(
      MEMBERSHIP_ANSWER_LABELS.statuteAgreedAt,
      person.statute_agreed_at ? formatDate(person.statute_agreed_at.slice(0, 10)) : null,
    ),
    { ...ministryInterests, wide: true },
    wideEntry(MEMBERSHIP_ANSWER_LABELS.membershipNote, data?.membership_note),
  ];
}

export function makeupEntries(makeup: LessonMakeup): InfoEntry[] {
  return [
    entry('Aula', `Aula ${makeup.lessonNumber} — ${makeup.cohortName}`),
    makeup.confirmedAt
      ? entry('Assistiu à aula em', formatTimestampDate(makeup.confirmedAt))
      : { label: 'Assistiu à aula em', value: 'Data não registrada', answered: false, wide: false },
    entry('Declarou ter assistido à aula até o final', 'Sim'),
    wideEntry('Teve alguma dúvida ou algo chamou a atenção', makeup.notes),
  ];
}
