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
  CommunityGroupDetailPage,
  DashboardPage,
  IntegrationSignupPage,
  MakeupAttendancePage,
  MemberPendenciesPage,
  MemberRecordPage,
  MembersPage,
  MembershipInterestPage,
  MembershipInterestPreviewPage,
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
  VisitorEditPage,
  VisitorInfoPage,
  VisitorsPage,
  VolunteerDetailPage,
  VolunteersPage,
} from './pages';
import { AppRoute } from './paths';

export interface RouteDefinition {
  path: string;
  element: ReactNode;
  roles?: UserRole[];
}

const PASTOR = [UserRole.Pastor];

export const PUBLIC_ROUTES: RouteDefinition[] = [
  { path: AppRoute.IntegrationSignup, element: <IntegrationSignupPage /> },
  { path: `${AppRoute.MakeupAttendance}/:token`, element: <MakeupAttendancePage /> },
  { path: AppRoute.MembershipInterest, element: <MembershipInterestPage /> },
  { path: AppRoute.MembershipInterestPreview, element: <MembershipInterestPreviewPage /> },
];

export const PRIVATE_ROUTES: RouteDefinition[] = [
  { path: AppRoute.Dashboard, element: <DashboardPage /> },
  { path: AppRoute.Profile, element: <ProfilePage /> },
  { path: AppRoute.ChangePassword, element: <ChangePasswordPage /> },
  { path: AppRoute.ChurchMore, element: <ModuleMorePage areaId="church" />, roles: PASTOR },
  { path: AppRoute.IntegrationMore, element: <ModuleMorePage areaId="integration" />, roles: LEADERSHIP_ROLES },

  { path: AppRoute.Visitors, element: <VisitorsPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: AppRoute.NewVisitor, element: <NewVisitorPage />, roles: INTEGRATION_TEAM_ROLES },
  { path: `${AppRoute.Visitors}/:id`, element: <VisitorDetailPage />, roles: STAFF_ROLES },
  { path: `${AppRoute.Visitors}/:id/editar`, element: <VisitorEditPage />, roles: STAFF_ROLES },
  { path: `${AppRoute.Visitors}/:id/detalhes`, element: <VisitorInfoPage />, roles: STAFF_ROLES },
  { path: AppRoute.Coffee, element: <CoffeePage />, roles: INTEGRATION_TEAM_ROLES },
  { path: AppRoute.Classes, element: <ClassesPage />, roles: TEACHING_ROLES },
  { path: AppRoute.Membership, element: <MembershipPage />, roles: LEADERSHIP_ROLES },
  { path: AppRoute.People, element: <PeoplePage /> },

  { path: AppRoute.Members, element: <MembersPage />, roles: LEADERSHIP_ROLES },
  { path: AppRoute.MemberPendencies, element: <MemberPendenciesPage />, roles: PASTOR },
  { path: AppRoute.Birthdays, element: <BirthdaysPage />, roles: PASTOR },
  { path: `${AppRoute.Members}/:id/ficha`, element: <MemberRecordPage />, roles: PASTOR },
  { path: AppRoute.Ministries, element: <MinistriesPage />, roles: PASTOR },
  { path: AppRoute.SmallGroups, element: <SmallGroupsPage />, roles: PASTOR },
  { path: `${AppRoute.CommunityGroups}/:type/:id`, element: <CommunityGroupDetailPage />, roles: PASTOR },
  { path: AppRoute.Volunteers, element: <VolunteersPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Volunteers}/:id`, element: <VolunteerDetailPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Store}/*`, element: <StoreRoutes />, roles: PASTOR },

  { path: AppRoute.Reports, element: <ReportsPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/cafes`, element: <CoffeeHistoryPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/cafes/:id`, element: <CoffeeRosterPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/turmas`, element: <CohortsListPage />, roles: LEADERSHIP_ROLES },
  { path: `${AppRoute.Reports}/turmas/:id`, element: <CohortRosterPage />, roles: LEADERSHIP_ROLES },
];

export function canAccess(role: string | undefined, pathname: string): boolean {
  const route = matchRoutes(PRIVATE_ROUTES, pathname)?.[0]?.route;
  if (!route || !role) return false;
  return !route.roles || route.roles.includes(role as UserRole);
}
