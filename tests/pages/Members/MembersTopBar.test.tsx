// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { MembersTopBar } from '../../../src/pages/Members/components/MembersTopBar';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

describe('members top bar', () => {
  it('goes back to the area and shows the filters once the search row is gone', async () => {
    const onFilters = vi.fn();
    renderScreen(<MembersTopBar back title="Igreja" showFilters filterCount={2} onFilters={onFilters} />, {
      role: UserRole.Pastor,
    });

    expect(screen.getByRole('button', { name: 'Igreja' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filtros' })).toHaveTextContent('2');

    await userEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    expect(onFilters).toHaveBeenCalled();
  });

  it('keeps only the title while the search row is on screen', () => {
    renderScreen(<MembersTopBar back={false} title="Membros" showFilters={false} filterCount={0} onFilters={vi.fn()} />, {
      role: UserRole.Pastor,
    });

    expect(screen.getByText('Membros')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filtros' })).not.toBeInTheDocument();
  });
});
