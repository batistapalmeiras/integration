// React
import { useCallback, useEffect, useState } from 'react';
// Local
import {
  countPeopleInMinistry,
  countPeopleInSmallGroup,
  createMinistry,
  createSmallGroup,
  deleteMinistry,
  deleteSmallGroup,
  listMinistries,
  listSmallGroups,
  updateMinistry,
  updateSmallGroup,
} from '../../../domain/communityGroups';

export interface GroupRow {
  id: string;
  name: string;
  leaders: string[];
  peopleCount: number;
}

async function withCounts(
  groups: { id: string; name: string; leaders: string[] }[],
  countFn: (id: string) => Promise<number>,
) {
  return Promise.all(groups.map(async (g) => ({ ...g, peopleCount: await countFn(g.id) })));
}

export function useMinistriesList() {
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await withCounts(await listMinistries(), countPeopleInMinistry));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (name: string, leaders: string[]) => {
    await createMinistry(name, leaders);
    await load();
  };

  // No hosts param — ministries have no anfitriões, only PGs do. A 2-arg
  // function is still assignable to GroupTable's 3-arg onAdd/onEdit shape.
  const edit = async (id: string, name: string, leaders: string[]) => {
    await updateMinistry(id, name, leaders);
    await load();
  };

  const remove = async (id: string) => {
    await deleteMinistry(id);
    await load();
  };

  return { rows, loading, error, add, edit, remove };
}

export function useSmallGroupsList() {
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await withCounts(await listSmallGroups(), countPeopleInSmallGroup));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (name: string, leaders: string[], hosts: string[]) => {
    await createSmallGroup(name, leaders, hosts);
    await load();
  };

  const edit = async (id: string, name: string, leaders: string[], hosts: string[]) => {
    await updateSmallGroup(id, name, leaders, hosts);
    await load();
  };

  const remove = async (id: string) => {
    await deleteSmallGroup(id);
    await load();
  };

  return { rows, loading, error, add, edit, remove };
}
