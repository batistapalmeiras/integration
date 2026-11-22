// React
import { ReactNode } from 'react';
import { matchRoutes } from 'react-router-dom';
// Libs
import { ChangePasswordPage } from 'bp-kit';
// Local
import {
  INTEGRATION_TEAM_ROLES,
  LEADERSHIP_ROLES,
  STAFF_ROLES,
  SystemModule,
  TEACHING_ROLES,
  UserRole,
} from '../types/enums';
import { OwnProfileRedirect } from '../pages/Profile/OwnProfileRedirect';
import { ProfileShell } from '../pages/Profile/components/ProfileShell';
import { LogoutSection } from '../pages/Profile/components/LogoutSection';
import {
  BirthdaysPage,
  ClassesPage,
  CoffeeHistoryPage,
  CoffeePage,
  CoffeeRosterPage,
  CohortRosterPage,
  CohortsListPage,
  CouncilRosterPage,
  CouncilsPage,
  CommunityGroupDetailPage,
  DashboardPage,
  IntegrationSignupPage,
  MakeupAttendancePage,
  MemberProfilePage,
  ConfirmMemberPage,
  MembersPage,
  MembershipInterestPage,
  MembershipSignupPage,
  MembershipPage,
  MinistriesPage,
  ModuleMorePage,
  ProfilePage,
  ReportsPage,
  SmallGroupsPage,
  StoreRoutes,
  VisitorDetailPage,
  VisitorInfoPage,
  ArchivedVisitorsPage,
  VisitorsPage,
  ViewRolePage,
  VolunteersPage,
} from './pages';
import { AppRoute, COUNCILS_PATH, isEntityId } from './paths';

export interface RouteTarget {
  element: ReactNode;
  roles?: UserRole[];
  standalone?: boolean;
}

export interface RouteDefinition extends RouteTarget {
  path: string;
  list?: RouteTarget;
  module?: SystemModule;
}

const GENERAL_ADMIN = [UserRole.GeneralAdmin];

const VISITORS_LIST: RouteTarget = { element: <VisitorsPage />, roles: INTEGRATION_TEAM_ROLES };
const CHURCH = SystemModule.Church;

const MEMBERS_LIST: RouteTarget = { element: <MembersPage />, roles: GENERAL_ADMIN };

export const PUBLIC_ROUTES: RouteDefinition[] = [
  { path: AppRoute.IntegrationSignup, element: <IntegrationSignupPage /> },
  { path: `${AppRoute.MakeupAttendance}/:token`, element: <MakeupAttendancePage /> },
  { path: AppRoute.MembershipInterest, element: <MembershipInterestPage /> },
  { path: AppRoute.MembershipSignup, element: <MembershipSignupPage /> },
];

export const PRIVATE_ROUTES: RouteDefinition[] = [
  { path: AppRoute.Dashboard, element: <DashboardPage /> },
  { path: AppRoute.Profile, module: CHURCH, standalone: true, element: <OwnProfileRedirect /> },
  { path: `${AppRoute.Profile}/:id`, module: CHURCH, standalone: true, element: <ProfilePage /> },
  { path: `${AppRoute.Profile}/:id/:section`, module: CHURCH, standalone: true, element: <ProfilePage /> },
  {
    path: AppRoute.ChangePassword,
    module: CHURCH,
    standalone: true,
    element: (
      <ProfileShell>
        <ChangePasswordPage back={false} />
        <LogoutSection />
      </ProfileShell>
    ),
  },
  {
    path: AppRoute.ProfileView,
    module: CHURCH,
    standalone: true,
    element: (
      <ProfileShell>
        <ViewRolePage />
      </ProfileShell>
    ),
  },
  { path: AppRoute.IntegrationMore, element: <ModuleMorePage areaId="integration" />, roles: LEADERSHIP_ROLES },

  { path: `${AppRoute.Visitors}/*`, ...VISITORS_LIST },
  { path: AppRoute.ArchivedVisitors, element: <ArchivedVisitorsPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: `${AppRoute.Visitors}/:id`, element: <VisitorDetailPage />, roles: STAFF_ROLES, list: VISITORS_LIST },
  { path: `${AppRoute.Visitors}/:id/detalhes`, element: <VisitorInfoPage />, roles: STAFF_ROLES },
  { path: `${AppRoute.Coffee}/*`, element: <CoffeePage />, roles: INTEGRATION_TEAM_ROLES },
  { path: AppRoute.Classes, element: <ClassesPage />, roles: TEACHING_ROLES },
  { path: AppRoute.Membership, element: <MembershipPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Membership}/:id/confirmar`, element: <ConfirmMemberPage />, roles: GENERAL_ADMIN },

  { path: `${AppRoute.Members}/*`, module: CHURCH, ...MEMBERS_LIST },
  { path: AppRoute.Birthdays, module: CHURCH, element: <BirthdaysPage />, roles: GENERAL_ADMIN },
  {
    path: `${AppRoute.Members}/:id`,
    module: CHURCH,
    standalone: true,
    element: <MemberProfilePage />,
    roles: GENERAL_ADMIN,
    list: MEMBERS_LIST,
  },
  {
    path: `${AppRoute.Members}/:id/:section`,
    module: CHURCH,
    standalone: true,
    element: <MemberProfilePage />,
    roles: GENERAL_ADMIN,
    list: MEMBERS_LIST,
  },
  { path: AppRoute.Ministries, module: CHURCH, element: <MinistriesPage />, roles: GENERAL_ADMIN },
  { path: AppRoute.SmallGroups, module: CHURCH, element: <SmallGroupsPage />, roles: GENERAL_ADMIN },
  {
    path: `${AppRoute.CommunityGroups}/:type/:id`,
    module: CHURCH,
    element: <CommunityGroupDetailPage />,
    roles: GENERAL_ADMIN,
  },
  { path: AppRoute.Volunteers, module: CHURCH, element: <VolunteersPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Store}/*`, module: CHURCH, element: <StoreRoutes />, roles: GENERAL_ADMIN },

  { path: AppRoute.Reports, element: <ReportsPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/cafes`, element: <CoffeeHistoryPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: `${AppRoute.Reports}/cafes/:id`, element: <CoffeeRosterPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: `${AppRoute.Reports}/turmas`, element: <CohortsListPage />, roles: LEADERSHIP_ROLES },
  { path: COUNCILS_PATH, element: <CouncilsPage />, roles: LEADERSHIP_ROLES },
  { path: `${COUNCILS_PATH}/:id`, element: <CouncilRosterPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/turmas/:id`, element: <CohortRosterPage />, roles: LEADERSHIP_ROLES },
];

export function isStandalone(pathname: string): boolean {
  const match = matchRoutes(PRIVATE_ROUTES, pathname)?.[0];
  if (!match) return false;
  const { route, params } = match;
  const target = route.list && !isEntityId(params.id) ? route.list : route;
  return !!target.standalone;
}

export function moduleOf(pathname: string): SystemModule {
  return matchRoutes(PRIVATE_ROUTES, pathname)?.[0]?.route.module ?? SystemModule.Integration;
}

export function canAccess(role: string | undefined, pathname: string): boolean {
  const match = matchRoutes(PRIVATE_ROUTES, pathname)?.[0];
  if (!match || !role) return false;
  const { route, params } = match;
  const target = route.list && !isEntityId(params.id) ? route.list : route;
  return !target.roles || target.roles.some((allowed) => allowed === role);
}
