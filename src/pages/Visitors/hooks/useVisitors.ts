// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { supabase } from '../../../lib/supabase';
import { buildWhatsAppLink, initialContactMessage } from '../../../domain/whatsapp';
import { comparePeopleByPipeline } from '../../../types/person';
import { loadSavedFilters, saveFilters } from '../persistence';
import {
  fetchContactAttemptDates,
  Person,
  updatePersonFields,
  VISITOR_QUEUES,
  VisitorQueue,
  visitorQueue,
  visitorReason,
} from '../../../features/visitors';

export const VISIBLE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export interface VisitorRow {
  person: Person;
  queue: VisitorQueue;
  reason: string;
}

export function useVisitors() {
  const { user } = useAuthCtx();
  const [rows, setRows] = useState<VisitorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilterState] = useState<Person['status'][]>(
    () => loadSavedFilters()?.statusFilter ?? [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ search, statusFilter });
  }, [search, statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('people').select('*').in('status', VISIBLE_STATUSES);

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    const people = (data as Person[]).sort(comparePeopleByPipeline);
    try {
      const attempts = await fetchContactAttemptDates(people.filter((p) => p.status === 'retry_contact').map((p) => p.id));
      const now = new Date();
      setRows(
        people.map((person) => ({
          person,
          queue: visitorQueue(person),
          reason: visitorReason(person, attempts[person.id] ?? [], now),
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const setStatusFilter = (value: Person['status'][]) => {
    setStatusFilterState(value);
    setPage(1);
  };

  const openWhatsApp = async (person: Person) => {
    window.open(buildWhatsAppLink(person.phone, initialContactMessage(person.name, user?.name ?? '')), '_blank');
    await updatePersonFields(person.id, { whatsapp_opened_at: new Date().toISOString() });
    await load();
  };

  const filtered = rows.filter(
    (r) =>
      (!debouncedSearch || r.person.name.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
      (statusFilter.length === 0 || statusFilter.includes(r.person.status)),
  );
  const counts = Object.fromEntries(
    VISITOR_QUEUES.map((q) => [q, filtered.filter((r) => r.queue === q).length]),
  ) as Record<VisitorQueue, number>;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return {
    rows: pageRows,
    totalCount: filtered.length,
    counts,
    loading,
    error,
    page: clampedPage,
    totalPages,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    openWhatsApp,
    reload: load,
    hasFilter: !!search.trim() || statusFilter.length > 0,
  };
}
