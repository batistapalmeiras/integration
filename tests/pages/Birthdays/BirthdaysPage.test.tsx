// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { todayKey } from '../../../src/domain/dates';
import { BirthdaysPage } from '../../../src/pages/Birthdays';
import { listMemberBirthdays } from '../../../src/repositories/birthdays';
import { AppRoute } from '../../../src/routes/paths';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/birthdays', () => ({ listMemberBirthdays: vi.fn() }));

const YEAR = todayKey().slice(0, 4);
const MARCH = `${AppRoute.Birthdays}?month=3`;

describe('birthdays page', () => {
  beforeEach(() => {
    vi.mocked(listMemberBirthdays).mockResolvedValue([
      { personId: 'a', name: 'Ana', birthDate: '1985-03-20', phone: '31988887777' },
      { personId: 'b', name: 'Bruno', birthDate: '1990-03-02', phone: null },
      { personId: 'c', name: 'Carla', birthDate: '1970-04-01', phone: '31911112222' },
    ]);
  });

  it('shows the month birthdays in day order, under the current year', async () => {
    renderScreen(<BirthdaysPage />, { role: UserRole.Pastor, route: MARCH });
    expect(await screen.findByText(`Aniversariantes ${YEAR}`)).toBeInTheDocument();
    const names = screen.getAllByText(/^(Ana|Bruno|Carla)$/).map((node) => node.textContent);
    expect(names).toEqual(['Bruno', 'Ana']);
    expect(screen.getByText('2 aniversariantes')).toBeInTheDocument();
  });

  it('copies date, name and phone for each person', async () => {
    const user = userEvent.setup();
    renderScreen(<BirthdaysPage />, { role: UserRole.Pastor, route: MARCH });
    await user.click(await screen.findByRole('button', { name: /Copiar lista/ }));
    expect(await navigator.clipboard.readText()).toBe(
      [`Aniversariantes de março de ${YEAR}`, '02/03 · Bruno · sem celular', '20/03 · Ana · (31) 98888-7777'].join(
        '\n\n',
      ),
    );
    expect(await screen.findByText('Lista copiada.')).toBeInTheDocument();
  });
});
