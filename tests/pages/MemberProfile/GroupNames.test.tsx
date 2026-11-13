// Libs
import { screen } from '@testing-library/react';
// Local
import { GroupNames } from '../../../src/pages/MemberProfile/components/GroupNames';
import { renderScreen } from '../../support/render';

describe('group names', () => {
  it('marks the groups the member leads or hosts, and leaves the others plain', () => {
    renderScreen(
      <GroupNames
        groups={[
          { id: 'g1', name: 'Ismael', roles: ['Líder'] },
          { id: 'g2', name: 'Phil e Pedro', roles: [] },
          { id: 'g3', name: 'Doris', roles: ['Líder', 'Anfitrião'] },
        ]}
      />,
    );

    expect(screen.getByText('Ismael')).toBeInTheDocument();
    expect(screen.getByText('Phil e Pedro')).toBeInTheDocument();
    expect(screen.getAllByText('Líder')).toHaveLength(2);
    expect(screen.getByText('Anfitrião')).toBeInTheDocument();
  });
});
