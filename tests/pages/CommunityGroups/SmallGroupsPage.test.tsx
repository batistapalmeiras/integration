// Libs
import { screen } from '@testing-library/react';
// Local
import { clearQueries } from '../../../src/lib/queryCache';
import { SmallGroupsPage } from '../../../src/pages/CommunityGroups/SmallGroups';
import { countSmallGroupPeople, listSmallGroupsWithCounts } from '../../../src/repositories/communityGroups';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/communityGroups', () => ({
  listSmallGroupsWithCounts: vi.fn(),
  countSmallGroupPeople: vi.fn(),
  createSmallGroup: vi.fn(),
}));

describe('small groups page', () => {
  afterEach(() => clearQueries());

  it('shows how many small groups there are and how many people are in them', async () => {
    vi.mocked(listSmallGroupsWithCounts).mockResolvedValue([
      { id: 'g1', name: 'Doris', meetingDay: 'tuesday', peopleCount: 7 },
      { id: 'g2', name: 'Marcos', meetingDay: 'thursday', peopleCount: 7 },
    ]);
    vi.mocked(countSmallGroupPeople).mockResolvedValue(12);

    renderScreen(<SmallGroupsPage />, { role: UserRole.Pastor });

    expect(await screen.findByText('2 PGs')).toBeInTheDocument();
    expect(await screen.findByText('12 pessoas')).toBeInTheDocument();
  });
});
