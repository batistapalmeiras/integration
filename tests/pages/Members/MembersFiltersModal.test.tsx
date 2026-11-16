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
        filters={{ status: [], entryType: [], gender: [], maritalStatus: [], ageGroup: [], flag: [] }}
        onApply={onApply}
      />,
      { role: UserRole.Pastor },
    );

    await userEvent.click(screen.getByRole('checkbox', { name: /Membro ausente/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith({ status: [], entryType: [], gender: [], maritalStatus: [], ageGroup: [], flag: ['absent'] });
  });

  it('filters by age group', async () => {
    const onApply = vi.fn();
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        filters={{ status: [], entryType: [], gender: [], maritalStatus: [], ageGroup: [], flag: [] }}
        onApply={onApply}
      />,
      { role: UserRole.Pastor },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Faixa etária' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Jovens (18 a 29)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith({ status: [], entryType: [], gender: [], maritalStatus: [], ageGroup: ['youth'], flag: [] });
  });

  it('picks one gender at a time, with everyone as the default', async () => {
    const onApply = vi.fn();
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        filters={{ status: [], entryType: [], gender: [], maritalStatus: [], ageGroup: [], flag: [] }}
        onApply={onApply}
      />,
      { role: UserRole.Pastor },
    );

    expect(screen.getByRole('radio', { name: 'Todos' })).toBeChecked();

    await userEvent.click(screen.getByRole('radio', { name: 'Feminino' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith({
      status: [],
      entryType: [],
      gender: ['female'],
      maritalStatus: [],
      ageGroup: [],
      flag: [],
    });
  });
});
