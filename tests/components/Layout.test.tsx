// Libs
import { screen } from '@testing-library/react';
// Local
import { Layout } from '../../src/components/Layout';
import { AppRoute } from '../../src/routes/paths';
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

vi.mock('../../src/repositories/membership', () => ({
  countMembershipPending: vi.fn(() => new Promise(() => undefined)),
}));

const hasLink = (name: string) =>
  screen.queryAllByRole('link', { name: new RegExp(`^${name}`), hidden: true }).length > 0;

const linksTo = (path: string) =>
  screen.queryAllByRole('link', { hidden: true }).some((link) => link.getAttribute('href') === path);

describe('side menu by role', () => {
  it('shows the church area to the general admin', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.GeneralAdmin, route: AppRoute.Members });
    for (const item of ['Membros', 'Pequenos Grupos', 'Ministérios', 'Aniversariantes']) {
      expect([item, hasLink(item)]).toEqual([item, true]);
    }
  });

  it('keeps the teacher to classes', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.Teacher, route: AppRoute.Classes });
    expect(hasLink('Turmas')).toBe(true);
    for (const item of ['Visitantes', 'Membros', 'Café', 'Conselho', 'Aniversariantes']) {
      expect([item, hasLink(item)]).toEqual([item, false]);
    }
  });

  it('keeps the integration team away from members and classes, but shows the history', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.IntegrationTeam, route: AppRoute.Visitors });
    expect(hasLink('Visitantes')).toBe(true);
    expect(hasLink('Café')).toBe(true);
    for (const item of ['Membros', 'Conselho']) {
      expect([item, hasLink(item)]).toEqual([item, false]);
    }
    expect(linksTo(AppRoute.Classes)).toBe(false);
    expect(linksTo(`${AppRoute.Reports}/cafes`)).toBe(true);
    expect(linksTo(`${AppRoute.Reports}/turmas`)).toBe(false);
    expect(hasLink('Histórico')).toBe(true);
    expect(hasLink('Mais')).toBe(false);
  });

  it('drops the side menu on a standalone screen such as the profile', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.Admin, route: AppRoute.Profile });
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
    expect(hasLink('Visitantes')).toBe(false);
    expect(screen.queryByRole('button', { name: 'Menu do usuário' })).not.toBeInTheDocument();
  });

  it('opens a member as a standalone screen, with no second menu', () => {
    renderScreen(<Layout>conteúdo</Layout>, {
      role: UserRole.GeneralAdmin,
      route: '/membros/5f3c2b1a-9d8e-4f7a-b6c5-1234567890ab/historico',
    });

    expect(screen.getByText('conteúdo')).toBeInTheDocument();
    expect(hasLink('Membros')).toBe(false);
    expect(hasLink('Controle de acesso')).toBe(false);
  });

  it('keeps the member list inside the layout, filters included', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.GeneralAdmin, route: '/membros/ativo/batismo' });

    expect(hasLink('Membros')).toBe(true);
  });

  it('keeps the profile menu at the top right of the page, with no user block in the side menu', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.Admin, route: AppRoute.Dashboard });

    expect(screen.getAllByRole('button', { name: 'Menu do usuário', hidden: true })).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /^Meu perfil,/, hidden: true })).not.toBeInTheDocument();
  });

  it('keeps only the avatar on phones, beside the page title', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...original(query),
      matches: query.includes('max-width'),
    })) as typeof window.matchMedia;

    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.Admin, route: AppRoute.Dashboard });
    window.matchMedia = original;

    const trigger = screen.getByRole('button', { name: 'Menu do usuário', hidden: true });
    expect(trigger).not.toHaveTextContent('Ana');
    expect(screen.getAllByRole('button', { name: 'Menu do usuário', hidden: true })).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /^Meu perfil,/, hidden: true })).not.toBeInTheDocument();
  });
});
