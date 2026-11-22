// React
import { useLocation } from 'react-router-dom';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { LogoutSection } from '../../../src/pages/Profile/components/LogoutSection';
import { AppRoute } from '../../../src/routes/paths';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

function Where() {
  return <p>{`at:${useLocation().pathname}`}</p>;
}

describe('logout section', () => {
  it('logs out and goes to the login', async () => {
    renderScreen(
      <>
        <LogoutSection />
        <Where />
      </>,
      { role: UserRole.Teacher, route: AppRoute.ChangePassword },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));

    expect(await screen.findByText(`at:${AppRoute.Login}`)).toBeInTheDocument();
  });
});
