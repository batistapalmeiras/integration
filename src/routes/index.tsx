// React
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// Libs
import { AuthProvider, ChangePasswordPage } from 'bp-kit';
// Components
import { Layout } from '../components/Layout';
import { PasswordGate } from '../components/PasswordGate';
import { AdminPage } from '../pages/Admin';
import { ClassesPage } from '../pages/Classes';
import { CoffeePage } from '../pages/Coffee';
import { CommunityGroupDetailPage } from '../pages/CommunityGroups/Detail';
import { MinistriesPage } from '../pages/CommunityGroups/Ministries';
import { SmallGroupsPage } from '../pages/CommunityGroups/SmallGroups';
import { ForgotPasswordPage } from '../pages/ForgotPassword';
import { IntegrationSignupPage } from '../pages/IntegrationSignup';
import { LoginPage } from '../pages/Login';
import { MakeupAttendancePage } from '../pages/MakeupAttendance';
import { MemberPendenciesPage } from '../pages/MemberPendencies';
import { MemberRecordPage } from '../pages/MemberRecord';
import { MembersPage } from '../pages/Members';
import { MembershipPage } from '../pages/Membership';
import { MembershipInterestPage } from '../pages/MembershipInterest';
import { PeoplePage } from '../pages/People';
import { ProfilePage } from '../pages/Profile';
import { ReportsPage } from '../pages/Reports';
import { CohortRosterPage } from '../pages/Reports/components/CohortRosterPage';
import { CohortsListPage } from '../pages/Reports/components/CohortsListPage';
import { ResetPasswordPage } from '../pages/ResetPassword';
import { StorePage } from '../pages/Store';
import { EditStoreItemPage } from '../pages/Store/Edit';
import { StoreItemsProvider } from '../pages/Store/hooks/StoreItemsProvider';
import { NewStoreItemPage } from '../pages/Store/New';
import { StorePublicPage } from '../pages/Store/Public';
import { VisitorsPage } from '../pages/Visitors';
import { VisitorDetailPage } from '../pages/Visitors/Detail';
import { VisitorEditPage } from '../pages/Visitors/Edit';
import { VisitorInfoPage } from '../pages/Visitors/Info';
import { NewVisitorPage } from '../pages/Visitors/New';
import { VolunteersPage } from '../pages/Volunteers';
import { VolunteerDetailPage } from '../pages/Volunteers/Detail';
// Local
import { supabase } from '../lib/supabase';
import { INTEGRATION_TEAM_ROLES, LEADERSHIP_ROLES, STAFF_ROLES, TEACHING_ROLES, UserRole } from '../types/enums';
import { AppRoute } from './paths';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider client={supabase}>
        <Routes>
          <Route path={AppRoute.Login} element={<LoginPage />} />
          <Route path={AppRoute.ForgotPassword} element={<ForgotPasswordPage />} />
          <Route path={AppRoute.ResetPassword} element={<ResetPasswordPage />} />
          <Route path={AppRoute.IntegrationSignup} element={<IntegrationSignupPage />} />
          <Route path={`${AppRoute.MakeupAttendance}/:token`} element={<MakeupAttendancePage />} />
          <Route path={AppRoute.MembershipInterest} element={<MembershipInterestPage />} />
          <Route path={AppRoute.StorePublic} element={<StorePublicPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <PasswordGate>
                  <Layout>
                    <Routes>
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
                        <ProtectedRoute
                          roles={STAFF_ROLES}
                        >
                          <VisitorDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Visitors}/:id/editar`}
                      element={
                        <ProtectedRoute
                          roles={STAFF_ROLES}
                        >
                          <VisitorEditPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Visitors}/:id/detalhes`}
                      element={
                        <ProtectedRoute
                          roles={STAFF_ROLES}
                        >
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
                    <Route path={AppRoute.Admin} element={<AdminPage />} />
                    <Route path={AppRoute.Settings} element={<AdminPage />} />
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
                          <StoreItemsProvider>
                            <Routes>
                              <Route index element={<StorePage />} />
                              <Route path="novo" element={<NewStoreItemPage />} />
                              <Route path=":id/editar" element={<EditStoreItemPage />} />
                            </Routes>
                          </StoreItemsProvider>
                        </ProtectedRoute>
                      }
                    />
                    <Route path={AppRoute.People} element={<PeoplePage />} />
                    <Route path={AppRoute.Profile} element={<ProfilePage />} />
                    <Route path={AppRoute.ChangePassword} element={<ChangePasswordPage />} />
                    <Route path="*" element={<Navigate to={AppRoute.Visitors} replace />} />
                    </Routes>
                  </Layout>
                </PasswordGate>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
