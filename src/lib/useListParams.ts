// React
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Local
import { decodePathFilters, encodePathFilters, ListFilters, PathFilter } from './pathFilters';
import { StoredValue } from './storage';
import { useDebouncedValue } from './useDebouncedValue';

export const LIST_PAGE_SIZE = 10;
const PAGE_PARAM = 'page';
const SEARCH_PARAM = 'q';

interface Options<K extends string> {
  basePath: string;
  filters: PathFilter<K>[];
  stored?: StoredValue<ListFilters<K>>;
}

interface ListState<K extends string> {
  filters: ListFilters<K>;
  search: string;
  page: number;
}

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const parsePage = (raw: string | null) => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 1 ? page : 1;
};

const pathSegments = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`)
    ? pathname.slice(basePath.length).split('/').filter(Boolean).map(decodeURIComponent)
    : [];

export const pickKeys = <K extends string>(values: string[], labels: Record<K, string>): K[] =>
  values.filter((value): value is K => Object.hasOwn(labels, value));

export const pickFrom = <T extends string>(values: string[], allowed: readonly T[]): T[] =>
  values.flatMap((value) => allowed.filter((item) => item === value));

export function useListParams<K extends string>({ basePath, filters, stored }: Options<K>) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [saved, setSaved] = useState<ListFilters<K>>(() => stored?.load() ?? {});
  const segments = pathSegments(location.pathname, basePath);
  const decoded = decodePathFilters(filters, segments);
  const fromPath = segments.length > 0;

  const filter = (key: K): string[] => (fromPath ? (decoded.values[key] ?? []) : stringList(saved[key]));
  const values: ListFilters<K> = {};
  filters.forEach(({ key }) => {
    values[key] = filter(key);
  });
  const current: ListState<K> = {
    filters: values,
    search: params.get(SEARCH_PARAM) ?? '',
    page: parsePage(params.get(PAGE_PARAM)),
  };
  const debouncedSearch = useDebouncedValue(current.search.trim());

  const write = (next: ListState<K>) => {
    const query = new URLSearchParams(params);
    query.delete(SEARCH_PARAM);
    query.delete(PAGE_PARAM);
    if (next.search) query.set(SEARCH_PARAM, next.search);
    if (next.page > 1) query.set(PAGE_PARAM, String(next.page));
    const search = query.toString();
    navigate(
      { pathname: [basePath, ...encodePathFilters(filters, next.filters)].join('/'), search: search && `?${search}` },
      { replace: true },
    );
  };

  const setFilters = (changes: ListFilters<K>) => {
    const next = { ...current.filters, ...changes };
    setSaved(next);
    stored?.save(next);
    write({ ...current, filters: next, page: 1 });
  };

  const setFilter = (key: K, chosen: string[]) => {
    const changes: ListFilters<K> = {};
    changes[key] = chosen;
    setFilters(changes);
  };

  const paginate = <T>(items: T[]) => {
    const totalPages = Math.max(1, Math.ceil(items.length / LIST_PAGE_SIZE));
    const page = Math.min(current.page, totalPages);
    return { items: items.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE), page, totalPages };
  };

  return {
    filter,
    setFilter,
    setFilters,
    unresolved: decoded.unresolved.length > 0,
    search: current.search,
    debouncedSearch,
    setSearch: (search: string) => write({ ...current, search, page: 1 }),
    page: current.page,
    setPage: (page: number) => write({ ...current, page }),
    paginate,
  };
}
