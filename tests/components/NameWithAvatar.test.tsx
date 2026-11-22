// Libs
import { screen } from '@testing-library/react';
// Local
import { NameWithAvatar } from '../../src/components/NameWithAvatar';
import { renderScreen } from '../support/render';

describe('name with avatar', () => {
  it('puts the initials of the person before the name', () => {
    const { container } = renderScreen(<NameWithAvatar name="Ana Cláudia Oliveira" />);

    expect(container).toHaveTextContent('AO');
    expect(screen.getByText('Ana Cláudia Oliveira')).toBeInTheDocument();
  });

  it('keeps what goes under the name next to the avatar', () => {
    renderScreen(<NameWithAvatar name="Bruno Alves">2 de 4 aulas</NameWithAvatar>);

    expect(screen.getByText('Bruno Alves')).toBeInTheDocument();
    expect(screen.getByText('2 de 4 aulas')).toBeInTheDocument();
  });
});
