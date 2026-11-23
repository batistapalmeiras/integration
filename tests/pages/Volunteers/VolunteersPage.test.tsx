// React
import { Route, Routes, useLocation } from 'react-router-dom';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { VolunteersPage } from '../../../src/pages/Volunteers';
import { listVolunteers, VolunteerRow } from '../../../src/repositories/volunteers';
import { AppRoute, profilePath } from '../../../src/routes/paths';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/volunteers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/volunteers')>()),
  listVolunteers: vi.fn(),
}));

const person = (id: string, name: string, role: UserRole, membershipStatus = 'active'): VolunteerRow => ({
  id,
  personId: `person-${id}`,
  name,
  phone: null,
  email: null,
  origin: 'integration',
  role,
  membershipStatus,
});

function Where() {
  return <p>{`at:${useLocation().pathname}`}</p>;
}

const renderPage = () =>
  renderScreen(
    <>
      <Routes>
        <Route path={AppRoute.Volunteers} element={<VolunteersPage />} />
      </Routes>
      <Where />
    </>,
    { role: UserRole.GeneralAdmin, route: AppRoute.Volunteers },
  );

const filter = (name: RegExp) => screen.getByRole('button', { name });
const groupLabels = () =>
  screen.getAllByRole('heading', { level: 3 }).map((item) => item.textContent);
const groupToggle = (name: RegExp) => screen.getByRole('button', { name });

describe('access control page', () => {
  beforeEach(() => {
    vi.mocked(listVolunteers).mockResolvedValue([
      person('a', 'Ismael Arêdes', UserRole.GeneralAdmin),
      person('b', 'Dayse Oliveira', UserRole.GeneralAdmin),
      person('c', 'Iago Santos', UserRole.Developer),
      person('d', 'Karine Rangel', UserRole.IntegrationTeam),
      person('e', 'Bruno Alves', UserRole.IntegrationTeam, 'transferred'),
    ]);
  });

  it('opens on all the modules, stacked one under the other, with the general admins first', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Igreja', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Integração', level: 2 })).toBeInTheDocument();
    expect(groupLabels()).toEqual([
      'Administradores Gerais',
      'Desenvolvedores',
      'Administradores',
      'Professores',
      'Equipe de Integração',
    ]);
    expect(filter(/^Todos/)).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows how many people each module has on the filter', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Igreja', level: 2 });
    expect(filter(/^Todos/)).toHaveTextContent('5');
    expect(filter(/^Igreja/)).toHaveTextContent('3');
    expect(filter(/^Integração/)).toHaveTextContent('2');
  });

  it('shows only the roles of the module that was chosen, without the module title', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /^Integração/ }));

    expect(groupLabels()).toEqual(['Administradores', 'Professores', 'Equipe de Integração']);
    expect(screen.queryByRole('heading', { name: 'Igreja' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Integração', level: 2 })).not.toBeInTheDocument();
    expect(filter(/^Integração/)).toHaveAttribute('aria-pressed', 'true');
    expect(groupToggle(/^Administradores/)).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Ninguém por aqui.')).toBeInTheDocument();
  });

  it('remembers the module that was chosen', async () => {
    const { unmount } = renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /^Igreja/ }));
    unmount();

    renderPage();

    await screen.findByRole('heading', { name: /^Administradores Gerais/ });
    expect(groupLabels()).toEqual(['Administradores Gerais', 'Desenvolvedores']);
    expect(filter(/^Igreja/)).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens the profile of the person that was clicked', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Ismael Arêdes/ }));

    expect(screen.getByText(`at:${profilePath('a')}`)).toBeInTheDocument();
  });

  it('keeps the add button and has no description under the title', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Igreja', level: 2 });

    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
    expect(screen.queryByText(/Gerencie quem acessa/)).not.toBeInTheDocument();
  });

  it('opens only the first group of each module, and opens or closes the others on click', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Igreja', level: 2 });

    expect(groupToggle(/^Administradores Gerais/)).toHaveAttribute('aria-expanded', 'true');
    expect(groupToggle(/^Desenvolvedores/)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /Iago Santos/ })).not.toBeInTheDocument();

    await userEvent.click(groupToggle(/^Desenvolvedores/));

    expect(groupToggle(/^Desenvolvedores/)).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Iago Santos/ })).toBeInTheDocument();
  });
});
