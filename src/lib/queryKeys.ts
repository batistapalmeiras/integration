export const PIPELINE_ROOTS = ['people', 'person', 'coffee', 'cohorts', 'groups'] as const;

export const queryKeys = {
  visitors: ['people', 'visitors'] as const,
  members: ['people', 'members'] as const,
  memberNames: (withoutSmallGroup: boolean) => ['people', 'member-names', { withoutSmallGroup }] as const,
  membershipQueue: ['people', 'membership-queue'] as const,
  membershipPendingCount: ['people', 'membership-pending-count'] as const,
  memberPendencies: (params: object) => ['people', 'member-pendencies', params] as const,
  peopleList: (params: object) => ['people', 'list', params] as const,
  statusCounts: ['people', 'status-counts'] as const,
  annualYears: ['people', 'annual-years'] as const,
  annualReport: (year: number) => ['people', 'annual-report', year] as const,
  pastorDashboard: ['people', 'pastor-dashboard'] as const,
  integrationTeamDashboard: ['people', 'integration-team-dashboard'] as const,
  adminDashboard: ['people', 'admin-dashboard'] as const,
  teacherDashboard: ['cohorts', 'teacher-dashboard'] as const,
  memberBirthdays: ['people', 'birthdays'] as const,

  person: (id: string) => ['person', id] as const,
  personProfile: (id: string) => ['person', id, 'profile'] as const,
  personCoffeeAttendance: (id: string, status: string) => ['person', id, 'coffee-attendance', status] as const,
  personLastContactAttempt: (id: string, status: string) => ['person', id, 'last-contact-attempt', status] as const,
  personIntegrationClass: (id: string) => ['person', id, 'integration-class'] as const,
  personSensitive: (id: string) => ['person', id, 'sensitive'] as const,
  personMakeups: (id: string) => ['person', id, 'makeups'] as const,
  memberRecord: (id: string) => ['person', id, 'record'] as const,
  pastoralNotes: (id: string) => ['person', id, 'pastoral-notes'] as const,
  membershipAlerts: (id: string) => ['person', id, 'membership-alerts'] as const,

  coffeeBoard: ['coffee', 'board'] as const,
  coffeeHistory: ['coffee', 'history'] as const,
  hasUpcomingCoffeeEvent: ['coffee', 'has-upcoming'] as const,
  upcomingCoffeeEventDate: ['coffee', 'upcoming-date'] as const,

  cohortBoard: ['cohorts', 'board'] as const,
  hasUpcomingCohort: ['cohorts', 'has-upcoming'] as const,
  cohortNames: ['cohorts', 'names'] as const,
  cohortsReport: ['cohorts', 'report'] as const,
  cohortRoster: (id: string) => ['cohorts', 'roster', id] as const,

  publicCohortSchedule: ['public', 'cohort-schedule'] as const,
  publicMinistryNames: ['public', 'ministry-names'] as const,
  publicSmallGroups: ['public', 'small-groups'] as const,
  mustChangePassword: (userId: string) => ['profile', userId, 'must-change-password'] as const,

  smallGroups: ['reference', 'small-groups'] as const,
  ministries: ['reference', 'ministries'] as const,
  groupsWithCounts: (type: 'small-groups' | 'ministries') => ['groups', type] as const,
  groupDetail: (type: 'small-groups' | 'ministries', id: string) => ['groups', type, id] as const,

  volunteers: ['volunteers', 'list'] as const,
  volunteer: (id: string) => ['volunteers', id] as const,
  volunteerEmail: (id: string) => ['volunteers', id, 'email'] as const,
};

export const REFERENCE_STALE_TIME = 5 * 60_000;
