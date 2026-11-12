// Libs
import { screen } from '@testing-library/react';
import { UsersRound } from 'lucide-react';
// Local
import { CountBadge } from '../../src/components/CountBadge';
import { renderScreen } from '../support/render';

describe('count badge', () => {
  it('uses the singular only for one item', () => {
    renderScreen(
      <>
        <CountBadge icon={UsersRound} count={1} singular="PG" plural="PGs" />
        <CountBadge icon={UsersRound} count={0} singular="voluntário" plural="voluntários" />
      </>,
    );
    expect(screen.getByText('1 PG')).toBeInTheDocument();
    expect(screen.getByText('0 voluntários')).toBeInTheDocument();
  });
});
