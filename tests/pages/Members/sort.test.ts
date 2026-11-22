// Local
import { isMemberSort, sortByName } from '../../../src/pages/Members/sort';

const people = [{ name: 'Érica' }, { name: 'Bruno' }, { name: 'Ana' }, { name: 'Álvaro' }];

describe('member sort', () => {
  it('sorts by name, ignoring the accents like the portuguese alphabet does', () => {
    expect(sortByName(people, (person) => person.name, 'name_asc').map((person) => person.name)).toEqual([
      'Álvaro',
      'Ana',
      'Bruno',
      'Érica',
    ]);
  });

  it('reverses the order and leaves the original list alone', () => {
    const sorted = sortByName(people, (person) => person.name, 'name_desc');

    expect(sorted.map((person) => person.name)).toEqual(['Érica', 'Bruno', 'Ana', 'Álvaro']);
    expect(people[0].name).toBe('Érica');
  });

  it('only accepts the known options', () => {
    expect(isMemberSort('name_asc')).toBe(true);
    expect(isMemberSort('age')).toBe(false);
    expect(isMemberSort(null)).toBe(false);
  });
});
