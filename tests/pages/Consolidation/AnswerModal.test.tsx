// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { ConsolidationItem } from '../../../src/domain/consolidation';
import { AnswerModal } from '../../../src/pages/Consolidation/components/AnswerModal';
import { redirectConsolidation } from '../../../src/repositories/consolidations';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/queries/reference', () => ({
  useSmallGroups: () => ({ data: [{ id: 'g1', name: 'Doris' }, { id: 'g2', name: 'Marcos' }] }),
  useMinistries: () => ({ data: [{ id: 'm1', name: 'Louvor' }, { id: 'm2', name: 'Recepção' }] }),
}));

vi.mock('../../../src/repositories/consolidations', () => ({
  answerConsolidation: vi.fn(),
  redirectConsolidation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../src/queries/consolidations', () => ({ refreshConsolidations: vi.fn().mockResolvedValue([]) }));

const item: ConsolidationItem = {
  id: 'c1',
  personId: 'p1',
  personName: 'Ana Souza',
  kind: 'small_group',
  groupId: 'g1',
  groupName: 'Doris',
  startedAt: '2026-10-01T12:00:00Z',
  dueAt: '2026-12-01T12:00:00Z',
  overdue: false,
};

const openRedirect = async () => {
  renderScreen(<AnswerModal item={item} close={vi.fn()} />, { role: UserRole.GeneralAdmin });
  await userEvent.click(screen.getByRole('button', { name: 'Redirecionar' }));
};

describe('redirecting a person in consolidation', () => {
  it('lists only the groups of the same kind and disables the current one', async () => {
    await openRedirect();

    expect(screen.queryByRole('radio', { name: 'Louvor' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Doris/ })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Marcos' })).toBeEnabled();
  });

  it('only redirects after a group is chosen', async () => {
    await openRedirect();
    const confirm = screen.getByRole('button', { name: 'Redirecionar' });
    expect(confirm).toBeDisabled();

    await userEvent.click(screen.getByRole('radio', { name: 'Marcos' }));
    await userEvent.click(confirm);

    expect(redirectConsolidation).toHaveBeenCalledWith('c1', 'small_group', 'g2');
  });
});
