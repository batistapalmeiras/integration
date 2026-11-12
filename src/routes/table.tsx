// React
import { ReactNode } from 'react';
import { matchRoutes } from 'react-router-dom';
// Libs
import { ChangePasswordPage } from 'bp-kit';
// Local
import { INTEGRATION_TEAM_ROLES, LEADERSHIP_ROLES, STAFF_ROLES, TEACHING_ROLES, UserRole } from '../types/enums';
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
  MemberPendenciesPage,
  MemberProfilePage,
  ConfirmMemberPage,
  MembersPage,
  MembershipInterestPage,
  MembershipSignupPage,
  MembershipPage,
  MinistriesPage,
  ModuleMorePage,
  NewVisitorPage,
  PeoplePage,
  ProfilePage,
  ReportsPage,
  SmallGroupsPage,
  StoreRoutes,
  VisitorDetailPage,
  VisitorInfoPage,
  ArchivedVisitorsPage,
  VisitorsPage,
  VolunteerDetailPage,
  VolunteersPage,
} from './pages';
import { AppRoute, COUNCILS_PATH, isEntityId } from './paths';

export interface RouteTarget {
  element: ReactNode;
  roles?: UserRole[];
}

export interface RouteDefinition extends RouteTarget {
  path: string;
  list?: RouteTarget;
}

const PASTOR = [UserRole.Pastor];

const VISITORS_LIST: RouteTarget = { element: <VisitorsPage />, roles: INTEGRATION_TEAM_ROLES };
const MEMBERS_LIST: RouteTarget = { element: <MembersPage />, roles: LEADERSHIP_ROLES };

export const PUBLIC_ROUTES: RouteDefinition[] = [
  { path: AppRoute.IntegrationSignup, element: <IntegrationSignupPage /> },
  { path: `${AppRoute.MakeupAttendance}/:token`, element: <MakeupAttendancePage /> },
  { path: AppRoute.MembershipInterest, element: <MembershipInterestPage /> },
  { path: AppRoute.MembershipSignup, element: <MembershipSignupPage /> },
];

export const PRIVATE_ROUTES: RouteDefinition[] = [
  { path: AppRoute.Dashboard, element: <DashboardPage /> },
  { path: AppRoute.Profile, element: <ProfilePage /> },
  { path: AppRoute.ChangePassword, element: <ChangePasswordPage /> },
  { path: AppRoute.ChurchMore, element: <ModuleMorePage areaId="church" />, roles: PASTOR },
  { path: AppRoute.IntegrationMore, element: <ModuleMorePage areaId="integration" />, roles: INTEGRATION_TEAM_ROLES },

  { path: `${AppRoute.Visitors}/*`, ...VISITORS_LIST },
  { path: AppRoute.ArchivedVisitors, element: <ArchivedVisitorsPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: AppRoute.NewVisitor, element: <NewVisitorPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: `${AppRoute.Visitors}/:id`, element: <VisitorDetailPage />, roles: STAFF_ROLES, list: VISITORS_LIST },
  { path: `${AppRoute.Visitors}/:id/detalhes`, element: <VisitorInfoPage />, roles: STAFF_ROLES },
  { path: `${AppRoute.Coffee}/*`, element: <CoffeePage />, roles: INTEGRATION_TEAM_ROLES },
  { path: AppRoute.Classes, element: <ClassesPage />, roles: TEACHING_ROLES },
  { path: AppRoute.Membership, element: <MembershipPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Membership}/:id/confirmar`, element: <ConfirmMemberPage />, roles: PASTOR },
  { path: `${AppRoute.People}/*`, element: <PeoplePage /> },

  { path: `${AppRoute.Members}/*`, ...MEMBERS_LIST },
  { path: `${AppRoute.MemberPendencies}/*`, element: <MemberPendenciesPage />, roles: PASTOR },
  { path: AppRoute.Birthdays, element: <BirthdaysPage />, roles: PASTOR },
  { path: `${AppRoute.Members}/:id`, element: <MemberProfilePage />, roles: PASTOR, list: MEMBERS_LIST },
  { path: AppRoute.Ministries, element: <MinistriesPage />, roles: PASTOR },
  { path: AppRoute.SmallGroups, element: <SmallGroupsPage />, roles: PASTOR },
  { path: `${AppRoute.CommunityGroups}/:type/:id`, element: <CommunityGroupDetailPage />, roles: PASTOR },
  { path: AppRoute.Volunteers, element: <VolunteersPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Volunteers}/:id`, element: <VolunteerDetailPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Store}/*`, element: <StoreRoutes />, roles: PASTOR },

  { path: AppRoute.Reports, element: <ReportsPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/cafes`, element: <CoffeeHistoryPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: `${AppRoute.Reports}/cafes/:id`, element: <CoffeeRosterPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: `${AppRoute.Reports}/turmas`, element: <CohortsListPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: COUNCILS_PATH, element: <CouncilsPage />, roles: LEADERSHIP_ROLES },
  { path: `${COUNCILS_PATH}/:id`, element: <CouncilRosterPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/turmas/:id`, element: <CohortRosterPage />, roles: INTEGRATION_TEAM_ROLES },
];

export function canAccess(role: string | undefined, pathname: string): boolean {
  const match = matchRoutes(PRIVATE_ROUTES, pathname)?.[0];
  if (!match || !role) return false;
  const { route, params } = match;
  const target = route.list && !isEntityId(params.id) ? route.list : route;
  return !target.roles || target.roles.some((allowed) => allowed === role);
}
