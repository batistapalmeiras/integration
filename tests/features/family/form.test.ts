// Local
import { familyFormValues } from '../../../src/features/family/form';

describe('family form values', () => {
  it('keeps only the links the pastor registered and leaves out the ones the system works out', () => {
    const values = familyFormValues([
      { id: 'a', name: 'Brenda', relation: 'spouse', gender: 'female', derived: false },
      { id: 'b', name: 'Larissa', relation: 'sibling_in_law', gender: 'female', derived: true },
    ]);

    expect(values.links).toEqual([{ relativeId: 'a', relation: 'spouse' }]);
    expect(values.hidden).toEqual([]);
  });
});
