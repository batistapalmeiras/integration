// Libs
import { screen } from '@testing-library/react';
// Local
import { FamilyPanel } from '../../../src/pages/MemberProfile/components/FamilyPanel';
import { renderScreen } from '../../support/render';

describe('family panel', () => {
  it('always has the spouse and the children, even when they are not filled in', () => {
    renderScreen(<FamilyPanel family={[]} onEdit={vi.fn()} />);

    expect(screen.getByText('Cônjuge')).toBeInTheDocument();
    expect(screen.getByText('Filhos')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('lists the spouse and every child, and the other relatives only when they exist', () => {
    renderScreen(
      <FamilyPanel
        family={[
          { id: 'a', name: 'Maria Souza', relation: 'spouse', gender: 'female' },
          { id: 'b', name: 'Pedro Souza', relation: 'child', gender: 'male' },
          { id: 'c', name: 'Lia Souza', relation: 'child', gender: 'female' },
          { id: 'd', name: 'Gabriel Lima', relation: 'sibling', gender: 'male' },
        ]}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Maria Souza' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedro Souza' })).toHaveAttribute('href', expect.stringContaining('/b'));
    expect(screen.getByRole('link', { name: 'Lia Souza' })).toBeInTheDocument();
    expect(screen.getByText('Irmão')).toBeInTheDocument();
    expect(screen.queryByText('Cunhado(a)')).not.toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('falls back to the neutral name when the gender of another relative is not known', () => {
    renderScreen(
      <FamilyPanel family={[{ id: 'c', name: 'Lia Souza', relation: 'sibling', gender: null }]} onEdit={vi.fn()} />,
    );

    expect(screen.getByText('Irmão(ã)')).toBeInTheDocument();
  });
});
