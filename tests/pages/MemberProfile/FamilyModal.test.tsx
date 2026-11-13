// Libs
import { screen } from '@testing-library/react';
// Local
import { FamilyModal } from '../../../src/pages/MemberProfile/components/FamilyModal';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/queries/reference', () => ({
  useMemberNames: () => ({ data: [{ id: 'm1', name: 'Pedro Souza' }] }),
}));

describe('family modal', () => {
  it('opens straight on the relation and the member when the member has no family yet', () => {
    renderScreen(<FamilyModal personId="p1" family={[]} close={vi.fn()} />, {
      role: UserRole.Pastor,
    });

    expect(screen.getByText('Selecione o parentesco')).toBeInTheDocument();
    expect(screen.getByText('Membro')).toBeInTheDocument();
  });

  it('lists the family and only offers to add another when there already is one', () => {
    renderScreen(
      <FamilyModal
        personId="p1"
       
        family={[{ id: 'm1', name: 'Pedro Souza', relation: 'child', gender: 'male' }]}
        close={vi.fn()}
      />,
      { role: UserRole.Pastor },
    );

    expect(screen.getByText('Filho(a): Pedro Souza')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar outro familiar/ })).toBeInTheDocument();
    expect(screen.queryByText('Selecione o parentesco')).not.toBeInTheDocument();
  });
});
