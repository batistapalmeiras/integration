// Local
import { AGE_GROUP_NAMES } from '../../domain/ageGroups';
import { GROUPING_PATH_LABELS } from '../../domain/couples';
import { MEMBER_FLAG_LABELS } from '../../domain/memberFlags';
import { GENDER_LABELS, MARITAL_STATUS_LABELS, MEMBERSHIP_STATUS_LABELS } from '../../domain/memberRecords';
import { ListFilters, PathFilter, slugTable } from '../../lib/pathFilters';
import { storedValue } from '../../lib/storage';
import { ListView } from '../../components/ViewToggle';
import { ENTRY_TYPE_LABELS } from '../../types/church';

export type MembersFilterKey = 'grouping' | 'status' | 'entryType' | 'gender' | 'maritalStatus' | 'ageGroup' | 'flag';

export const MEMBERS_FILTERS: PathFilter<MembersFilterKey>[] = [
  { key: 'grouping', slugs: slugTable(GROUPING_PATH_LABELS) },
  { key: 'status', slugs: slugTable(MEMBERSHIP_STATUS_LABELS) },
  { key: 'entryType', slugs: slugTable(ENTRY_TYPE_LABELS) },
  { key: 'gender', slugs: slugTable(GENDER_LABELS) },
  { key: 'maritalStatus', slugs: slugTable(MARITAL_STATUS_LABELS) },
  { key: 'ageGroup', slugs: slugTable(AGE_GROUP_NAMES) },
  { key: 'flag', slugs: slugTable(MEMBER_FLAG_LABELS) },
];

export const membersFilters = storedValue<ListFilters<MembersFilterKey>>('members-list-filters');

export const membersView = storedValue<ListView>('members-list-view');
