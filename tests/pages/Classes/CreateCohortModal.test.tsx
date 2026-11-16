// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toDateKey } from 'bp-kit';
// Local
import { CreateCohortModal } from '../../../src/pages/Classes/components/CreateCohortModal';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

describe('create cohort modal', () => {
  it('opens the calendar on the first date the class can start', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth() + 3, 8);
    renderScreen(<CreateCohortModal close={vi.fn()} onCreate={onCreate} minDate={toDateKey(first)} />, {
      role: UserRole.Admin,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }));

    expect(screen.getByRole('button', { name: 'Escolher mês e ano' })).toHaveTextContent(
      `${MONTHS[first.getMonth()]} de ${first.getFullYear()}`,
    );
    expect(screen.getByRole('button', { name: '7' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: '8' }));
    await userEvent.click(screen.getByRole('button', { name: /Criar/ }));

    expect(onCreate).toHaveBeenCalledWith(toDateKey(first));
  });
});
