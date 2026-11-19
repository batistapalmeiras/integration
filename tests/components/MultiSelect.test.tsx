// React
import { useState } from 'react';
// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from 'bp-kit';
// Local
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

const MINISTRIES = ['60+', 'Café Integração', 'Cobertura', 'Louvor'].map((name) => ({ value: name, label: name }));

function Field({ initial }: { initial: string[] }) {
  const [value, setValue] = useState(initial);
  return (
    <MultiSelect
      label="Ministérios"
      options={MINISTRIES}
      value={value}
      onChange={setValue}
      placeholder="Buscar pelo Ministério…"
      emptyText="Nenhum por enquanto"
    />
  );
}

describe('multi select', () => {
  it('sums up the picked items in one line instead of chips', () => {
    renderScreen(<Field initial={['60+', 'Café Integração', 'Cobertura']} />, { role: UserRole.Pastor });

    expect(screen.getByRole('button', { name: 'Ministérios' })).toHaveTextContent('60+, Café Integração e mais 1');
  });

  it('closes the list after picking a searched item', async () => {
    renderScreen(<Field initial={[]} />, { role: UserRole.Pastor });

    expect(screen.getByRole('button', { name: 'Ministérios' })).toHaveTextContent('Nenhum por enquanto');

    await userEvent.click(screen.getByRole('button', { name: 'Ministérios' }));
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar pelo Ministério…' }), 'lou');

    expect(screen.queryByRole('checkbox', { name: '60+' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Louvor' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ministérios' })).toHaveTextContent('Louvor');
  });

  it('keeps the list open to pick several items while the search is empty', async () => {
    renderScreen(<Field initial={[]} />, { role: UserRole.Pastor });

    await userEvent.click(screen.getByRole('button', { name: 'Ministérios' }));
    await userEvent.click(screen.getByRole('checkbox', { name: '60+' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Louvor' }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ministérios' })).toHaveTextContent('60+, Louvor');
  });
});
