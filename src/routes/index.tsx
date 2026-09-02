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
import { IntegrationSignupPage } from '../pages/IntegrationSignup';
import { LoginPage } from '../pages/Login';
import { MakeupAttendancePage } from '../pages/MakeupAttendance';
import { MembersPage } from '../pages/Members';
import { MembershipInterestPage } from '../pages/MembershipInterest';
import { PeoplePage } from '../pages/People';
import { ProfilePage } from '../pages/Profile';
import { ReportsPage } from '../pages/Reports';
import { CohortRosterPage } from '../pages/Reports/components/CohortRosterPage';
import { CohortsListPage } from '../pages/Reports/components/CohortsListPage';
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
import { UserRole } from '../types/enums';
import { AppRoute } from './paths';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider client={supabase}>
        <Routes>
          <Route path={AppRoute.Login} element={<LoginPage />} />
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
                        <ProtectedRoute roles={[UserRole.IntegrationTeam, UserRole.Admin, UserRole.Pastor]}>
                          <VisitorsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.NewVisitor}
                      element={
                        <ProtectedRoute roles={[UserRole.IntegrationTeam, UserRole.Admin, UserRole.Pastor]}>
                          <NewVisitorPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Visitors}/:id`}
                      element={
                        <ProtectedRoute
                          roles={[UserRole.IntegrationTeam, UserRole.Admin, UserRole.Pastor, UserRole.Teacher]}
                        >
                          <VisitorDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Visitors}/:id/editar`}
                      element={
                        <ProtectedRoute
                          roles={[UserRole.IntegrationTeam, UserRole.Admin, UserRole.Pastor, UserRole.Teacher]}
                        >
                          <VisitorEditPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Visitors}/:id/detalhes`}
                      element={
                        <ProtectedRoute
                          roles={[UserRole.IntegrationTeam, UserRole.Admin, UserRole.Pastor, UserRole.Teacher]}
                        >
                          <VisitorInfoPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.Coffee}
                      element={
                        <ProtectedRoute roles={[UserRole.IntegrationTeam, UserRole.Pastor, UserRole.Admin]}>
                          <CoffeePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.Classes}
                      element={
                        <ProtectedRoute roles={[UserRole.Teacher, UserRole.Admin, UserRole.Pastor]}>
                          <ClassesPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* No role restriction: every role reaches this page — on
                        mobile it's now the only way to Meu perfil/Sair (no
                        top bar anymore), with admin shortcuts shown inside
                        only for Admin/Pastor/Pastor-only roles. Registered
                        under two paths: /menu is the mobile bottom-tab
                        target, /configuracoes is what the desktop sidebar
                        links to — same page either way. */}
                    <Route path={AppRoute.Admin} element={<AdminPage />} />
                    <Route path={AppRoute.Settings} element={<AdminPage />} />
                    <Route
                      path={AppRoute.Members}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin, UserRole.Pastor]}>
                          <MembersPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Ministérios/PGs are exclusive to Pastor (not Admin) — closed 2026-08-25. */}
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
                        <ProtectedRoute roles={[UserRole.Admin, UserRole.Pastor]}>
                          <ReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Reports}/turmas`}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin, UserRole.Pastor]}>
                          <CohortsListPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Reports}/turmas/:id`}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin, UserRole.Pastor]}>
                          <CohortRosterPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.Volunteers}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin, UserRole.Pastor]}>
                          <VolunteersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Volunteers}/:id`}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin, UserRole.Pastor]}>
                          <VolunteerDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Store}/*`}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin, UserRole.Pastor]}>
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
