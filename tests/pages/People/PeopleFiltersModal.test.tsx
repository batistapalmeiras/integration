// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { PeopleFiltersModal } from '../../../src/pages/People/components/PeopleFiltersModal';
import { ALL_COHORTS } from '../../../src/pages/People/persistence';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

describe('people filters modal', () => {
  it('filters by class and keeps Limpar off while nothing is filtered', async () => {
    const onApply = vi.fn();
    const close = vi.fn();
    renderScreen(
      <PeopleFiltersModal
        close={close}
        statusFilter={[]}
        cohortFilter={ALL_COHORTS}
        cohortNames={['Turma 1', 'Turma 2']}
        onApply={onApply}
      />,
      { role: UserRole.Admin },
    );

    expect(screen.getByRole('button', { name: 'Limpar' })).toBeDisabled();

    const cohort = screen
      .getAllByRole('combobox')
      .find((select) => select.textContent?.includes('Turma 2'));
    await userEvent.selectOptions(cohort as HTMLSelectElement, 'Turma 2');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith([], 'Turma 2');
    expect(close).toHaveBeenCalled();
  });
});
