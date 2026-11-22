// React
import { useLocation } from 'react-router-dom';
// Libs
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { FlowContext } from '../../../src/components/Layout/flow';
import { ProfileShell } from '../../../src/pages/Profile/components/ProfileShell';
import { AppRoute, profileAccessPath, profilePath } from '../../../src/routes/paths';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

function Where() {
  return <p>{`at:${useLocation().pathname}`}</p>;
}

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

const link = (name: string) => screen.queryByRole('link', { name: new RegExp(`^${name}`), hidden: true });

describe('profile shell on desktop', () => {
  beforeEach(() => setDesktop(true));

  it('lists my data and security for everyone, with no sections of the record', () => {
    for (const role of [UserRole.GeneralAdmin, UserRole.Admin, UserRole.IntegrationTeam, UserRole.Teacher]) {
      const { unmount } = renderScreen(<ProfileShell>conteúdo</ProfileShell>, { role, route: profilePath('user-1') });
      expect(link('Meus dados')).toBeInTheDocument();
      expect(link('Segurança')).toBeInTheDocument();
      expect(link('Cadastro')).not.toBeInTheDocument();
      expect(link('Visão dos módulos')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('adds the module view to the developer', () => {
    renderScreen(<ProfileShell>conteúdo</ProfileShell>, { role: UserRole.Developer, route: profilePath('user-1') });
    expect(link('Visão dos módulos')).toBeInTheDocument();
  });

  it('marks the open section and shows the content, with no logout button', () => {
    renderScreen(<ProfileShell>conteúdo</ProfileShell>, { role: UserRole.Teacher, route: AppRoute.ChangePassword });

    expect(link('Segurança')).toHaveAttribute('aria-current', 'page');
    expect(link('Meus dados')).not.toHaveAttribute('aria-current');
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sair', hidden: true })).not.toBeInTheDocument();
  });

  it('goes back to the screen the person came from', async () => {
    renderScreen(
      <FlowContext.Provider value={{ current: AppRoute.Visitors }}>
        <ProfileShell>conteúdo</ProfileShell>
        <Where />
      </FlowContext.Provider>,
      { role: UserRole.Teacher, route: AppRoute.ChangePassword },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText(`at:${AppRoute.Visitors}`)).toBeInTheDocument();
  });
});

describe('profile shell on phones', () => {
  beforeEach(() => setDesktop(false));

  it('marks the opened section on the segmented control, with no side menu', () => {
    renderScreen(<ProfileShell>conteúdo</ProfileShell>, { role: UserRole.Teacher, route: AppRoute.ChangePassword });

    expect(screen.getByText('conteúdo')).toBeInTheDocument();
    expect(link('Segurança')).toHaveAttribute('aria-current', 'page');
    expect(link('Meus dados')).not.toHaveAttribute('aria-current');
  });

  it('goes back to the screen the person came from', async () => {
    renderScreen(
      <FlowContext.Provider value={{ current: AppRoute.Visitors }}>
        <ProfileShell>conteúdo</ProfileShell>
        <Where />
      </FlowContext.Provider>,
      { role: UserRole.Teacher, route: AppRoute.ChangePassword },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText(`at:${AppRoute.Visitors}`)).toBeInTheDocument();
  });
});

describe('profile shell of another person on phones', () => {
  beforeEach(() => setDesktop(false));

  it('switches between the sections with a segmented control, since there is no side menu', async () => {
    renderScreen(
      <>
        <ProfileShell viewing="profile-7">conteúdo</ProfileShell>
        <Where />
      </>,
      { role: UserRole.GeneralAdmin, route: profilePath('profile-7') },
    );

    await userEvent.click(within(screen.getByRole('navigation', { name: 'Perfil' })).getByRole('link', { name: 'Acesso' }));

    expect(screen.getByText(`at:${profileAccessPath('profile-7')}`)).toBeInTheDocument();
  });

  it('has no section control for a single section', () => {
    renderScreen(<ProfileShell viewing="profile-7">conteúdo</ProfileShell>, {
      role: UserRole.Admin,
      route: profilePath('profile-7'),
    });

    expect(screen.queryByRole('navigation', { name: 'Perfil' })).not.toBeInTheDocument();
  });

  it('offers the own sections on phones, the module view only to the developer', () => {
    const teacher = renderScreen(<ProfileShell>conteúdo</ProfileShell>, {
      role: UserRole.Teacher,
      route: profilePath('user-1'),
    });
    const labels = () =>
      within(screen.getByRole('navigation', { name: 'Perfil' }))
        .getAllByRole('link')
        .map((link) => link.textContent);
    expect(labels()).toEqual(['Meus dados', 'Segurança']);
    teacher.unmount();

    renderScreen(<ProfileShell>conteúdo</ProfileShell>, { role: UserRole.Developer, route: profilePath('user-1') });
    expect(labels()).toEqual(['Meus dados', 'Segurança', 'Visão dos módulos']);
  });
});
