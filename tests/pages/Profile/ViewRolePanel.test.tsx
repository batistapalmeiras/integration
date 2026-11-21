// Libs
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { setViewRole, useViewRole } from '../../../src/features/access/viewRole';
import { ProfilePage } from '../../../src/pages/Profile';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

function Probe() {
  return <p>{`view:${useViewRole()}`}</p>;
}

afterEach(() => {
  act(() => setViewRole(UserRole.GeneralAdmin));
});

describe('view role on the profile', () => {
  it('lets the developer pick how the integration looks and keeps the choice', async () => {
    renderScreen(
      <>
        <ProfilePage />
        <Probe />
      </>,
      { role: UserRole.Developer, route: '/perfil' },
    );

    expect(screen.getByText('view:general_admin')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole('combobox'), UserRole.Teacher);

    expect(screen.getByText('view:teacher')).toBeInTheDocument();
    expect(window.localStorage.getItem('integration-view-role')).toBe('"teacher"');
  });

  it('hides the choice from everyone else', () => {
    for (const role of [UserRole.GeneralAdmin, UserRole.Admin, UserRole.IntegrationTeam, UserRole.Teacher]) {
      const { unmount } = renderScreen(<ProfilePage />, { role, route: '/perfil' });
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      unmount();
    }
  });
});
