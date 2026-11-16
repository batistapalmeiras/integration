// Local
import { ageGroupLabel, ageGroupOf, ageOn } from '../../src/domain/ageGroups';

describe('age groups', () => {
  it('counts the age only after the birthday has passed this year', () => {
    expect(ageOn('2000-11-20', '2026-11-16')).toBe(25);
    expect(ageOn('2000-11-16', '2026-11-16')).toBe(26);
  });

  it('puts each age in its group, edges included', () => {
    expect([0, 11, 12, 17, 18, 29, 30, 59, 60, 95].map(ageGroupOf)).toEqual([
      'children',
      'children',
      'teens',
      'teens',
      'youth',
      'youth',
      'adults',
      'adults',
      'seniors',
      'seniors',
    ]);
  });

  it('names each group with its ages', () => {
    expect(ageGroupLabel('children')).toBe('Crianças (até 11)');
    expect(ageGroupLabel('youth')).toBe('Jovens (18 a 29)');
    expect(ageGroupLabel('seniors')).toBe('Idosos (60 ou mais)');
  });
});
