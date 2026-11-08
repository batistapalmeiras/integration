// Libs
import { renderHook, waitFor } from '@testing-library/react';
// Local
import { clearQueries, fetchQuery, invalidateQueries, setQueryData, useQuery } from '../../src/lib/queryCache';

describe('queryCache', () => {
  afterEach(() => clearQueries());

  it('shares one request between callers asking for the same key at the same time', async () => {
    const fetcher = vi.fn().mockResolvedValue(['a']);
    const [first, second] = await Promise.all([fetchQuery(['people', 'x'], fetcher), fetchQuery(['people', 'x'], fetcher)]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it('does not refetch queries nobody is showing when they are invalidated', async () => {
    const people = vi.fn().mockResolvedValue(1);
    const volunteers = vi.fn().mockResolvedValue(2);
    await fetchQuery(['people', 'count'], people);
    await fetchQuery(['volunteers', 'list'], volunteers);

    await invalidateQueries(['people']);

    expect(people).toHaveBeenCalledTimes(1);
    expect(volunteers).toHaveBeenCalledTimes(1);
  });

  it('serves a remounted screen from the cache instead of fetching again', async () => {
    const fetcher = vi.fn().mockResolvedValue({ name: 'Ana' });
    const first = renderHook(() => useQuery(['person', '1'], fetcher));
    await waitFor(() => expect(first.result.current.data).toEqual({ name: 'Ana' }));
    first.unmount();

    setQueryData(['person', '1'], { name: 'Ana Maria' });
    const second = renderHook(() => useQuery(['person', '1'], fetcher));

    expect(second.result.current.data).toEqual({ name: 'Ana Maria' });
    expect(second.result.current.loading).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('fetches again on mount once a write marked the data stale', async () => {
    const fetcher = vi.fn().mockResolvedValue(3);
    await fetchQuery(['people', 'visitors'], fetcher);
    await invalidateQueries(['people'], { refetchActive: false });

    renderHook(() => useQuery(['people', 'visitors'], fetcher));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });
});
