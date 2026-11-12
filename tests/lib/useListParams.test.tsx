// React
import { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
// Libs
import { act, renderHook } from '@testing-library/react';
// Local
import { ListFilters, PathFilter, slugTable } from '../../src/lib/pathFilters';
import { storedValue } from '../../src/lib/storage';
import { pickFrom, pickKeys, useListParams } from '../../src/lib/useListParams';

type Key = 'status' | 'kind';

const FILTERS: PathFilter<Key>[] = [
  { key: 'status', slugs: slugTable({ active: 'Ativo', inactive: 'Inativo' }) },
  { key: 'kind', slugs: slugTable({ baptism: 'Batismo' }) },
];

const store = storedValue<ListFilters<Key>>('test-list-filters');

function renderList(route = '/lista') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => ({ list: useListParams({ basePath: '/lista', filters: FILTERS, stored: store }), location: useLocation() }),
    { wrapper },
  );
}

const items = Array.from({ length: 25 }, (_, index) => index);

describe('useListParams', () => {
  beforeEach(() => localStorage.clear());

  it('starts from the saved filters when the path has none', () => {
    store.save({ status: ['inactive'] });
    const { result } = renderList();
    expect(result.current.list.filter('status')).toEqual(['inactive']);
    expect(result.current.list.search).toBe('');
  });

  it('prefers the filters in the path over the saved ones', () => {
    store.save({ status: ['inactive'] });
    const { result } = renderList('/lista/ativo/batismo?q=ana&page=2');
    expect(result.current.list.filter('status')).toEqual(['active']);
    expect(result.current.list.filter('kind')).toEqual(['baptism']);
    expect(result.current.list.search).toBe('ana');
    expect(result.current.list.paginate(items)).toEqual({ items: items.slice(10, 20), page: 2, totalPages: 3 });
  });

  it('writes filters to the path and storage and goes back to the first page', () => {
    const { result } = renderList('/lista?page=3&tab=people');
    act(() => result.current.list.setFilters({ status: ['inactive', 'active'], kind: ['baptism'] }));
    expect(result.current.location.pathname).toBe('/lista/ativo-inativo/batismo');
    expect(result.current.location.search).toBe('?tab=people');
    expect(store.load()).toEqual({ status: ['inactive', 'active'], kind: ['baptism'] });
  });

  it('keeps the search in the query and out of storage', () => {
    const { result } = renderList('/lista/ativo');
    act(() => result.current.list.setSearch('ana'));
    expect(result.current.location.pathname).toBe('/lista/ativo');
    expect(result.current.location.search).toBe('?q=ana');
    expect(store.load()).toBeNull();
  });

  it('keeps the page in the query and stays within the last one', () => {
    const { result } = renderList();
    act(() => result.current.list.setPage(3));
    expect(result.current.location.search).toBe('?page=3');
    expect(result.current.list.paginate(items)).toEqual({ items: items.slice(20), page: 3, totalPages: 3 });
    expect(result.current.list.paginate(items.slice(0, 5))).toEqual({ items: items.slice(0, 5), page: 1, totalPages: 1 });
  });

  it('flags path segments that no filter recognises', () => {
    const { result } = renderList('/lista/turma-1');
    expect(result.current.list.unresolved).toBe(true);
    expect(result.current.list.filter('status')).toEqual([]);
  });

  it('ignores unknown values', () => {
    expect(pickKeys(['active', 'x'], { active: 'Ativo' })).toEqual(['active']);
    expect(pickFrom(['queue', 'x'], ['queue', 'archived'] as const)).toEqual(['queue']);
  });
});
