// Libs
import { maskPhone } from 'bp-kit';
// Local
import { LessonMakeup } from '../../../domain/lessonMakeups';
import { communityDeclines } from '../../../domain/membership';
import { MemberProfile, MemberRecord } from '../../../domain/memberRecords';
import { PersonSensitive } from '../../../domain/personSensitive';
import { YES_NO_LABELS } from '../../../domain/text';
import { MEMBERSHIP_ANSWER_LABELS, toEntryType, WANTS_SMALL_GROUP_LABELS } from '../../../types/church';
import { displayValue, MEMBER_RECORD_SECTIONS, RecordSection } from '../../../features/memberRecord';
import { SERVE_STEP_TITLE } from '../../../features/membershipForm';
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
      communityDeclines(data).ministry ? YES_NO_LABELS.no : data?.ministry_interests?.join(', '),
    ),
  ];
}

export interface InfoSection {
  title: string;
  entries: InfoEntry[];
}

const NOT_ASKED_ON_FORM: (keyof MemberRecord)[] = ['addressReference', 'councilId'];
const BAPTISM_FIELDS: (keyof MemberRecord)[] = ['baptismChurch', 'baptismDate'];

function smallGroupAnswer(data: PersonSensitive | null, smallGroupNames: string[]): string | null {
  const answer = membershipCommunityEntries(data)[0];
  if (!answer.answered) return null;
  return data?.wants_small_group === 'already' && smallGroupNames.length > 0
    ? `${answer.value} — ${smallGroupNames.join(', ')}`
    : answer.value;
}

function recordSectionEntries(section: RecordSection, record: Partial<MemberRecord>, profile: MemberProfile | null) {
  if (section.summary) {
    const lines = profile ? section.summary(profile) : [];
    return [wideEntry('', lines.join(' · '))];
  }
  const skipped = record.entryType === 'baptism' ? [...NOT_ASKED_ON_FORM, ...BAPTISM_FIELDS] : NOT_ASKED_ON_FORM;
  const entries = section.fields
    .filter((field) => !skipped.includes(field.name))
    .map((field) => ({ ...entry(field.label, displayValue(record, field)), wide: field.kind === 'email' }));
  return [...entries.filter((item) => !item.wide), ...entries.filter((item) => item.wide)];
}

export function membershipSections(
  person: Person,
  data: PersonSensitive | null,
  profile: MemberProfile | null,
  smallGroupNames: string[],
): InfoSection[] {
  const [, ministryInterests] = membershipCommunityEntries(data);
  const record: Partial<MemberRecord> = {
    ...profile,
    name: person.name,
    phone: person.phone ? maskPhone(person.phone) : '',
    email: person.email ?? '',
    birthDate: data?.birth_date ?? '',
    entryType: toEntryType(person.entry_type) ?? '',
    originChurch: data?.origin_church ?? '',
  };

  const recordSections = MEMBER_RECORD_SECTIONS.filter((section) => section.id !== 'membership').map((section) => ({
    title: section.title,
    entries: recordSectionEntries(section, record, profile),
  }));

  return [
    ...recordSections,
    {
      title: SERVE_STEP_TITLE,
      entries: [
        entry(MEMBERSHIP_ANSWER_LABELS.secretSociety, data?.secret_society),
        wideEntry(MEMBERSHIP_ANSWER_LABELS.wantsSmallGroup, smallGroupAnswer(data, smallGroupNames)),
        { ...ministryInterests, wide: true },
        wideEntry(MEMBERSHIP_ANSWER_LABELS.membershipNote, data?.membership_note),
      ],
    },
  ];
}

export function makeupEntries(makeup: LessonMakeup): InfoEntry[] {
  return [
    entry('Aula', `Aula ${makeup.lessonNumber} — ${makeup.cohortName}`),
    entry('Declarou ter assistido à aula até o final', 'Sim'),
    wideEntry('Teve alguma dúvida ou algo chamou a atenção', makeup.notes),
  ];
}
