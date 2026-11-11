// Local
import { generalDetailRows, hasPersonDetails, Person } from '../../../../src/features/visitors';

const person: Person = {
  id: 'p1',
  name: 'Felipe da Silva',
  phone: '31987228431',
  age: null,
  email: null,
  status: 'welcome_coffee',
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  statute_agreed_at: null,
  coffee_retry_used: false,
  small_group_id: null,
  origin: 'visitor',
  membership_status: null,
  visited_on: null,
  created_at: '2026-10-04T00:00:00Z',
  updated_at: '2026-10-04T00:00:00Z',
};

const emptyProfile = { coffeeDate: null, cohortName: null, smallGroupName: null, ministryNames: [] };

describe('person details', () => {
  it('has details when the visit date is known', () => {
    expect(hasPersonDetails({ ...person, visited_on: '2026-10-04' }, emptyProfile)).toBe(true);
  });

  it('has no details for a visitor with nothing recorded yet', () => {
    expect(hasPersonDetails(person, emptyProfile)).toBe(false);
  });

  it('always has details for a member', () => {
    expect(hasPersonDetails({ ...person, status: 'member' }, emptyProfile)).toBe(true);
  });

  it('leaves the community rows out when they are edited on the page', () => {
    const profile = { ...emptyProfile, smallGroupName: 'PG Centro', ministryNames: ['Louvor'] };

    expect(generalDetailRows(person, profile, true).map((row) => row.label)).toEqual(['Pequeno Grupo', 'Ministérios']);
    expect(generalDetailRows(person, profile, false)).toEqual([]);
  });
});
