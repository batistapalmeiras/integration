// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { HistoryCard } from '../../src/components/History';
import { renderScreen } from '../support/render';

const entry = (day: number, label: string, actor: string | null = null) => ({
  date: `2026-10-${String(day).padStart(2, '0')}`,
  at: `2026-10-${String(day).padStart(2, '0')}T15:00:00Z`,
  label,
  detail: null,
  actor,
});

describe('history card', () => {
  it('shows nothing when there is no history and no text for it', () => {
    const { container } = renderScreen(<HistoryCard title="Histórico" modalTitle="Histórico" entries={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the empty text when the screen asks for one', () => {
    renderScreen(<HistoryCard title="Histórico" modalTitle="Histórico" entries={[]} emptyText="Ainda não há registros." />);

    expect(screen.getByText('Ainda não há registros.')).toBeInTheDocument();
  });

  it('shortens a long history and opens every event with who did it in the modal', async () => {
    renderScreen(
      <HistoryCard
        title="Histórico da Membresia"
        modalTitle="Membresia de Ana"
        entries={[
          entry(1, 'Um', 'Ana'),
          entry(2, 'Dois', 'Ana'),
          entry(3, 'Três', 'Bruno'),
          entry(4, 'Quatro', 'Bruno'),
          entry(5, 'Cinco', 'Sistema'),
        ]}
      />,
    );

    expect(screen.queryByText('Quatro')).not.toBeInTheDocument();
    expect(screen.getByText('Cinco')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Ver histórico completo'));

    expect(await screen.findByText('Quatro')).toBeInTheDocument();
    expect(screen.getByText('Membresia de Ana')).toBeInTheDocument();
    expect(screen.getAllByText('Bruno')).toHaveLength(2);
  });
});
