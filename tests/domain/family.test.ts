// Local
import { FAMILY_RELATIONS, relationLabel } from '../../src/domain/family';

describe('family relations', () => {
  it('keeps father and mother apart, since they are different words', () => {
    expect(relationLabel('father')).toBe('Pai');
    expect(relationLabel('mother')).toBe('Mãe');
    expect(relationLabel('son_in_law')).toBe('Genro');
    expect(relationLabel('daughter_in_law')).toBe('Nora');
    expect(relationLabel('stepmother')).toBe('Madrasta');
  });

  it('uses one option when the two forms only differ by the ending', () => {
    expect(relationLabel('child')).toBe('Filho(a)');
    expect(relationLabel('sibling')).toBe('Irmão(ã)');
    expect(relationLabel('cousin')).toBe('Primo(a)');
  });

  it('names the single options by the gender of the relative when it is known', () => {
    expect(relationLabel('child', 'male')).toBe('Filho');
    expect(relationLabel('child', 'female')).toBe('Filha');
    expect(relationLabel('uncle', 'female')).toBe('Tia');
    expect(relationLabel('sibling', null)).toBe('Irmão(ã)');
    expect(relationLabel('father', 'female')).toBe('Pai');
  });

  it('starts with the spouse and the children, then the grandparents, parents and siblings', () => {
    expect(FAMILY_RELATIONS.slice(0, 7)).toEqual([
      'spouse',
      'child',
      'grandfather',
      'grandmother',
      'father',
      'mother',
      'sibling',
    ]);
  });
});
