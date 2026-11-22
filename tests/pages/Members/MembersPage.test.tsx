// React
import { Route, Routes, useLocation } from 'react-router-dom';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { MembersPage } from '../../../src/pages/Members';
import { membersPath } from '../../../src/pages/Members/persistence';
import { AppRoute } from '../../../src/routes/paths';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/memberRecords', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/memberRecords')>()),
  listMemberRows: vi.fn(async () => []),
}));

class StubIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', StubIntersectionObserver);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

function Where() {
  return <p>{`at:${useLocation().pathname}`}</p>;
}

const renderMembers = (route: string) =>
  renderScreen(
    <>
      <Routes>
        <Route path={`${AppRoute.Members}/*`} element={<MembersPage />} />
      </Routes>
      <Where />
    </>,
    { role: UserRole.GeneralAdmin, route },
  );

const recentChip = () => screen.queryByRole('button', { name: 'Remover filtro Aceitos nos últimos 3 meses' });

describe('members page filters', () => {
  it('shows a chip for the three months filter and drops it when the chip is removed', async () => {
    renderMembers(membersPath({ recent: ['recent'] }));

    await userEvent.click(await screen.findByRole('button', { name: 'Remover filtro Aceitos nos últimos 3 meses' }));

    expect(recentChip()).not.toBeInTheDocument();
    expect(screen.getByText(`at:${AppRoute.Members}`)).toBeInTheDocument();
  });

  it('keeps the other filters when only the three months chip is removed', async () => {
    renderMembers(membersPath({ recent: ['recent'], flag: ['absent'] }));

    await userEvent.click(await screen.findByRole('button', { name: 'Remover filtro Aceitos nos últimos 3 meses' }));

    expect(screen.getByText(`at:${membersPath({ flag: ['absent'] })}`)).toBeInTheDocument();
  });

  it('makes no chip for any other filter', async () => {
    renderMembers(membersPath({ status: ['active'], flag: ['absent'] }));

    expect(await screen.findByText(/pessoas|pessoa/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Remover filtro/ })).not.toBeInTheDocument();
  });

  it('has no clear filters button, since the filters sheet and the chip already clear them', async () => {
    renderMembers(membersPath({ status: ['active'], flag: ['absent'] }));

    expect(await screen.findByText(/pessoas|pessoa/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
  });

  it('shows the members only as cards, with no list and cards switch', async () => {
    renderMembers(membersPath({ recent: ['recent'] }));

    expect(await screen.findByRole('button', { name: 'Remover filtro Aceitos nos últimos 3 meses' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Modo de exibição' })).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
