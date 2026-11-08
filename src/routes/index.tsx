// React
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Libs
import { AuthProvider, ChangePasswordPage, Skeleton } from 'bp-kit';
// Components
import { Layout } from '../components/Layout';
import { PasswordGate } from '../components/PasswordGate';
import { QueryCacheReset } from '../components/QueryCacheReset';
// Local
import { supabase } from '../lib/supabase';
import { INTEGRATION_TEAM_ROLES, LEADERSHIP_ROLES, STAFF_ROLES, TEACHING_ROLES, UserRole } from '../types/enums';
import { HomeRedirect } from './HomeRedirect';
import {
  AuthPages,
  BirthdaysPage,
  ClassesPage,
  CoffeeHistoryPage,
  CoffeePage,
  CoffeeRosterPage,
  CohortRosterPage,
  CohortsListPage,
  CommunityGroupDetailPage,
  DashboardPage,
  ForgotPasswordPage,
  IntegrationSignupPage,
  LoginPage,
  MakeupAttendancePage,
  MemberPendenciesPage,
  MemberRecordPage,
  MembershipInterestPage,
  MembershipInterestPreviewPage,
  MembershipPage,
  MembersPage,
  MinistriesPage,
  ModuleMorePage,
  NewVisitorPage,
  PeoplePage,
  ProfilePage,
  ReportsPage,
  ResetPasswordPage,
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
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider client={supabase}>
        <QueryCacheReset />
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AuthPages />}>
              <Route path={AppRoute.Login} element={<LoginPage />} />
              <Route path={AppRoute.ForgotPassword} element={<ForgotPasswordPage />} />
              <Route path={AppRoute.ResetPassword} element={<ResetPasswordPage />} />
            </Route>
            <Route path={AppRoute.IntegrationSignup} element={<IntegrationSignupPage />} />
            <Route path={`${AppRoute.MakeupAttendance}/:token`} element={<MakeupAttendancePage />} />
            <Route path={AppRoute.MembershipInterest} element={<MembershipInterestPage />} />
            <Route path={AppRoute.MembershipInterestPreview} element={<MembershipInterestPreviewPage />} />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <PasswordGate>
                    <Layout>
                      <Suspense fallback={<Skeleton $h="480px" />}>
                        <Routes>
                          <Route path={AppRoute.Dashboard} element={<DashboardPage />} />
                          <Route
                            path={AppRoute.ChurchMore}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <ModuleMorePage areaId="church" />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.IntegrationMore}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <ModuleMorePage areaId="integration" />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Visitors}
                            element={
                              <ProtectedRoute roles={INTEGRATION_TEAM_ROLES}>
                                <VisitorsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.NewVisitor}
                            element={
                              <ProtectedRoute roles={INTEGRATION_TEAM_ROLES}>
                                <NewVisitorPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Visitors}/:id`}
                            element={
                              <ProtectedRoute roles={STAFF_ROLES}>
                                <VisitorDetailPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Visitors}/:id/editar`}
                            element={
                              <ProtectedRoute roles={STAFF_ROLES}>
                                <VisitorEditPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Visitors}/:id/detalhes`}
                            element={
                              <ProtectedRoute roles={STAFF_ROLES}>
                                <VisitorInfoPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Coffee}
                            element={
                              <ProtectedRoute roles={INTEGRATION_TEAM_ROLES}>
                                <CoffeePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Classes}
                            element={
                              <ProtectedRoute roles={TEACHING_ROLES}>
                                <ClassesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Members}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <MembersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.MemberPendencies}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <MemberPendenciesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Birthdays}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <BirthdaysPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Members}/:id/ficha`}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <MemberRecordPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Membership}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <MembershipPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Ministries}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <MinistriesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.SmallGroups}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <SmallGroupsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.CommunityGroups}/:type/:id`}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <CommunityGroupDetailPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Reports}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <ReportsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Reports}/cafes`}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <CoffeeHistoryPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Reports}/cafes/:id`}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <CoffeeRosterPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Reports}/turmas`}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <CohortsListPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Reports}/turmas/:id`}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <CohortRosterPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={AppRoute.Volunteers}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <VolunteersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Volunteers}/:id`}
                            element={
                              <ProtectedRoute roles={LEADERSHIP_ROLES}>
                                <VolunteerDetailPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path={`${AppRoute.Store}/*`}
                            element={
                              <ProtectedRoute roles={[UserRole.Pastor]}>
                                <StoreRoutes />
                              </ProtectedRoute>
                            }
                          />
                          <Route path={AppRoute.People} element={<PeoplePage />} />
                          <Route path={AppRoute.Profile} element={<ProfilePage />} />
                          <Route path={AppRoute.ChangePassword} element={<ChangePasswordPage />} />
                          <Route path="*" element={<HomeRedirect />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  </PasswordGate>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
