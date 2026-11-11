// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { NotesPanel } from '../../src/components/NotesPanel';
import { PersonNote } from '../../src/domain/personNotes';
import { updatePersonNote } from '../../src/repositories/personNotes';
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

vi.mock('../../src/repositories/personNotes', () => ({
  addPersonNote: vi.fn(),
  deletePersonNote: vi.fn(),
  updatePersonNote: vi.fn(),
}));

const note = (overrides: Partial<PersonNote>): PersonNote => ({
  id: 'n1',
  body: 'Visitante 08/11/2026\nNamorado de Josiane Batista',
  createdAt: '2026-11-09T23:38:12Z',
  authorName: 'Ana Souza',
  private: false,
  canEdit: true,
  ...overrides,
});

describe('notes panel', () => {
  it('offers editing only on the notes the user may edit', () => {
    renderScreen(<NotesPanel personId="p1" notes={[note({}), note({ id: 'n2', canEdit: false })]} />, {
      role: UserRole.IntegrationTeam,
    });

    expect(screen.getAllByRole('button', { name: 'Editar anotação' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Apagar anotação' })).toHaveLength(2);
  });

  it('saves the edited text', async () => {
    vi.mocked(updatePersonNote).mockResolvedValue();
    renderScreen(<NotesPanel personId="p1" notes={[note({})]} />, { role: UserRole.IntegrationTeam });

    await userEvent.click(screen.getByRole('button', { name: 'Editar anotação' }));
    const field = screen.getByRole('textbox');
    await userEvent.clear(field);
    await userEvent.type(field, 'Namorado de Josiane Batista');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updatePersonNote).toHaveBeenCalledWith('n1', 'Namorado de Josiane Batista');
  });
});
