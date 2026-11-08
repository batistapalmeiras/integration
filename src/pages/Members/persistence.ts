// Local
import { MembershipStatus } from '../../domain/memberRecords';
import { storedValue } from '../../lib/storage';
import { EntryType } from '../../types/church';

interface MembersFilters {
  search: string;
  membershipStatusFilter: MembershipStatus[];
  entryTypeFilter: EntryType[];
}

export const membersFilters = storedValue<Partial<MembersFilters>>('members-filters');
