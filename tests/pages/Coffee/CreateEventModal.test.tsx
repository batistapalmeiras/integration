// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { CreateEventModal } from '../../../src/pages/Coffee/components/CreateEventModal';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

describe('create coffee event modal', () => {
  it('picks a Sunday from the calendar, with the other days blocked', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    renderScreen(<CreateEventModal close={vi.fn()} onCreate={onCreate} initialDate="2026-12-06" />, {
      role: UserRole.Admin,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }));

    expect(screen.getByRole('button', { name: 'Escolher mês e ano' })).toHaveTextContent('Dezembro de 2026');
    expect(screen.getByRole('button', { name: '12' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: '13' }));
    expect(screen.queryByRole('button', { name: 'Escolher mês e ano' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Salvar/ }));
    expect(onCreate).toHaveBeenCalledWith('2026-12-13');
  });
});
