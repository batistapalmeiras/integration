// Local
import { getPersonSensitive } from '../repositories/personSensitive';
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { listMemberBirthdays } from '../repositories/birthdays';
import { getPersonLessonMakeups } from '../repositories/lessonMakeups';
import { getFamily } from '../repositories/family';
import { getMemberRecord, getMemberRecordInfo } from '../repositories/memberRecords';
import { listMembershipAlerts } from '../repositories/membership';
import { listPastoralNotes } from '../repositories/pastoralNotes';
import { fetchPersonProfileSummary } from '../repositories/people';

export const usePersonSensitive = (personId: string, enabled = true) =>
  useQuery(queryKeys.personSensitive(personId), () => getPersonSensitive(personId), { enabled: enabled && !!personId });

export const useMemberBirthdays = () => useQuery(queryKeys.memberBirthdays, listMemberBirthdays);

export const usePersonMakeups = (personId: string, enabled = true) =>
  useQuery(queryKeys.personMakeups(personId), () => getPersonLessonMakeups(personId), {
    enabled: enabled && !!personId,
  });

export const useMemberRecord = (personId: string) =>
  useQuery(queryKeys.memberRecord(personId), () => getMemberRecord(personId), { enabled: !!personId });

export const usePastoralNotes = (personId: string) =>
  useQuery(queryKeys.pastoralNotes(personId), () => listPastoralNotes(personId), { enabled: !!personId });

export const useMembershipAlerts = (personId: string) =>
  useQuery(queryKeys.membershipAlerts(personId), () => listMembershipAlerts([personId]), { enabled: !!personId });

export const usePersonProfileSummary = (personId: string) =>
  useQuery(queryKeys.personProfile(personId), () => fetchPersonProfileSummary(personId), { enabled: !!personId });

export const useFamily = (personId: string) =>
  useQuery(queryKeys.personFamily(personId), () => getFamily(personId), { enabled: !!personId });

export const useMemberRecordInfo = (personId: string) =>
  useQuery(queryKeys.memberRecordInfo(personId), () => getMemberRecordInfo(personId), { enabled: !!personId });
