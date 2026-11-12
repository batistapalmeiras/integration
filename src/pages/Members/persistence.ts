// Local
import { MEMBERSHIP_STATUS_LABELS } from '../../domain/memberRecords';
import { ListFilters, PathFilter, slugTable } from '../../lib/pathFilters';
import { storedValue } from '../../lib/storage';
import { ENTRY_TYPE_LABELS } from '../../types/church';

export type MembersFilterKey = 'status' | 'entryType';

export const MEMBERS_FILTERS: PathFilter<MembersFilterKey>[] = [
  { key: 'status', slugs: slugTable(MEMBERSHIP_STATUS_LABELS) },
  { key: 'entryType', slugs: slugTable(ENTRY_TYPE_LABELS) },
];

export const membersFilters = storedValue<ListFilters<MembersFilterKey>>('members-list-filters');
