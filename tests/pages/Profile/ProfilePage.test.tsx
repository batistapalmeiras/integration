// React
import { Route, Routes } from 'react-router-dom';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { ProfilePage } from '../../../src/pages/Profile';
import {
  createVolunteer,
  getVolunteer,
  getVolunteerByPerson,
  VolunteerRow,
} from '../../../src/repositories/volunteers';
import { profileAccessPath, profilePath } from '../../../src/routes/paths';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/volunteers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/volunteers')>()),
  getVolunteer: vi.fn(),
  getVolunteerByPerson: vi.fn(),
  createVolunteer: vi.fn(),
}));

vi.mock('../../../src/pages/MemberProfile', () => ({
  MemberProfile: ({ id }: { id: string }) => <p>{`ficha:${id}`}</p>,
}));

const OWN = 'user-1';
const OTHER = 'profile-7';

const volunteer = (overrides: Partial<VolunteerRow> = {}): VolunteerRow => ({
  id: OTHER,
  personId: 'person-7',
  name: 'Beatriz Lima',
  phone: null,
  email: 'bia@example.com',
  origin: 'integration',
  role: UserRole.Teacher,
  membershipStatus: 'active',
  ...overrides,
});

const renderProfile = (role: UserRole, id: string, route = profilePath(id)) =>
  renderScreen(
    <Routes>
      <Route path={profilePath(':id')} element={<ProfilePage />} />
      <Route path={`${profilePath(':id')}/:section`} element={<ProfilePage />} />
    </Routes>,
    { role, route },
  );

const link = (name: string) => screen.queryByRole('link', { name: new RegExp(`^${name}`), hidden: true });

beforeEach(() => {
  vi.mocked(getVolunteer).mockResolvedValue(volunteer());
  vi.mocked(getVolunteerByPerson).mockResolvedValue(volunteer());
});

describe('own profile', () => {
  beforeEach(() => {
    vi.mocked(getVolunteer).mockImplementation(async (id) =>
      volunteer({ id, personId: 'person-own', name: 'Ana Souza' }),
    );
  });

  it('opens the own member record, with the account in the menu, for who can open records', async () => {
    for (const role of [UserRole.GeneralAdmin, UserRole.Developer]) {
      const { unmount } = renderProfile(role, OWN);
      expect(await screen.findByText('ficha:person-own')).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Acesso ao sistema' })).not.toBeInTheDocument();
      expect(link('Meus dados')).toHaveAttribute('href', profilePath(OWN));
      expect(link('Segurança')).toBeInTheDocument();
      expect(link('Acesso')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('keeps the simple account form for everyone else', () => {
    for (const role of [UserRole.Admin, UserRole.IntegrationTeam, UserRole.Teacher]) {
      const { unmount } = renderProfile(role, OWN);
      expect(screen.getByText('Informações pessoais')).toBeInTheDocument();
      expect(screen.queryByText(/^ficha:/)).not.toBeInTheDocument();
      unmount();
    }
  });

  it('has no access section of its own', async () => {
    renderProfile(UserRole.GeneralAdmin, OWN, profileAccessPath(OWN));

    expect(await screen.findByText('ficha:person-own')).toBeInTheDocument();
  });
});

describe('profile of another person', () => {
  it('shows the member record, with the register and the access in the menu, for who can open records', async () => {
    renderProfile(UserRole.GeneralAdmin, OTHER);

    expect(await screen.findByText('ficha:person-7')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Acesso ao sistema' })).not.toBeInTheDocument();
    expect(link('Cadastro')).toHaveAttribute('href', profilePath(OTHER));
    expect(link('Acesso')).toHaveAttribute('href', profileAccessPath(OTHER));
    expect(link('Segurança')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();
  });

  it('shows the access of the person in its own section', async () => {
    renderProfile(UserRole.GeneralAdmin, OTHER, profileAccessPath(OTHER));

    expect(await screen.findByRole('region', { name: 'Acesso ao sistema' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Remover acesso' })).toBeInTheDocument();
    expect(screen.queryByText('Conta ativa')).not.toBeInTheDocument();
    expect(screen.queryByText(/^ficha:/)).not.toBeInTheDocument();
    expect(link('Acesso')).toHaveAttribute('aria-current', 'page');
  });

  it('shows only the access to the module admin, who cannot open records', async () => {
    renderProfile(UserRole.Admin, OTHER);

    expect(await screen.findByRole('region', { name: 'Acesso ao sistema' })).toBeInTheDocument();
    expect(screen.queryByText('Beatriz Lima')).not.toBeInTheDocument();
    expect(screen.queryByText('bia@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText(/^ficha:/)).not.toBeInTheDocument();
    expect(link('Acesso')).toHaveAttribute('href', profilePath(OTHER));
    expect(link('Cadastro')).not.toBeInTheDocument();
  });

  it('keeps the access section away from who cannot open records', async () => {
    renderProfile(UserRole.Admin, OTHER, profileAccessPath(OTHER));

    expect(await screen.findByRole('region', { name: 'Acesso ao sistema' })).toBeInTheDocument();
  });

  it('says why a member who is not active has no access', async () => {
    vi.mocked(getVolunteer).mockResolvedValue(volunteer({ membershipStatus: 'transferred' }));
    vi.mocked(getVolunteerByPerson).mockResolvedValue(volunteer({ membershipStatus: 'transferred' }));
    renderProfile(UserRole.GeneralAdmin, OTHER, profileAccessPath(OTHER));

    expect(await screen.findByText(/Sem acesso: a situação do membro é "Transferido"/)).toBeInTheDocument();
  });

  it('does not let the module admin edit a privileged account', async () => {
    vi.mocked(getVolunteer).mockResolvedValue(volunteer({ role: UserRole.GeneralAdmin }));
    vi.mocked(getVolunteerByPerson).mockResolvedValue(volunteer({ role: UserRole.GeneralAdmin }));
    renderProfile(UserRole.Admin, OTHER);

    expect(await screen.findByText(/Só o Administrador Geral pode editar/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remover acesso' })).not.toBeInTheDocument();
  });

  it('sends roles that manage nobody back to their own profile', () => {
    for (const role of [UserRole.IntegrationTeam, UserRole.Teacher]) {
      const { unmount } = renderProfile(role, OTHER);
      expect(screen.getByText('Informações pessoais')).toBeInTheDocument();
      unmount();
    }
  });

  it('sends an unknown section back to the register', async () => {
    renderProfile(UserRole.GeneralAdmin, OTHER, `${profilePath(OTHER)}/nada`);

    expect(await screen.findByText('ficha:person-7')).toBeInTheDocument();
  });
});

describe('giving access from the profile', () => {
  it('offers to give access to a member who has no login, and creates it', async () => {
    vi.mocked(getVolunteerByPerson).mockResolvedValue(null);
    vi.mocked(createVolunteer).mockResolvedValue(undefined);
    renderProfile(UserRole.GeneralAdmin, OTHER, profileAccessPath(OTHER));

    expect(await screen.findByText(/ainda não tem acesso ao sistema/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remover acesso' })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole('combobox'), UserRole.Teacher);
    await userEvent.click(screen.getByRole('button', { name: 'Dar acesso' }));

    await vi.waitFor(() =>
      expect(createVolunteer).toHaveBeenCalledWith(expect.objectContaining({ personId: 'person-7', role: UserRole.Teacher })),
    );
  });

  it('asks for the role before giving the access', async () => {
    vi.mocked(getVolunteerByPerson).mockResolvedValue(null);
    vi.mocked(createVolunteer).mockClear();
    renderProfile(UserRole.GeneralAdmin, OTHER, profileAccessPath(OTHER));

    await userEvent.click(await screen.findByRole('button', { name: 'Dar acesso' }));

    expect(createVolunteer).not.toHaveBeenCalled();
  });
});
