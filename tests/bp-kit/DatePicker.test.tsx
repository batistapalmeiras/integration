// React
import { useForm } from 'react-hook-form';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from 'bp-kit';
// Local
import { renderScreen } from '../support/render';

let submitted = '';

function BirthDateField({ initial = '' }: { initial?: string }) {
  const { control, watch } = useForm<{ birthDate: string }>({ defaultValues: { birthDate: initial } });
  submitted = watch('birthDate');
  return <DatePicker label="Nascimento" control={control} name="birthDate" />;
}

describe('DatePicker', () => {
  it('reaches a date decades back through the year and month views', async () => {
    const user = userEvent.setup();
    renderScreen(<BirthDateField initial="2026-11-08" />);

    await user.click(screen.getByRole('button', { name: /8 de novembro de 2026/ }));
    await user.click(screen.getByRole('button', { name: 'Escolher mês e ano' }));
    for (let page = 0; page < 3; page++) await user.click(screen.getByRole('button', { name: 'Anos anteriores' }));
    await user.click(screen.getByRole('button', { name: '1990' }));
    await user.click(screen.getByRole('button', { name: 'Mar' }));
    await user.click(screen.getByRole('button', { name: '15' }));

    expect(submitted).toBe('1990-03-15');
    expect(screen.getByRole('button', { name: /15 de março de 1990/ })).toBeInTheDocument();
  });

  it('still moves month by month from the days view', async () => {
    const user = userEvent.setup();
    renderScreen(<BirthDateField initial="2026-01-10" />);

    await user.click(screen.getByRole('button', { name: /10 de janeiro de 2026/ }));
    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByRole('button', { name: 'Escolher mês e ano' })).toHaveTextContent('dezembro de 2025');
  });
});
