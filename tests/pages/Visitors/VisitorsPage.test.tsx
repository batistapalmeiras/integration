// React
import { Route, Routes, useLocation } from 'react-router-dom';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { clearQueries } from '../../../src/lib/queryCache';
import { VisitorsPage } from '../../../src/pages/Visitors';
import { ArchivedVisitorsPage } from '../../../src/pages/Visitors/Archived';
import { listVisitors } from '../../../src/repositories/people';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/people', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/people')>()),
  listVisitors: vi.fn(),
}));

const visitor = (id: string, name: string, status: 'initial_contact' | 'archived') => ({
  id,
  name,
  phone: '31999990000',
  age: null,
  email: null,
  status,
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  coffee_retry_used: false,
  origin: 'integration' as const,
  membership_status: null,
  visited_on: null,
  created_at: '2026-09-06T00:00:00Z',
  updated_at: '2026-09-06T00:00:00Z',
});

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

describe('visitors screens', () => {
  afterEach(() => {
    clearQueries();
    localStorage.clear();
  });

  it('counts the archived link only with the visitors that match the search', async () => {
    vi.mocked(listVisitors).mockResolvedValue([
      visitor('1', 'Ana Souza', 'initial_contact'),
      visitor('2', 'Ana Lima', 'archived'),
      visitor('3', 'Bruno Alves', 'archived'),
      visitor('4', 'Carla Dias', 'archived'),
    ]);
    renderScreen(
      <Routes>
        <Route path="/visitantes/*" element={<VisitorsPage />} />
      </Routes>,
      { role: UserRole.Pastor, route: '/visitantes?q=ana' },
    );

    expect(await screen.findByText('Na fila (1)')).toBeInTheDocument();
    expect(screen.getByText('Arquivados (1)')).toBeInTheDocument();
  });

  it('opens a separate screen with only the archived visitors', async () => {
    vi.mocked(listVisitors).mockResolvedValue([
      visitor('1', 'Ana Souza', 'initial_contact'),
      visitor('2', 'Ana Lima', 'archived'),
    ]);
    renderScreen(
      <>
        <CurrentPath />
        <Routes>
          <Route path="/visitantes/arquivado" element={<ArchivedVisitorsPage />} />
          <Route path="/visitantes/*" element={<VisitorsPage />} />
        </Routes>
      </>,
      { role: UserRole.Pastor, route: '/visitantes' },
    );

    await userEvent.click(await screen.findByText('Arquivados (1)'));

    expect(await screen.findByText('Ana Lima')).toBeInTheDocument();
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('/visitantes/arquivado');
  });
});
