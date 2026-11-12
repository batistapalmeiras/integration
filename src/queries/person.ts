// Local
import { getPersonSensitive } from '../repositories/personSensitive';
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { listMemberBirthdays } from '../repositories/birthdays';
import { getPersonLessonMakeups } from '../repositories/lessonMakeups';
import { getFamily } from '../repositories/family';
import { getMemberPage, getMemberProfile } from '../repositories/memberRecords';
import { listMembershipAlerts } from '../repositories/membership';
import { listPersonNotes } from '../repositories/personNotes';
import { fetchPersonProfileSummary } from '../repositories/people';

export const usePersonSensitive = (personId: string, enabled = true) =>
  useQuery(queryKeys.personSensitive(personId), () => getPersonSensitive(personId), { enabled: enabled && !!personId });

export const useMemberBirthdays = () => useQuery(queryKeys.memberBirthdays, listMemberBirthdays);

export const usePersonMakeups = (personId: string, enabled = true) =>
  useQuery(queryKeys.personMakeups(personId), () => getPersonLessonMakeups(personId), {
    enabled: enabled && !!personId,
  });

export const useMemberPage = (personId: string) =>
  useQuery(queryKeys.memberPage(personId), () => getMemberPage(personId), { enabled: !!personId });

export const useMemberProfile = (personId: string, enabled = true) =>
  useQuery(queryKeys.memberProfile(personId), () => getMemberProfile(personId), { enabled: enabled && !!personId });

export const usePersonNotes = (personId: string) =>
  useQuery(queryKeys.personNotes(personId), () => listPersonNotes(personId), { enabled: !!personId });

export const useMembershipAlerts = (personId: string) =>
  useQuery(queryKeys.membershipAlerts(personId), () => listMembershipAlerts([personId]), { enabled: !!personId });

export const usePersonProfileSummary = (personId: string) =>
  useQuery(queryKeys.personProfile(personId), () => fetchPersonProfileSummary(personId), { enabled: !!personId });

export const useFamily = (personId: string) =>
  useQuery(queryKeys.personFamily(personId), () => getFamily(personId), { enabled: !!personId });

