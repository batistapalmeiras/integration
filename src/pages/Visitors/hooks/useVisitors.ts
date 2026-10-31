// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { supabase } from '../../../lib/supabase';
import { buildWhatsAppLink, initialContactMessage } from '../../../domain/whatsapp';
import { comparePeopleByPipeline } from '../../../types/person';
import { loadSavedFilters, QueueFilter, saveFilters } from '../persistence';
import {
  fetchContactAttemptDates,
  Person,
  updatePersonFields,
  VISITOR_QUEUES,
  VisitorQueue,
  visitorQueue,
  visitorReason,
} from '../../../features/visitors';

const VISIBLE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];
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
  const [queue, setQueueState] = useState<QueueFilter>(() => loadSavedFilters()?.queue ?? 'all');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ search, queue });
  }, [search, queue]);

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

  const setQueue = (value: QueueFilter) => {
    setQueueState(value);
    setPage(1);
  };

  const openWhatsApp = async (person: Person) => {
    window.open(buildWhatsAppLink(person.phone, initialContactMessage(person.name, user?.name ?? '')), '_blank');
    await updatePersonFields(person.id, { whatsapp_opened_at: new Date().toISOString() });
    await load();
  };

  const searched = rows.filter(
    (r) => !debouncedSearch || r.person.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );
  const counts = Object.fromEntries(
    VISITOR_QUEUES.map((q) => [q, searched.filter((r) => r.queue === q).length]),
  ) as Record<VisitorQueue, number>;
  const filtered = queue === 'all' ? searched : searched.filter((r) => r.queue === queue);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return {
    rows: pageRows,
    totalCount: filtered.length,
    allCount: searched.length,
    counts,
    loading,
    error,
    page: clampedPage,
    totalPages,
    setPage,
    search,
    setSearch,
    queue,
    setQueue,
    openWhatsApp,
    reload: load,
    hasFilter: !!search.trim() || queue !== 'all',
  };
}
