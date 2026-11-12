// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { clearQueries } from '../../../../src/lib/queryCache';
import { VisitHistory } from '../../../../src/pages/Visitors/Detail/components/VisitHistory';
import { EMPTY_PROFILE, listStatusHistory } from '../../../../src/repositories/people';
import { renderScreen } from '../../../support/render';

vi.mock('../../../../src/repositories/people', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../src/repositories/people')>()),
  listStatusHistory: vi.fn(),
}));

const person = {
  id: 'p1',
  name: 'Felipe da Silva',
  phone: '31999990000',
  age: null,
  email: null,
  status: 'welcome_coffee' as const,
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  statute_agreed_at: null,
  coffee_retry_used: false,
  origin: 'integration' as const,
  membership_status: null,
  visited_on: '2026-10-04',
  created_at: '2026-09-06T00:00:00Z',
  updated_at: '2026-09-06T00:00:00Z',
};

const change = (toStatus: string, day: number, authorName: string | null) => ({
  fromStatus: 'initial_contact',
  toStatus,
  note: null,
  changedAt: `2026-10-${String(day).padStart(2, '0')}T15:00:00Z`,
  authorName,
});

describe('visit history', () => {
  afterEach(() => clearQueries());

  it('shows the first three events, a gap and the latest one, and opens the full history with who did what', async () => {
    vi.mocked(listStatusHistory).mockResolvedValue([
      change('retry_contact', 5, 'Ana Souza'),
      change('welcome_coffee', 6, 'Ana Souza'),
      change('pending_signup', 7, null),
      change('archived', 8, 'Bruno Lima Souza'),
      change('retry_contact', 9, null),
    ]);
    renderScreen(<VisitHistory person={person} profile={EMPTY_PROFILE} />);

    await screen.findByText('Ver histórico completo');

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByText('Bruno')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Ver histórico completo'));

    expect(await screen.findByText('Bruno')).toBeInTheDocument();
    expect(screen.getAllByText('Sistema')).toHaveLength(2);
  });
});
