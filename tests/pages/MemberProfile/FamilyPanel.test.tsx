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
          { id: 'a', name: 'Maria Souza', relation: 'spouse', gender: 'female', derived: false },
          { id: 'b', name: 'Pedro Souza', relation: 'child', gender: 'male', derived: false },
          { id: 'c', name: 'Lia Souza', relation: 'child', gender: 'female', derived: false },
          { id: 'd', name: 'Gabriel Lima', relation: 'sibling', gender: 'male', derived: false },
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
      <FamilyPanel family={[{ id: 'c', name: 'Lia Souza', relation: 'sibling', gender: null, derived: false }]} onEdit={vi.fn()} />,
    );

    expect(screen.getByText('Irmão(ã)')).toBeInTheDocument();
  });

  it('groups relatives of the same kind under one plural label, with every name beneath', () => {
    renderScreen(
      <FamilyPanel
        family={[
          { id: 'a', name: 'Daniel Braga', relation: 'uncle', gender: 'male', derived: true },
          { id: 'b', name: 'Ruth Braga', relation: 'uncle', gender: 'female', derived: true },
          { id: 'c', name: 'Joel Florenzano', relation: 'grandfather', gender: 'male', derived: true },
          { id: 'd', name: 'Lael Florenzano', relation: 'grandmother', gender: 'female', derived: true },
          { id: 'e', name: 'Ana Lima', relation: 'sibling_in_law', gender: 'female', derived: false },
        ]}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Tios')).toBeInTheDocument();
    expect(screen.getByText('Avós')).toBeInTheDocument();
    expect(screen.getByText('Cunhada')).toBeInTheDocument();
    expect(screen.queryByText('Tio')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Daniel Braga' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ruth Braga' })).toBeInTheDocument();
  });
});
