// React
import { Route, Routes } from 'react-router-dom';
// Libs
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { clearQueries } from '../../../src/lib/queryCache';
import { setFamily } from '../../../src/repositories/family';
import { ConfirmMemberPage } from '../../../src/pages/ConfirmMember';
import { listCouncils } from '../../../src/repositories/councils';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      throw new Error(`unmocked table ${table}`);
    },
    rpc: (fn: string) => {
      throw new Error(`unmocked rpc ${fn}`);
    },
  },
}));
vi.mock('../../../src/repositories/people', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/people')>()),
  updatePersonStatus: vi.fn().mockResolvedValue(undefined),
  insertStatusHistory: vi.fn().mockResolvedValue(undefined),
  fetchPersonWithProfile: vi.fn().mockResolvedValue({
    person: {
      id: 'p1',
      name: 'Gabriela Santos Silva da Rocha',
      phone: null,
      age: null,
      email: null,
      status: 'membership_pending',
      whatsapp_opened_at: null,
      class_invite_sent_at: null,
      signup_window_from: null,
      membership_interest_sent_at: null,
      entry_type: null,
      coffee_retry_used: false,
      origin: 'integration',
      membership_status: null,
      visited_on: null,
      created_at: '2026-09-06T00:00:00Z',
      updated_at: '2026-09-06T00:00:00Z',
    },
    profile: {
      coffee: null,
      cohort: null,
      smallGroupIds: [],
      smallGroupNames: [],
      ministryNames: [],
      ministryIds: [],
    },
  }),
}));
vi.mock('../../../src/repositories/family', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/family')>()),
  getFamily: vi.fn().mockResolvedValue([]),
  setFamily: vi.fn().mockResolvedValue(undefined),
  listFamilyTraits: vi.fn().mockResolvedValue({}),
}));
vi.mock('../../../src/repositories/personSensitive', () => ({ getPersonSensitive: vi.fn().mockResolvedValue(null) }));
vi.mock('../../../src/repositories/membership', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/membership')>()),
  listMembershipAlerts: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../../src/repositories/communityGroups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/communityGroups')>()),
  listSmallGroups: vi.fn().mockResolvedValue([]),
  listMinistries: vi.fn().mockResolvedValue([]),
  listMembers: vi.fn().mockResolvedValue([{ id: 'p2', name: 'Lucas Souza Bianchi' }]),
  savePersonCommunity: vi.fn().mockResolvedValue({}),
}));
vi.mock('../../../src/repositories/councils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/councils')>()),
  listCouncils: vi.fn(),
}));

const renderPage = () =>
  renderScreen(
    <Routes>
      <Route path="/conselho/:id/confirmar" element={<ConfirmMemberPage />} />
    </Routes>,
    { role: UserRole.GeneralAdmin, route: '/conselho/p1/confirmar' },
  );

describe('confirm member page', () => {
  afterEach(() => clearQueries());

  it('lets the general admin confirm with or without a council, newest council first', async () => {
    vi.mocked(listCouncils).mockResolvedValue([
      { id: 'c2', meetingDate: '2026-11-10', memberCount: 3 },
      { id: 'c1', meetingDate: '2026-10-27', memberCount: 5 },
    ]);
    renderPage();

    const confirm = await screen.findByRole('button', { name: /Confirmar como membro/ });
    const council = screen
      .getAllByRole('combobox')
      .find((select) => select.textContent?.includes('Nenhum por enquanto'));

    expect(council).toBeDefined();
    expect([...(council as HTMLSelectElement).options].map((option) => option.textContent)).toEqual([
      'Nenhum por enquanto',
      '10/11/2026',
      '27/10/2026',
    ]);
    expect(council).toHaveValue('');
    expect(confirm).toBeEnabled();

    await userEvent.selectOptions(council as HTMLSelectElement, 'c2');

    expect(confirm).toBeEnabled();
  });

  it('saves the relatives added on the page when confirming', async () => {
    vi.mocked(listCouncils).mockResolvedValue([]);
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Adicionar familiar/ }));
    const relation = screen.getAllByRole('combobox').find((el) => el.textContent?.includes('Selecione o parentesco'));
    await userEvent.selectOptions(relation as HTMLSelectElement, 'spouse');
    await userEvent.click(screen.getAllByRole('combobox').find((el) => el.tagName === 'INPUT') as HTMLElement);
    await userEvent.click(await screen.findByText('Lucas Souza Bianchi'));
    await userEvent.click(screen.getByRole('button', { name: /Confirmar como membro/ }));

    await waitFor(() =>
      expect(setFamily).toHaveBeenCalledWith('p1', [{ relativeId: 'p2', relation: 'spouse' }], []),
    );
  });
});
