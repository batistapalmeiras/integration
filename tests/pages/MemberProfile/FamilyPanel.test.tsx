// Libs
import { screen } from '@testing-library/react';
// Local
import { FamilyPanel } from '../../../src/pages/MemberProfile/components/FamilyPanel';
import { renderScreen } from '../../support/render';

describe('family panel', () => {
  it('names each relative by the link and shows nothing for what is not filled in', () => {
    renderScreen(
      <FamilyPanel
        family={[
          { id: 'a', name: 'Maria Souza', relation: 'spouse' },
          { id: 'b', name: 'Pedro Souza', relation: 'son' },
        ]}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Cônjuge')).toBeInTheDocument();
    expect(screen.getByText('Filho')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedro Souza' })).toHaveAttribute('href', expect.stringContaining('/b'));
    expect(screen.queryByText('Irmão(ã)')).not.toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('keeps only the title and the edit link when there is no family yet', () => {
    renderScreen(<FamilyPanel family={[]} onEdit={vi.fn()} />);

    expect(screen.getByText('Família')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });
});
