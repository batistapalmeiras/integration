// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { GroupChecklistModal } from '../../../src/pages/MemberProfile/components/GroupChecklistModal';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

const groups = [
  { id: 'pg-1', name: 'Phil e Pedro', roles: [] },
  { id: 'pg-2', name: 'Marcos', roles: [] },
];

const renderModal = (selected: string[], onSave = vi.fn().mockResolvedValue(undefined), close = vi.fn()) => {
  renderScreen(
    <GroupChecklistModal
      title="Pequenos Grupos"
      emptyText="Nenhum Pequeno Grupo cadastrado."
      searchPlaceholder="Buscar pelo Pequeno Grupo…"
      groups={groups}
      selected={selected}
      onSave={onSave}
      close={close}
    />,
    { role: UserRole.GeneralAdmin },
  );
  return { onSave, close };
};

describe('group checklist modal', () => {
  it('lists every group with the member ones checked', () => {
    renderModal(['pg-1']);
    expect(screen.getByRole('checkbox', { name: 'Phil e Pedro' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Marcos' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('saves the checked groups and closes', async () => {
    const { onSave, close } = renderModal(['pg-1']);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Marcos' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Phil e Pedro' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(['pg-2']);
    expect(close).toHaveBeenCalled();
  });

  it('starts on the search and filters by name, ignoring accents', async () => {
    renderModal([]);
    const search = screen.getByPlaceholderText('Buscar pelo Pequeno Grupo…');
    expect(search).toHaveFocus();

    await userEvent.type(search, 'marcos');

    expect(screen.getByRole('checkbox', { name: 'Marcos' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Phil e Pedro' })).not.toBeInTheDocument();
  });

  it('keeps hidden choices when the search changes', async () => {
    const { onSave } = renderModal(['pg-1']);

    await userEvent.type(screen.getByPlaceholderText('Buscar pelo Pequeno Grupo…'), 'marcos');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Marcos' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(['pg-1', 'pg-2']);
  });

  it('shows the member roles next to the group names', () => {
    renderScreen(
      <GroupChecklistModal
        title="Pequenos Grupos"
        emptyText="Nenhum Pequeno Grupo cadastrado."
        searchPlaceholder="Buscar pelo Pequeno Grupo…"
        groups={[{ id: 'pg-1', name: 'Phil e Pedro', roles: ['Líder', 'Anfitrião'] }]}
        selected={['pg-1']}
        onSave={vi.fn()}
        close={vi.fn()}
      />,
      { role: UserRole.GeneralAdmin },
    );

    expect(screen.getByText('Líder')).toBeInTheDocument();
    expect(screen.getByText('Anfitrião')).toBeInTheDocument();
  });
});
