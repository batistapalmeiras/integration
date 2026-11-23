// Local
import { AGE_GROUP_NAMES } from '../../domain/ageGroups';
import { CONSOLIDATION_STATE_LABELS } from '../../domain/consolidation';
import { GROUPING_PATH_LABELS } from '../../domain/couples';
import { MEMBER_FLAG_LABELS } from '../../domain/memberFlags';
import { MISSING_COMMUNITY_LABELS } from '../../domain/missingCommunity';
import { GENDER_LABELS, MARITAL_STATUS_LABELS, MEMBERSHIP_STATUS_LABELS } from '../../domain/memberRecords';
import { encodePathFilters, ListFilters, PathFilter, slugTable } from '../../lib/pathFilters';
import { AppRoute } from '../../routes/paths';
import { storedValue } from '../../lib/storage';
import { ENTRY_TYPE_LABELS } from '../../types/church';

export type MembersFilterKey =
  | 'grouping'
  | 'status'
  | 'entryType'
  | 'gender'
  | 'maritalStatus'
  | 'ageGroup'
  | 'flag'
  | 'consolidation'
  | 'missing';

export const MEMBERS_FILTERS: PathFilter<MembersFilterKey>[] = [
  { key: 'grouping', slugs: slugTable(GROUPING_PATH_LABELS) },
  { key: 'status', slugs: slugTable(MEMBERSHIP_STATUS_LABELS) },
  { key: 'entryType', slugs: slugTable(ENTRY_TYPE_LABELS) },
  { key: 'gender', slugs: slugTable(GENDER_LABELS) },
  { key: 'maritalStatus', slugs: slugTable(MARITAL_STATUS_LABELS) },
  { key: 'ageGroup', slugs: slugTable(AGE_GROUP_NAMES) },
  { key: 'flag', slugs: slugTable(MEMBER_FLAG_LABELS) },
  { key: 'consolidation', slugs: slugTable(CONSOLIDATION_STATE_LABELS) },
  { key: 'missing', slugs: slugTable(MISSING_COMMUNITY_LABELS) },
];

export const membersPath = (filters: ListFilters<MembersFilterKey>): string =>
  [AppRoute.Members, ...encodePathFilters(MEMBERS_FILTERS, filters)].join('/');

export const membersFilters = storedValue<ListFilters<MembersFilterKey>>('members-list-filters-v2');

