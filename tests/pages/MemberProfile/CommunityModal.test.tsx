// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { CommunityModal } from '../../../src/pages/MemberProfile/components/CommunityModal';
import { savePersonCommunity } from '../../../src/repositories/communityGroups';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/communityGroups', () => ({ savePersonCommunity: vi.fn() }));
vi.mock('../../../src/queries/reference', () => ({
  useSmallGroups: () => ({
    data: [
      { id: 'pg-1', name: 'Phil e Pedro' },
      { id: 'pg-2', name: 'Marcos' },
    ],
  }),
  useMinistries: () => ({ data: [{ id: 'min-1', name: 'Louvor' }] }),
}));
vi.mock('../../../src/queries/person', () => ({ usePersonSensitive: () => ({ data: null }) }));

describe('member community modal', () => {
  it('moves the member to another small group and keeps the ministries', async () => {
    const close = vi.fn();
    renderScreen(
      <CommunityModal personId="p1" community={{ smallGroupId: 'pg-1', ministryIds: ['min-1'] }} close={close} />,
      { role: UserRole.Pastor },
    );

    await userEvent.selectOptions(screen.getByRole('combobox'), 'pg-2');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(savePersonCommunity).toHaveBeenCalledWith('p1', 'pg-2', ['min-1']);
    expect(close).toHaveBeenCalled();
  });

  it('leaves the small group when Nenhum is chosen', async () => {
    renderScreen(<CommunityModal personId="p1" community={{ smallGroupId: 'pg-1', ministryIds: [] }} close={vi.fn()} />, {
      role: UserRole.Pastor,
    });

    await userEvent.selectOptions(screen.getByRole('combobox'), '');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(savePersonCommunity).toHaveBeenCalledWith('p1', null, []);
  });
});
