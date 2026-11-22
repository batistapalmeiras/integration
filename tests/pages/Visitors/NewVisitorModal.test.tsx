// Libs
import { text } from 'bp-kit';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { PHONE_PLACEHOLDER } from '../../../src/domain/text';
import { NewVisitorModal } from '../../../src/pages/Visitors/New/NewVisitorModal';
import { createVisitor, findPersonByPhone } from '../../../src/repositories/people';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/people', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/people')>()),
  createVisitor: vi.fn(),
  findPersonByPhone: vi.fn(),
}));

describe('new visitor modal', () => {
  beforeEach(() => {
    vi.mocked(createVisitor).mockReset().mockResolvedValue(undefined);
    vi.mocked(findPersonByPhone).mockReset().mockResolvedValue(null);
  });

  it('saves the visitor and closes', async () => {
    const close = vi.fn();
    renderScreen(<NewVisitorModal close={close} />, { role: UserRole.IntegrationTeam });

    await userEvent.type(screen.getByPlaceholderText(PHONE_PLACEHOLDER), '31988887777');
    await userEvent.type(screen.getByPlaceholderText(text.fields.fullName), 'Ana Souza');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(createVisitor).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana Souza', phone: '31988887777' }));
  });

  it('closes without saving from the close button', async () => {
    const close = vi.fn();
    renderScreen(<NewVisitorModal close={close} />, { role: UserRole.IntegrationTeam });

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(close).toHaveBeenCalled();
    expect(createVisitor).not.toHaveBeenCalled();
  });
});
