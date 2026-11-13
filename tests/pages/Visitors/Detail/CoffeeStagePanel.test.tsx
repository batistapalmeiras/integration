// Libs
import { screen } from '@testing-library/react';
// Local
import { CoffeeStagePanel } from '../../../../src/pages/Visitors/Detail/components/CoffeeStagePanel';
import { renderScreen } from '../../../support/render';

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
  coffee_retry_used: false,
  origin: 'integration' as const,
  membership_status: null,
  visited_on: null,
  created_at: '2026-09-06T00:00:00Z',
  updated_at: '2026-09-06T00:00:00Z',
};

describe('coffee stage panel', () => {
  it('shows the coffee date and why the attendance cannot be marked yet', () => {
    renderScreen(
      <CoffeeStagePanel
        person={person}
        attendance={{ id: 'a1', attended: false, eventDate: '2999-12-06' }}
        loading={false}
        hasCohort
        onMarkAttended={vi.fn()}
        onMarkNotAttended={vi.fn()}
        onDeclined={vi.fn()}
        onNoResponse={vi.fn()}
        onClassInviteSent={vi.fn()}
      />,
    );

    expect(screen.getByText('Próximo passo')).toBeInTheDocument();
    expect(screen.getByText('Café de boas-vindas')).toBeInTheDocument();
    expect(screen.getByText('06/12/2999')).toBeInTheDocument();
    expect(screen.getByText('Aguardando participação')).toBeInTheDocument();
    expect(screen.getByText('A presença só pode ser marcada a partir do dia do café.')).toBeInTheDocument();
  });
});
