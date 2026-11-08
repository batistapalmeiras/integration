// Local
import { storedValue } from '../../src/lib/storage';

describe('storedValue', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('saves, loads and clears a JSON value', () => {
    const store = storedValue<{ search: string }>('filters');
    expect(store.load()).toBeNull();
    store.save({ search: 'ana' });
    expect(store.load()).toEqual({ search: 'ana' });
    store.clear();
    expect(store.load()).toBeNull();
  });

  it('keeps session values apart from local ones', () => {
    storedValue<number>('step', 'session').save(2);
    expect(storedValue<number>('step').load()).toBeNull();
    expect(storedValue<number>('step', 'session').load()).toBe(2);
  });

  it('returns null for a corrupted value instead of throwing', () => {
    localStorage.setItem('filters', '{not json');
    expect(storedValue('filters').load()).toBeNull();
  });
});
