// Local
import { AgeGroup, ageGroupOf, ageOn } from '../../domain/ageGroups';
import { Couple, MemberGrouping } from '../../domain/couples';
import { isRecentlyAccepted, RecentAcceptance } from '../../domain/memberAcceptance';
import { MemberFlag } from '../../domain/memberFlags';
import { Gender, MaritalStatus, MembershipStatus } from '../../domain/memberRecords';
import { matchesNameOrPhone } from '../../domain/search';
import { sameItems } from '../../lib/sameItems';
import { MemberRow } from '../../repositories/memberRecords';
import { EntryType } from '../../types/church';

export interface MemberFilters {
  status: MembershipStatus[];
  entryType: EntryType[];
  gender: Gender[];
  maritalStatus: MaritalStatus[];
  ageGroup: AgeGroup[];
  flag: MemberFlag[];
  recent: RecentAcceptance[];
}

export const NO_MEMBER_FILTERS: MemberFilters = {
  status: [],
  entryType: [],
  gender: [],
  maritalStatus: [],
  ageGroup: [],
  flag: [],
  recent: [],
};

export const DEFAULT_MEMBER_FILTERS: MemberFilters = { ...NO_MEMBER_FILTERS, status: ['active'] };

const FILTERS_BY_GROUPING: Record<MemberGrouping, (keyof MemberFilters)[]> = {
  individual: ['status', 'flag', 'recent', 'entryType', 'gender', 'maritalStatus', 'ageGroup'],
  couple: ['status', 'flag'],
};

export const filtersFor = (grouping: MemberGrouping, filters: MemberFilters): MemberFilters =>
  FILTERS_BY_GROUPING[grouping].reduce<MemberFilters>(
    (kept, key) => ({ ...kept, [key]: filters[key] }),
    NO_MEMBER_FILTERS,
  );

export const isDefaultMemberFilters = (filters: MemberFilters): boolean =>
  (Object.keys(DEFAULT_MEMBER_FILTERS) as (keyof MemberFilters)[]).every((key) =>
    sameItems(filters[key], DEFAULT_MEMBER_FILTERS[key]),
  );

export const activeFilterCountOf = (filters: MemberFilters): number =>
  Object.values(filters).filter((values) => values.length > 0).length;

const allows = <T>(chosen: T[], value: T | null) => chosen.length === 0 || (value !== null && chosen.includes(value));

export function matchesMember(member: MemberRow, filters: MemberFilters, search: string, today: string): boolean {
  return (
    matchesNameOrPhone(member, search) &&
    allows(filters.status, member.membership_status) &&
    allows(filters.entryType, member.entry_type) &&
    allows(filters.gender, member.gender) &&
    allows(filters.maritalStatus, member.maritalStatus) &&
    allows(filters.ageGroup, member.birthDate ? ageGroupOf(ageOn(member.birthDate, today)) : null) &&
    (filters.flag.length === 0 || member.flags.some((flag) => filters.flag.includes(flag))) &&
    (filters.recent.length === 0 || isRecentlyAccepted(member.acceptedOn, today))
  );
}

export function matchesCouple(couple: Couple<MemberRow>, filters: MemberFilters, search: string): boolean {
  return (
    couple.some((member) => matchesNameOrPhone(member, search)) &&
    couple.every((member) => allows(filters.status, member.membership_status)) &&
    (filters.flag.length === 0 || couple.some((member) => member.flags.some((flag) => filters.flag.includes(flag))))
  );
}
