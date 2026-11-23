// Local
import {
  ConsolidationItem,
  consolidationStateOf,
  overdueFirst,
  toConsolidationKind,
  toConsolidationOutcome,
} from '../../src/domain/consolidation';

const item = (overrides: Partial<ConsolidationItem>): ConsolidationItem => ({
  id: 'c1',
  personId: 'p1',
  personName: 'Ana Souza',
  kind: 'small_group',
  groupId: 'g1',
  groupName: 'Central',
  startedAt: '2026-11-01T10:00:00Z',
  dueAt: '2027-01-01T10:00:00Z',
  overdue: false,
  ...overrides,
});

describe('overdueFirst', () => {
  it('puts the ones past the deadline first, then the closest deadline', () => {
    const sorted = [
      item({ id: 'later', dueAt: '2027-03-01T10:00:00Z' }),
      item({ id: 'soon', dueAt: '2027-01-01T10:00:00Z' }),
      item({ id: 'overdue', dueAt: '2026-12-01T10:00:00Z', overdue: true }),
    ].sort(overdueFirst);

    expect(sorted.map((row) => row.id)).toEqual(['overdue', 'soon', 'later']);
  });
});

describe('consolidation values', () => {
  it('reads the kind of the group, falling back to a small group', () => {
    expect(toConsolidationKind('ministry')).toBe('ministry');
    expect(toConsolidationKind('small_group')).toBe('small_group');
    expect(toConsolidationKind(null)).toBe('small_group');
  });

  it('reads only the known outcomes', () => {
    expect(toConsolidationOutcome('redirected')).toBe('redirected');
    expect(toConsolidationOutcome('consolidated')).toBe('consolidated');
    expect(toConsolidationOutcome('other')).toBeNull();
    expect(toConsolidationOutcome(null)).toBeNull();
  });

  it('turns the overdue flag into a state', () => {
    expect(consolidationStateOf(true)).toBe('overdue');
    expect(consolidationStateOf(false)).toBe('in_progress');
  });
});
