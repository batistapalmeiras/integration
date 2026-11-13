// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { Person } from '../../../../src/features/visitors';
import { useVisitorMenu } from '../../../../src/pages/Visitors/Detail/components/useVisitorMenu';
import { UserRole } from '../../../../src/types/enums';
import { renderScreen } from '../../../support/render';

const person: Person = {
  id: 'p1',
  name: 'Gabriela Santos',
  phone: '31999990000',
  age: null,
  email: null,
  status: 'initial_contact',
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

function Harness({ canManage, status = 'initial_contact' }: { canManage: boolean; status?: Person['status'] }) {
  const menu = useVisitorMenu({
    person: { ...person, status },
    canManage,
    onSave: vi.fn(),
    onArchive: vi.fn(),
    onReactivate: vi.fn(),
    onDelete: vi.fn(),
  });
  return (
    <>
      <button onClick={menu.openMenu}>menu</button>
      {menu.overlays}
    </>
  );
}

describe('visitor menu', () => {
  it('lists edit, archive and delete for who manages a visitor still in the first contact', async () => {
    renderScreen(<Harness canManage />, { role: UserRole.Pastor });

    await userEvent.click(screen.getByText('menu'));

    expect(screen.getByRole('button', { name: /Editar dados/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Arquivar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Excluir cadastro/ })).toBeInTheDocument();
  });

  it('opens the form inside the modal and lets the user go back to the menu', async () => {
    renderScreen(<Harness canManage />, { role: UserRole.Pastor });

    await userEvent.click(screen.getByText('menu'));
    await userEvent.click(screen.getByRole('button', { name: /Editar dados/ }));

    expect(screen.getByRole('button', { name: /Salvar alterações/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByRole('button', { name: /Arquivar/ })).toBeInTheDocument();
  });

  it('shows only the edit option to who cannot manage', async () => {
    renderScreen(<Harness canManage={false} />, { role: UserRole.Teacher });

    await userEvent.click(screen.getByText('menu'));

    expect(screen.getByRole('button', { name: /Editar dados/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Arquivar/ })).not.toBeInTheDocument();
  });

  it('offers to reactivate an archived visitor instead of archiving again', async () => {
    renderScreen(<Harness canManage status="archived" />, { role: UserRole.Pastor });

    await userEvent.click(screen.getByText('menu'));

    expect(screen.getByRole('button', { name: /Reativar/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Arquivar/ })).not.toBeInTheDocument();
  });
});
