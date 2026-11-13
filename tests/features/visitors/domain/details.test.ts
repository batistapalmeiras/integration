// Local
import { detailTabs, Person } from '../../../../src/features/visitors';

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
  coffee_retry_used: false,
  origin: 'visitor',
  membership_status: null,
  visited_on: null,
  created_at: '2026-10-04T00:00:00Z',
  updated_at: '2026-10-04T00:00:00Z',
};

describe('detailTabs', () => {
  it('shows the form answers to the leadership once the person reached each stage', () => {
    expect(detailTabs(person, { canSeeAnswers: true, makeupCount: 0 })).toEqual([]);
    expect(detailTabs({ ...person, status: 'integration' }, { canSeeAnswers: true, makeupCount: 0 })).toEqual([
      'integration',
    ]);
    expect(detailTabs({ ...person, status: 'member' }, { canSeeAnswers: true, makeupCount: 0 })).toEqual([
      'integration',
      'membership',
    ]);
  });

  it('hides the answers from who cannot see them and shows makeups only when there are any', () => {
    expect(detailTabs({ ...person, status: 'member' }, { canSeeAnswers: false, makeupCount: 0 })).toEqual([]);
    expect(detailTabs(person, { canSeeAnswers: false, makeupCount: 2 })).toEqual(['makeup']);
  });
});
