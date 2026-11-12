// React
import { ComponentType, lazy } from 'react';
// Local
import { markPageLoaded } from '../pwa';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyPage<Module extends Record<Key, ComponentType<any>>, Key extends keyof Module>(
  load: () => Promise<Module>,
  key: Key,
) {
  return lazy(() =>
    load().then((module) => {
      markPageLoaded();
      return { default: module[key] };
    }),
  );
}

export const LoginPage = lazyPage(() => import('../pages/Auth'), 'LoginPage');
export const ForgotPasswordPage = lazyPage(() => import('../pages/Auth'), 'ForgotPasswordPage');
export const ResetPasswordPage = lazyPage(() => import('../pages/Auth'), 'ResetPasswordPage');
export const AuthPages = lazyPage(() => import('../pages/Auth'), 'AuthPages');

export const IntegrationSignupPage = lazyPage(() => import('../pages/IntegrationSignup'), 'IntegrationSignupPage');
export const MakeupAttendancePage = lazyPage(() => import('../pages/MakeupAttendance'), 'MakeupAttendancePage');
export const MembershipInterestPage = lazyPage(() => import('../pages/MembershipInterest'), 'MembershipInterestPage');
export const MembershipSignupPage = lazyPage(() => import('../pages/MembershipSignup'), 'MembershipSignupPage');

export const DashboardPage = lazyPage(() => import('../pages/Dashboard'), 'DashboardPage');
export const ModuleMorePage = lazyPage(() => import('../pages/ModuleMore'), 'ModuleMorePage');
export const ProfilePage = lazyPage(() => import('../pages/Profile'), 'ProfilePage');

export const VisitorsPage = lazyPage(() => import('../pages/Visitors'), 'VisitorsPage');
export const ArchivedVisitorsPage = lazyPage(() => import('../pages/Visitors/Archived'), 'ArchivedVisitorsPage');
export const NewVisitorPage = lazyPage(() => import('../pages/Visitors/New'), 'NewVisitorPage');
export const VisitorDetailPage = lazyPage(() => import('../pages/Visitors/Detail'), 'VisitorDetailPage');
export const VisitorInfoPage = lazyPage(() => import('../pages/Visitors/Info'), 'VisitorInfoPage');
export const CoffeePage = lazyPage(() => import('../pages/Coffee'), 'CoffeePage');
export const ClassesPage = lazyPage(() => import('../pages/Classes'), 'ClassesPage');
export const MembershipPage = lazyPage(() => import('../pages/Membership'), 'MembershipPage');
export const ConfirmMemberPage = lazyPage(() => import('../pages/ConfirmMember'), 'ConfirmMemberPage');
export const PeoplePage = lazyPage(() => import('../pages/People'), 'PeoplePage');

export const MembersPage = lazyPage(() => import('../pages/Members'), 'MembersPage');
export const MemberPendenciesPage = lazyPage(() => import('../pages/MemberPendencies'), 'MemberPendenciesPage');
export const MemberProfilePage = lazyPage(() => import('../pages/MemberProfile'), 'MemberProfilePage');
export const BirthdaysPage = lazyPage(() => import('../pages/Birthdays'), 'BirthdaysPage');
export const MinistriesPage = lazyPage(() => import('../pages/CommunityGroups/Ministries'), 'MinistriesPage');
export const SmallGroupsPage = lazyPage(() => import('../pages/CommunityGroups/SmallGroups'), 'SmallGroupsPage');
export const CommunityGroupDetailPage = lazyPage(
  () => import('../pages/CommunityGroups/Detail'),
  'CommunityGroupDetailPage',
);
export const VolunteersPage = lazyPage(() => import('../pages/Volunteers'), 'VolunteersPage');
export const VolunteerDetailPage = lazyPage(() => import('../pages/Volunteers/Detail'), 'VolunteerDetailPage');

export const ReportsPage = lazyPage(() => import('../pages/Reports'), 'ReportsPage');
export const CoffeeHistoryPage = lazyPage(
  () => import('../pages/Reports/components/CoffeeHistoryPage'),
  'CoffeeHistoryPage',
);
export const CoffeeRosterPage = lazyPage(
  () => import('../pages/Reports/components/CoffeeRosterPage'),
  'CoffeeRosterPage',
);
export const CouncilsPage = lazyPage(() => import('../pages/Reports/components/CouncilsPage'), 'CouncilsPage');
export const CouncilRosterPage = lazyPage(
  () => import('../pages/Reports/components/CouncilRosterPage'),
  'CouncilRosterPage',
);
export const CohortsListPage = lazyPage(() => import('../pages/Reports/components/CohortsListPage'), 'CohortsListPage');
export const CohortRosterPage = lazyPage(
  () => import('../pages/Reports/components/CohortRosterPage'),
  'CohortRosterPage',
);

export const StoreRoutes = lazyPage(() => import('../pages/Store/routes'), 'StoreRoutes');
