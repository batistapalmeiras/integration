// Local
import { FAMILY_RELATIONS, relationLabel } from '../../src/domain/family';

describe('family relations', () => {
  it('keeps each relation to one person, so father and mother are two different options', () => {
    expect(relationLabel('father')).toBe('Pai');
    expect(relationLabel('mother')).toBe('Mãe');
    expect(relationLabel('son_in_law')).toBe('Genro');
    expect(relationLabel('daughter_in_law')).toBe('Nora');
    expect(relationLabel('stepmother')).toBe('Madrasta');
  });

  it('never joins two relations in one option', () => {
    for (const relation of FAMILY_RELATIONS) {
      expect(relationLabel(relation)).not.toMatch(/ ou |\(|\//);
    }
  });

  it('starts with the spouse and the children, then the grandparents, parents and siblings', () => {
    expect(FAMILY_RELATIONS.slice(0, 9)).toEqual([
      'spouse',
      'son',
      'daughter',
      'grandfather',
      'grandmother',
      'father',
      'mother',
      'brother',
      'sister',
    ]);
  });
});
