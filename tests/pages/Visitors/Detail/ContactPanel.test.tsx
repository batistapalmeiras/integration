// Libs
import { screen } from '@testing-library/react';
// Local
import { ContactPanel } from '../../../../src/pages/Visitors/Detail/components/ContactPanel';
import { renderScreen } from '../../../support/render';

const person = {
  id: 'p1',
  name: 'Felipe da Silva',
  phone: '31987228431',
  age: 38,
  email: null,
  status: 'welcome_coffee' as const,
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  coffee_retry_used: false,
  origin: 'integration' as const,
  membership_status: null,
  visited_on: null,
  created_at: '2026-09-06T00:00:00Z',
  updated_at: '2026-09-06T00:00:00Z',
};

describe('contact panel', () => {
  it('shows only the contact data that was filled in', () => {
    renderScreen(<ContactPanel person={person} onEdit={vi.fn()} />);

    expect(screen.getByText('Celular')).toBeInTheDocument();
    expect(screen.getByText('38 anos')).toBeInTheDocument();
    expect(screen.queryByText('E-mail')).not.toBeInTheDocument();
  });

  it('shows the e-mail once there is one', () => {
    renderScreen(<ContactPanel person={{ ...person, email: 'felipe@example.com' }} onEdit={vi.fn()} />);

    expect(screen.getByText('felipe@example.com')).toBeInTheDocument();
  });
});
