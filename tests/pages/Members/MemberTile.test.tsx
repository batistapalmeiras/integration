// Libs
import { screen } from '@testing-library/react';
// Local
import { MemberTileContent } from '../../../src/pages/Members/components/MemberEntries';
import { MemberRow } from '../../../src/repositories/memberRecords';
import { renderScreen } from '../../support/render';

const member = (overrides: Partial<MemberRow> = {}) => ({ id: 'm1', name: 'Ana Souza', membership_status: 'active', ...overrides }) as MemberRow;

describe('member tile', () => {
  it('shows the photo, the name and the status as plain text', () => {
    const { container } = renderScreen(<MemberTileContent member={member()} photoUrl="https://example.com/ana.jpg" />);

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/ana.jpg');
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('keeps a placeholder, and the right status, when there is no photo', () => {
    const { container } = renderScreen(
      <MemberTileContent member={member({ membership_status: 'transferred' })} photoUrl={null} />,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Transferido')).toBeInTheDocument();
  });
});
