// React
import { Route, Routes, useLocation } from 'react-router-dom';
// Libs
import { screen } from '@testing-library/react';
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

describe('members page filters', () => {
  it('has no clear filters button, since the filters sheet already clears them', async () => {
    renderMembers(membersPath({ status: ['active'], flag: ['absent'] }));

    expect(await screen.findByText(/pessoas|pessoa/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
  });

  it('shows the members only as cards, with no list and cards switch', async () => {
    renderMembers(membersPath({ status: ['active'] }));

    expect(await screen.findByText(/pessoas|pessoa/)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Modo de exibição' })).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('members page default', () => {
  beforeEach(() => window.localStorage.clear());

  it('starts with the active status selected when nothing was saved', async () => {
    renderMembers(AppRoute.Members);

    expect(await screen.findByRole('button', { name: /Filtros \(1\)/ })).toBeInTheDocument();
  });

  it('keeps what was saved, even when it is no filter at all', async () => {
    window.localStorage.setItem('members-list-filters-v2', JSON.stringify({ status: [] }));
    renderMembers(AppRoute.Members);

    expect(await screen.findByRole('button', { name: 'Filtros' })).toBeInTheDocument();
  });
});
