// Local
import { getPersonSensitive } from '../repositories/personSensitive';
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { listMemberBirthdays } from '../repositories/birthdays';
import { getPersonLessonMakeups } from '../repositories/lessonMakeups';
import { getFamily } from '../repositories/family';
import { getMemberPage, getPersonRecords } from '../repositories/memberRecords';
import { listMembershipAlerts } from '../repositories/membership';
import { listPersonNotes } from '../repositories/personNotes';
import { listMemberEvents } from '../repositories/memberEvents';
import { listStatusHistory } from '../repositories/people';

export const usePersonSensitive = (personId: string, enabled = true) =>
  useQuery(queryKeys.personSensitive(personId), () => getPersonSensitive(personId), { enabled: enabled && !!personId });

export const useMemberBirthdays = () => useQuery(queryKeys.memberBirthdays, listMemberBirthdays);

export const usePersonMakeups = (personId: string, enabled = true) =>
  useQuery(queryKeys.personMakeups(personId), () => getPersonLessonMakeups(personId), {
    enabled: enabled && !!personId,
  });

export const useMemberPage = (personId: string) =>
  useQuery(queryKeys.memberPage(personId), () => getMemberPage(personId), { enabled: !!personId });

export const usePersonRecords = (personId: string, enabled = true) =>
  useQuery(queryKeys.personRecords(personId), () => getPersonRecords(personId), { enabled: enabled && !!personId });

export const usePersonNotes = (personId: string) =>
  useQuery(queryKeys.personNotes(personId), () => listPersonNotes(personId), { enabled: !!personId });

export const usePersonHistory = (personId: string) =>
  useQuery(queryKeys.personHistory(personId), () => listStatusHistory(personId), { enabled: !!personId });

export const useMemberEvents = (personId: string) =>
  useQuery(queryKeys.memberEvents(personId), () => listMemberEvents(personId), { enabled: !!personId });

export const useMembershipAlerts = (personId: string) =>
  useQuery(queryKeys.membershipAlerts(personId), () => listMembershipAlerts([personId]), { enabled: !!personId });


export const useFamily = (personId: string) =>
  useQuery(queryKeys.personFamily(personId), () => getFamily(personId), { enabled: !!personId });

