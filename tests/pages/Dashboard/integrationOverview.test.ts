// Local
import { loadIntegrationOverview } from '../../../src/pages/Dashboard/hooks/integrationOverview';

vi.mock('../../../src/repositories/cafeSchedule', () => ({ getUpcomingCoffeeRoster: vi.fn().mockResolvedValue(null) }));
vi.mock('../../../src/repositories/classesRoster', () => ({
  getUpcomingCohortWithLessons: vi.fn().mockResolvedValue(null),
}));
vi.mock('../../../src/repositories/lessonMakeups', () => ({ listRecentMakeupNotes: vi.fn().mockResolvedValue([]) }));
vi.mock('../../../src/repositories/integrationPeople', () => ({
  countIntegrationPeopleByStatus: vi.fn().mockResolvedValue({ integration: 8, welcome_coffee: 5 }),
}));
vi.mock('../../../src/repositories/membership', () => ({ countMembershipPending: vi.fn().mockResolvedValue(3) }));

describe('integration overview', () => {
  it('counts everyone waiting for the membership, also who signed up directly and never went through the integration', async () => {
    const { funnel } = await loadIntegrationOverview();

    expect(funnel.membership_pending).toBe(3);
    expect(funnel.integration).toBe(8);
  });
});
