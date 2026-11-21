// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { MembersFiltersModal } from '../../../src/pages/Members/components/MembersFiltersModal';
import { NO_MEMBER_FILTERS } from '../../../src/pages/Members/filters';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

describe('members filters modal', () => {
  it('filters the members the general admin flagged as absent', async () => {
    const onApply = vi.fn();
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        grouping="individual"
        couplesAllowed
        filters={NO_MEMBER_FILTERS}
        onApply={onApply}
      />,
      { role: UserRole.GeneralAdmin },
    );

    await userEvent.click(screen.getByRole('checkbox', { name: /Membro ausente/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith('individual', { ...NO_MEMBER_FILTERS, flag: ['absent'] });
  });

  it('filters by age group', async () => {
    const onApply = vi.fn();
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        grouping="individual"
        couplesAllowed
        filters={NO_MEMBER_FILTERS}
        onApply={onApply}
      />,
      { role: UserRole.GeneralAdmin },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Faixa etária' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Jovens (18 a 29)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith('individual', { ...NO_MEMBER_FILTERS, ageGroup: ['youth'] });
  });

  it('picks one gender at a time, with everyone as the default', async () => {
    const onApply = vi.fn();
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        grouping="individual"
        couplesAllowed
        filters={NO_MEMBER_FILTERS}
        onApply={onApply}
      />,
      { role: UserRole.GeneralAdmin },
    );

    expect(screen.getByRole('radio', { name: 'Todos' })).toBeChecked();

    await userEvent.click(screen.getByRole('radio', { name: 'Feminino' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith('individual', { ...NO_MEMBER_FILTERS, gender: ['female'] });
  });

  it('switches to couples, leaving out the personal filters', async () => {
    const onApply = vi.fn();
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        grouping="individual"
        couplesAllowed
        filters={{ ...NO_MEMBER_FILTERS, gender: ['female'], status: ['active'] }}
        onApply={onApply}
      />,
      { role: UserRole.GeneralAdmin },
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Casal' }));

    expect(screen.queryByRole('radio', { name: 'Feminino' })).not.toBeInTheDocument();
    expect(screen.getByText('Casais em que pelo menos um dos dois foi sinalizado no perfil.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledWith('couple', { ...NO_MEMBER_FILTERS, status: ['active'] });
  });

  it('hides the couple toggle from who cannot see families', () => {
    renderScreen(
      <MembersFiltersModal
        close={vi.fn()}
        grouping="individual"
        couplesAllowed={false}
        filters={NO_MEMBER_FILTERS}
        onApply={vi.fn()}
      />,
      { role: UserRole.GeneralAdmin },
    );

    expect(screen.queryByRole('radio', { name: 'Casal' })).not.toBeInTheDocument();
  });
});
