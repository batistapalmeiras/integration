// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { CommunityGroup } from '../../../src/domain/communityGroups';
import { GroupModal } from '../../../src/pages/CommunityGroups/components/GroupModal';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

const group: CommunityGroup = {
  id: 'g1',
  name: 'Phil e Pedro',
  leaderIds: ['p1', 'gone'],
  hostIds: ['p2'],
  meetingDay: 'thursday',
};

const members = [
  { id: 'p1', name: 'Pedro Henrique Oliveira Menezes', isMember: true },
  { id: 'p2', name: 'Laisla Coelho Mendes da Silva', isMember: true },
];

describe('group modal', () => {
  it('shows the current leaders and hosts and saves them by person', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderScreen(
      <GroupModal
        title="Editar Phil e Pedro"
        fieldLabel="Pequeno Grupo"
        group={group}
        smallGroup
        groupMembers={members}
        close={vi.fn()}
        onSave={onSave}
      />,
      { role: UserRole.Pastor },
    );

    expect(screen.getByText('Pedro Henrique Oliveira Menezes')).toBeInTheDocument();
    expect(screen.getByText('Laisla Coelho Mendes da Silva')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Phil e Pedro',
      leaderIds: ['p1'],
      hostIds: ['p2'],
      meetingDay: 'thursday',
    });
  });
});
