// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { EntryTypeTable } from '../../src/components/EntryTypeTable';
import { renderScreen } from '../support/render';

const rows = [
  { id: 'a', name: 'Adriana Pereira', entryType: 'baptism' as const },
  { id: 'b', name: 'Geraldo Souza', entryType: null, reviewReasons: ['CPF repetido'] },
];

describe('entry type table', () => {
  it('lists each person with the way they joined and any review reason', () => {
    renderScreen(<EntryTypeTable rows={rows} />);

    expect(screen.getByText('Batismo')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('CPF repetido')).toBeInTheDocument();
    expect(screen.getByText('Entrada')).toBeInTheDocument();
  });

  it('selects a person only when the screen asks for it', async () => {
    const onSelect = vi.fn();
    renderScreen(<EntryTypeTable rows={rows} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('Adriana Pereira'));

    expect(onSelect).toHaveBeenCalledWith('a');
  });
});
