// Libs
import { screen } from '@testing-library/react';
// Local
import { FamilyPanel } from '../../../src/pages/MemberProfile/components/FamilyPanel';
import { renderScreen } from '../../support/render';

describe('family panel', () => {
  it('names each relative by the link and the gender and shows nothing for what is not filled in', () => {
    renderScreen(
      <FamilyPanel
        family={[
          { id: 'a', name: 'Maria Souza', relation: 'spouse', gender: 'female' },
          { id: 'b', name: 'Pedro Souza', relation: 'child', gender: 'male' },
        ]}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Cônjuge')).toBeInTheDocument();
    expect(screen.getByText('Filho')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedro Souza' })).toHaveAttribute('href', expect.stringContaining('/b'));
    expect(screen.queryByText('Cunhado(a)')).not.toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('falls back to the neutral name when the gender is not known', () => {
    renderScreen(
      <FamilyPanel family={[{ id: 'c', name: 'Lia Souza', relation: 'sibling', gender: null }]} onEdit={vi.fn()} />,
    );

    expect(screen.getByText('Irmão(ã)')).toBeInTheDocument();
  });

  it('keeps only the title and the edit link when there is no family yet', () => {
    renderScreen(<FamilyPanel family={[]} onEdit={vi.fn()} />);

    expect(screen.getByText('Família')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });
});
