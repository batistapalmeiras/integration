// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { MembersFiltersModal } from '../../../src/pages/Members/components/MembersFiltersModal';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

describe('members filters modal', () => {
  it('filters the members the pastor flagged as absent', async () => {
    const onApply = vi.fn();
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        membershipStatusFilter={[]}
        entryTypeFilter={[]}
        flagFilter={[]}
        onApply={onApply}
      />,
      { role: UserRole.Pastor },
    );

    await userEvent.click(screen.getByRole('checkbox', { name: 'Membro ausente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith([], [], ['absent']);
  });
});
