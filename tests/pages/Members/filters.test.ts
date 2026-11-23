// Local
import { matchesMember, NO_MEMBER_FILTERS } from '../../../src/pages/Members/filters';
import { MemberRow } from '../../../src/repositories/memberRecords';

const member = (overrides: Partial<MemberRow>): MemberRow => ({
  id: 'p1',
  name: 'Ana Souza',
  phone: null,
  entry_type: null,
  membership_status: 'active',
  photo: null,
  flags: [],
  consolidation: null,
  birthDate: null,
  gender: null,
  maritalStatus: null,
  acceptedOn: null,
  inSmallGroup: true,
  inMinistry: true,
  ...overrides,
});

const matches = (row: MemberRow, missing: ('small_group' | 'ministry')[]) =>
  matchesMember(row, { ...NO_MEMBER_FILTERS, missing }, '', '2026-11-23');

describe('members without a small group or a ministry', () => {
  it('keeps everyone when nothing is chosen', () => {
    expect(matches(member({}), [])).toBe(true);
  });

  it('keeps only who has no small group', () => {
    expect(matches(member({ inSmallGroup: false }), ['small_group'])).toBe(true);
    expect(matches(member({ inMinistry: false }), ['small_group'])).toBe(false);
  });

  it('keeps only who has no ministry', () => {
    expect(matches(member({ inMinistry: false }), ['ministry'])).toBe(true);
    expect(matches(member({ inSmallGroup: false }), ['ministry'])).toBe(false);
  });

  it('keeps who lacks either one when both are chosen', () => {
    const both: ('small_group' | 'ministry')[] = ['small_group', 'ministry'];
    expect(matches(member({ inSmallGroup: false }), both)).toBe(true);
    expect(matches(member({ inMinistry: false }), both)).toBe(true);
    expect(matches(member({}), both)).toBe(false);
  });
});

describe('members in consolidation', () => {
  const inState = (row: MemberRow, consolidation: ('in_progress' | 'overdue')[]) =>
    matchesMember(row, { ...NO_MEMBER_FILTERS, consolidation }, '', '2026-11-23');

  it('keeps everyone when nothing is chosen', () => {
    expect(inState(member({}), [])).toBe(true);
  });

  it('keeps only who is in the chosen state', () => {
    expect(inState(member({ consolidation: 'in_progress' }), ['in_progress'])).toBe(true);
    expect(inState(member({ consolidation: 'overdue' }), ['in_progress'])).toBe(false);
    expect(inState(member({ consolidation: null }), ['overdue'])).toBe(false);
  });

  it('keeps who is in either state when both are chosen', () => {
    const both: ('in_progress' | 'overdue')[] = ['in_progress', 'overdue'];
    expect(inState(member({ consolidation: 'overdue' }), both)).toBe(true);
    expect(inState(member({ consolidation: null }), both)).toBe(false);
  });
});
