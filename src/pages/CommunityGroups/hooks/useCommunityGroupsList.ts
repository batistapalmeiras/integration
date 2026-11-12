// Local
import { CommunityGroupWithCount, GroupInput } from '../../../domain/communityGroups';
import {
  countMinistryVolunteers,
  createMinistry,
  createSmallGroup,
  listMinistriesWithCounts,
  listSmallGroupsWithCounts,
} from '../../../repositories/communityGroups';
import { errorMessage, invalidateQueries, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';

export type GroupRow = CommunityGroupWithCount;

type GroupType = 'small-groups' | 'ministries';

export function refreshGroupLists(type: GroupType): Promise<void> {
  return Promise.all([
    invalidateQueries(queryKeys.groupsWithCounts(type)),
    invalidateQueries(type === 'small-groups' ? queryKeys.smallGroups : queryKeys.ministries, { refetchActive: false }),
  ]).then(() => undefined);
}

function useGroupsList(
  type: GroupType,
  list: () => Promise<CommunityGroupWithCount[]>,
  create: (input: GroupInput) => Promise<void>,
) {
  const query = useQuery(queryKeys.groupsWithCounts(type), list);

  const add = async (input: GroupInput) => {
    await create(input);
    await refreshGroupLists(type);
  };

  return { rows: query.data ?? [], loading: query.loading, error: errorMessage(query.error), add };
}

export const useMinistriesList = () => useGroupsList('ministries', listMinistriesWithCounts, createMinistry);

export const useMinistryVolunteerCount = () => useQuery(queryKeys.ministryVolunteerCount, countMinistryVolunteers).data;

export const useSmallGroupsList = () => useGroupsList('small-groups', listSmallGroupsWithCounts, createSmallGroup);
