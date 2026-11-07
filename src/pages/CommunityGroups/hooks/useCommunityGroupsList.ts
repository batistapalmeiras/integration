// Local
import {
  CommunityGroupWithCount,
  createMinistry,
  createSmallGroup,
  deleteMinistry,
  deleteSmallGroup,
  listMinistriesWithCounts,
  listSmallGroupsWithCounts,
  updateMinistry,
  updateSmallGroup,
} from '../../../domain/communityGroups';
import { errorMessage, invalidateQueries, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';

export type GroupRow = Pick<CommunityGroupWithCount, 'id' | 'name' | 'leaders' | 'peopleCount'>;

type GroupType = 'small-groups' | 'ministries';

export function refreshGroupLists(type: GroupType): Promise<void> {
  return Promise.all([
    invalidateQueries(queryKeys.groupsWithCounts(type)),
    invalidateQueries(type === 'small-groups' ? queryKeys.smallGroups : queryKeys.ministries, { refetchActive: false }),
  ]).then(() => undefined);
}

function useGroupsList(type: GroupType, list: () => Promise<CommunityGroupWithCount[]>) {
  const query = useQuery(queryKeys.groupsWithCounts(type), list);
  const afterChange = () => refreshGroupLists(type);
  return { rows: (query.data ?? []) as GroupRow[], loading: query.loading, error: errorMessage(query.error), afterChange };
}

export function useMinistriesList() {
  const { afterChange, ...state } = useGroupsList('ministries', listMinistriesWithCounts);

  const add = async (name: string, leaders: string[]) => {
    await createMinistry(name, leaders);
    await afterChange();
  };

  const edit = async (id: string, name: string, leaders: string[]) => {
    await updateMinistry(id, name, leaders);
    await afterChange();
  };

  const remove = async (id: string) => {
    await deleteMinistry(id);
    await afterChange();
  };

  return { ...state, add, edit, remove };
}

export function useSmallGroupsList() {
  const { afterChange, ...state } = useGroupsList('small-groups', listSmallGroupsWithCounts);

  const add = async (name: string, leaders: string[], hosts: string[]) => {
    await createSmallGroup(name, leaders, hosts);
    await afterChange();
  };

  const edit = async (id: string, name: string, leaders: string[], hosts: string[]) => {
    await updateSmallGroup(id, name, leaders, hosts);
    await afterChange();
  };

  const remove = async (id: string) => {
    await deleteSmallGroup(id);
    await afterChange();
  };

  return { ...state, add, edit, remove };
}
