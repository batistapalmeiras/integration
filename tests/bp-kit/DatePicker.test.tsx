// React
import { useForm } from 'react-hook-form';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from 'bp-kit';
// Local
import { renderScreen } from '../support/render';

let submitted = '';

function BirthDateField({ initial = '', noFuture = false }: { initial?: string; noFuture?: boolean }) {
  const { control, watch } = useForm<{ birthDate: string }>({ defaultValues: { birthDate: initial } });
  submitted = watch('birthDate');
  return (
    <DatePicker
      label="Nascimento"
      control={control}
      name="birthDate"
      isDateDisabled={noFuture ? (date) => date > new Date() : undefined}
    />
  );
}

describe('DatePicker', () => {
  it('takes a typed date and keeps the field empty until it is a real date', async () => {
    const user = userEvent.setup();
    renderScreen(<BirthDateField />);

    await user.type(screen.getByRole('textbox'), '3102');
    expect(screen.getByRole('textbox')).toHaveValue('31/02');
    expect(submitted).toBe('');

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '06011978');
    expect(screen.getByRole('textbox')).toHaveValue('06/01/1978');
    expect(submitted).toBe('1978-01-06');
  });

  it('shows the date in full when the field loses focus and as dd/mm/aaaa when it gains it', async () => {
    const user = userEvent.setup();
    renderScreen(<BirthDateField initial="1996-09-13" />);

    expect(screen.getByRole('textbox')).toHaveValue('13 de Setembro de 1996');
    await user.click(screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toHaveValue('13/09/1996');
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveValue('13 de Setembro de 1996');
  });

  it('refuses a date the screen disabled', async () => {
    const user = userEvent.setup();
    renderScreen(<BirthDateField noFuture />);

    await user.type(screen.getByRole('textbox'), '01012999');

    expect(submitted).toBe('');
  });
});
