// Local
import { coupleChildrenStatus, pairCouples, parentIdsOf } from '../../src/domain/couples';
import { FamilyTraits } from '../../src/domain/family';
import { Gender } from '../../src/domain/memberRecords';

const traitsOf = (entries: Record<string, Partial<FamilyTraits>>): Record<string, FamilyTraits> =>
  Object.fromEntries(
    Object.entries(entries).map(([id, entry]) => [
      id,
      { gender: null, spouseId: null, fatherId: null, motherId: null, ...entry },
    ]),
  );

const person = (id: string, name: string, gender: Gender) => ({ id, name, gender });

describe('couples', () => {
  const ana = person('a', 'Ana', 'female');
  const bruno = person('b', 'Bruno', 'male');
  const carla = person('c', 'Carla', 'female');

  it('pairs each couple once, husband first', () => {
    const traits = traitsOf({ a: { spouseId: 'b' }, b: { spouseId: 'a' } });

    expect(pairCouples([ana, bruno, carla], traits)).toEqual([[bruno, ana]]);
  });

  it('leaves out a spouse who is not in the list', () => {
    const traits = traitsOf({ c: { spouseId: 'z' } });

    expect(pairCouples([ana, carla], traits)).toEqual([]);
  });

  it('counts the children of either spouse', () => {
    const parents = parentIdsOf(traitsOf({ d: { motherId: 'a' } }));

    expect(coupleChildrenStatus([bruno, ana], parents)).toBe('with');
    expect(coupleChildrenStatus([bruno, carla], parents)).toBe('without');
  });
});
