// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { suggestFamily } from '../../../src/repositories/family';
import { FamilyModal } from '../../../src/pages/MemberProfile/components/FamilyModal';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/queries/person', () => ({
  useFamilyTraits: () => ({ data: { m1: { gender: 'male', spouseId: null, fatherId: null, motherId: null } } }),
}));

vi.mock('../../../src/queries/memberPhotos', () => ({ useRelativePhotoUrls: () => ({}) }));

vi.mock('../../../src/repositories/family', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/family')>()),
  suggestFamily: vi.fn(),
}));

vi.mock('../../../src/queries/reference', () => ({
  useMemberNames: () => ({ data: [{ id: 'm1', name: 'Pedro Souza' }] }),
}));

describe('family modal', () => {
  it('opens straight on the relation and the member when the member has no family yet', () => {
    renderScreen(<FamilyModal personId="p1" family={[]} close={vi.fn()} />, {
      role: UserRole.GeneralAdmin,
    });

    expect(screen.getByText('Selecione o parentesco')).toBeInTheDocument();
    expect(screen.getByText('Membro')).toBeInTheDocument();
  });

  it('lists the family and only offers to add another when there already is one', () => {
    renderScreen(
      <FamilyModal
        personId="p1"
        family={[{ id: 'm1', name: 'Pedro Souza', relation: 'child', gender: 'male', derived: false }]}
        close={vi.fn()}
      />,
      { role: UserRole.GeneralAdmin },
    );

    expect(screen.getByText('Filho: Pedro Souza')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar outro familiar/ })).toBeInTheDocument();
    expect(screen.queryByText('Selecione o parentesco')).not.toBeInTheDocument();
  });

  it('lets the general admin remove a relation the system works out, the same way as any other', async () => {
    renderScreen(
      <FamilyModal
        personId="p1"
        family={[{ id: 'g1', name: 'Gabrielle Soares', relation: 'grandchild', gender: 'female', derived: true }]}
        close={vi.fn()}
      />,
      { role: UserRole.GeneralAdmin },
    );

    expect(screen.getByText('Neta: Gabrielle Soares')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remover Gabrielle Soares' }));

    expect(screen.queryByText('Neta: Gabrielle Soares')).not.toBeInTheDocument();
  });

  it('shows the whole family of a relative as soon as the relation is chosen, ready to be edited', async () => {
    vi.mocked(suggestFamily).mockResolvedValue([
      { id: 'm1', name: 'Pedro Souza', relation: 'sibling', gender: 'male', derived: false },
      { id: 'f1', name: 'Carlos Souza', relation: 'father', gender: 'male', derived: false },
      { id: 'g1', name: 'Joel Souza', relation: 'grandfather', gender: 'male', derived: true },
    ]);
    renderScreen(<FamilyModal personId="p1" family={[]} close={vi.fn()} />, { role: UserRole.GeneralAdmin });

    const relation = screen.getAllByRole('combobox').find((el) => el.textContent?.includes('Selecione o parentesco'));
    await userEvent.selectOptions(relation as HTMLSelectElement, 'sibling');
    await userEvent.click(screen.getAllByRole('combobox').find((el) => el.tagName === 'INPUT') as HTMLElement);
    await userEvent.click(await screen.findByText('Pedro Souza'));

    expect(await screen.findByText('Pai: Carlos Souza')).toBeInTheDocument();
    expect(screen.getByText('Irmão: Pedro Souza')).toBeInTheDocument();
    expect(screen.getByText('Avô: Joel Souza')).toBeInTheDocument();
    expect(suggestFamily).toHaveBeenCalledWith('p1', [{ relativeId: 'm1', relation: 'sibling' }]);

    await userEvent.click(screen.getByRole('button', { name: 'Remover Carlos Souza' }));

    expect(screen.queryByText('Pai: Carlos Souza')).not.toBeInTheDocument();
  });

  it('keeps the chosen relative when the suggestion fails', async () => {
    vi.mocked(suggestFamily).mockRejectedValue(new Error('offline'));
    renderScreen(<FamilyModal personId="p1" family={[]} close={vi.fn()} />, { role: UserRole.GeneralAdmin });

    const relation = screen.getAllByRole('combobox').find((el) => el.textContent?.includes('Selecione o parentesco'));
    await userEvent.selectOptions(relation as HTMLSelectElement, 'sibling');
    await userEvent.click(screen.getAllByRole('combobox').find((el) => el.tagName === 'INPUT') as HTMLElement);
    await userEvent.click(await screen.findByText('Pedro Souza'));

    expect(await screen.findByText('Irmão: Pedro Souza')).toBeInTheDocument();
  });
});
