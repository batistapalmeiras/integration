// Libs
import { screen } from '@testing-library/react';
// Local
import { Layout } from '../../src/components/Layout';
import { AppRoute } from '../../src/routes/paths';
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

vi.mock('../../src/repositories/membership', () => ({ countMembershipPending: vi.fn(() => new Promise(() => undefined)) }));

const hasLink = (name: string) =>
  screen.queryAllByRole('link', { name: new RegExp(`^${name}`), hidden: true }).length > 0;

describe('side menu by role', () => {
  it('shows the church area to the pastor', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.Pastor, route: AppRoute.Members });
    for (const item of ['Membros', 'Pendências', 'Pequenos Grupos', 'Ministérios', 'Aniversariantes']) {
      expect([item, hasLink(item)]).toEqual([item, true]);
    }
  });

  it('keeps the teacher to classes and people', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.Teacher, route: AppRoute.Classes });
    expect(hasLink('Turmas')).toBe(true);
    expect(hasLink('Pessoas')).toBe(true);
    for (const item of ['Visitantes', 'Membros', 'Café', 'Membresia', 'Aniversariantes']) {
      expect([item, hasLink(item)]).toEqual([item, false]);
    }
  });

  it('keeps the integration team away from members and classes', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.IntegrationTeam, route: AppRoute.Visitors });
    expect(hasLink('Visitantes')).toBe(true);
    expect(hasLink('Café')).toBe(true);
    for (const item of ['Turmas', 'Membros', 'Membresia', 'Pendências']) {
      expect([item, hasLink(item)]).toEqual([item, false]);
    }
  });

  it('shows the user name and role and renders the page content', () => {
    renderScreen(<Layout>conteúdo</Layout>, { role: UserRole.Admin, route: AppRoute.Dashboard });
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('conteúdo')).toBeInTheDocument();
  });
});
