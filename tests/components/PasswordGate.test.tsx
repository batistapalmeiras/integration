// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { PasswordGate } from '../../src/components/PasswordGate';
import { getMustChangePassword } from '../../src/repositories/profiles';
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

vi.mock('../../src/repositories/profiles', () => ({
  getMustChangePassword: vi.fn(),
  clearMustChangePassword: vi.fn(),
}));
vi.mock('../../src/repositories/membership', () => ({ countMembershipPending: vi.fn().mockResolvedValue(0) }));

const mustChange = vi.mocked(getMustChangePassword);

describe('PasswordGate', () => {
  it('lets the person in when no password change is pending', async () => {
    mustChange.mockResolvedValue(false);
    renderScreen(<PasswordGate>painel</PasswordGate>, { role: UserRole.Teacher });
    expect(await screen.findByText('painel')).toBeInTheDocument();
  });

  it('asks for a new password when one is required', async () => {
    mustChange.mockResolvedValue(true);
    renderScreen(<PasswordGate>painel</PasswordGate>, { role: UserRole.Teacher });
    expect(await screen.findByText('Troque sua senha')).toBeInTheDocument();
    expect(screen.queryByText('painel')).not.toBeInTheDocument();
  });

  it('blocks the app and offers a retry when the check fails', async () => {
    mustChange.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(false);
    renderScreen(<PasswordGate>painel</PasswordGate>, { role: UserRole.Teacher });
    expect(await screen.findByText('Não foi possível verificar sua conta')).toBeInTheDocument();
    expect(screen.queryByText('painel')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('painel')).toBeInTheDocument();
  });
});
