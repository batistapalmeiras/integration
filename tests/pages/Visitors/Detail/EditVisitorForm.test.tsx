// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { EditVisitorForm } from '../../../../src/pages/Visitors/Detail/components/EditVisitorForm';
import { UserRole } from '../../../../src/types/enums';
import { renderScreen } from '../../../support/render';

const person = {
  id: 'p1',
  name: 'Gabriela Santos',
  phone: '31999990000',
  age: 30,
  email: null,
  status: 'initial_contact' as const,
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  coffee_retry_used: false,
  origin: 'integration',
  membership_status: null,
  visited_on: null,
  created_at: '2026-09-06T00:00:00Z',
  updated_at: '2026-09-06T00:00:00Z',
};

describe('edit visitor form', () => {
  it('only lets the user save after something changed, so no empty edit is logged', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderScreen(<EditVisitorForm person={person} onSave={onSave} onBack={vi.fn()} />, { role: UserRole.Pastor });

    const save = screen.getByRole('button', { name: /Salvar alterações/ });
    expect(save).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('Idade'), '1');

    expect(save).toBeEnabled();

    await userEvent.type(screen.getByPlaceholderText('Idade'), '{backspace}');

    expect(save).toBeDisabled();
  });
});
