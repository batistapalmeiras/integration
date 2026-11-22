// React
import { useLocation } from 'react-router-dom';
// Libs
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { ProfileMenu } from '../../src/components/ProfileMenu';
import { AppRoute, profilePath } from '../../src/routes/paths';
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

function Where() {
  return <p>{`at:${useLocation().pathname}`}</p>;
}

const trigger = () => screen.getByRole('button', { name: 'Menu do usuário' });

const originalMatchMedia = window.matchMedia;

function setDesktop(desktop: boolean) {
  window.matchMedia = ((query: string) => ({
    ...originalMatchMedia(query),
    matches: desktop ? query.includes('min-width') : query.includes('max-width'),
  })) as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('profile menu on desktop', () => {
  beforeEach(() => setDesktop(true));

  it('opens a dropdown with the name, the role, the profile sections', async () => {
    renderScreen(<ProfileMenu />, { role: UserRole.GeneralAdmin });
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger());

    const menu = screen.getByRole('menu');
    expect(menu).toHaveTextContent('Ana Souza');
    expect(menu).toHaveTextContent('Administrador Geral');
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Meus dados', 'Segurança']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds the module view to the developer', async () => {
    renderScreen(<ProfileMenu />, { role: UserRole.Developer });
    await userEvent.click(trigger());

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Meus dados',
      'Segurança',
      'Visão dos módulos',
    ]);
  });

  it('goes straight to the chosen section and closes', async () => {
    renderScreen(
      <>
        <ProfileMenu />
        <Where />
      </>,
      { role: UserRole.Teacher },
    );
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('menuitem', { name: 'Segurança' }));

    expect(screen.getByText(`at:${AppRoute.ChangePassword}`)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('closes with Escape and with a click outside', async () => {
    renderScreen(
      <>
        <ProfileMenu />
        <p>fora</p>
      </>,
      { role: UserRole.Teacher },
    );
    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger());
    await userEvent.click(screen.getByText('fora'));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});

describe('profile menu on phones', () => {
  beforeEach(() => setDesktop(false));

  it('opens a full screen dialog with the name, the role and the profile sections', async () => {
    renderScreen(<ProfileMenu />, { role: UserRole.IntegrationTeam });
    await userEvent.click(trigger());

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Ana Souza');
    expect(dialog).toHaveTextContent('Equipe de Integração');
    expect(screen.getByRole('menuitem', { name: 'Meus dados' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Sair' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the section and closes the dialog', async () => {
    renderScreen(
      <>
        <ProfileMenu />
        <Where />
      </>,
      { role: UserRole.IntegrationTeam },
    );
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('menuitem', { name: 'Meus dados' }));

    expect(screen.getByText(`at:${profilePath('user-1')}`)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
