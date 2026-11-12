// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { ContactStagePanel } from '../../../../src/pages/Visitors/Detail/components/ContactStagePanel';
import { renderScreen } from '../../../support/render';

const person = {
  id: 'p1',
  name: 'Gabriela Santos',
  phone: '31999990000',
  age: null,
  email: null,
  status: 'initial_contact' as const,
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  statute_agreed_at: null,
  coffee_retry_used: false,
  origin: 'integration' as const,
  membership_status: null,
  visited_on: null,
  created_at: '2026-09-06T00:00:00Z',
  updated_at: '2026-09-06T00:00:00Z',
};

describe('contact stage panel', () => {
  it('swaps the WhatsApp message for the result form and lets the volunteer go back', async () => {
    renderScreen(
      <ContactStagePanel
        person={person}
        volunteerName="Ana"
        hasCoffeeEvent
        onRegisterContact={vi.fn()}
        onWhatsAppOpened={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Abrir WhatsApp/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Já fiz contato de outra forma/ }));

    expect(screen.queryByRole('button', { name: /Abrir WhatsApp/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByRole('button', { name: /Abrir WhatsApp/ })).toBeInTheDocument();
  });
});
