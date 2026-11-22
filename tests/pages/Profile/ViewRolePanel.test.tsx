// React
import { Route, Routes } from 'react-router-dom';
// Libs
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { setViewRole, useViewRole } from '../../../src/features/access/viewRole';
import { ViewRolePage } from '../../../src/pages/Profile/ViewRole';
import { AppRoute } from '../../../src/routes/paths';
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
        <ViewRolePage />
        <Probe />
      </>,
      { role: UserRole.Developer, route: AppRoute.ProfileView },
    );

    expect(screen.getByText('view:general_admin')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole('combobox'), UserRole.Teacher);

    expect(screen.getByText('view:teacher')).toBeInTheDocument();
    expect(window.localStorage.getItem('integration-view-role')).toBe('"teacher"');
  });

  it('sends everyone else back to the profile', () => {
    for (const role of [UserRole.GeneralAdmin, UserRole.Admin, UserRole.IntegrationTeam, UserRole.Teacher]) {
      const { unmount } = renderScreen(
        <Routes>
          <Route path={AppRoute.ProfileView} element={<ViewRolePage />} />
          <Route path={AppRoute.Profile} element={<p>meus dados</p>} />
        </Routes>,
        { role, route: AppRoute.ProfileView },
      );
      expect(screen.getByText('meus dados')).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      unmount();
    }
  });
});
