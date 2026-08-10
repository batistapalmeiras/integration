// React
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// Libs
import { AuthProvider } from 'bp-kit';
// Components
import { Layout } from '../components/Layout';
import { AdminPage } from '../pages/Admin';
import { ClassesPage } from '../pages/Classes';
import { CoffeePage } from '../pages/Coffee';
import { IntegrationSignupPage } from '../pages/IntegrationSignup';
import { LoginPage } from '../pages/Login';
import { ProfilePage } from '../pages/Profile';
import { ReportsPage } from '../pages/Reports';
import { CohortRosterPage } from '../pages/Reports/components/CohortRosterPage';
import { PeopleReportPage } from '../pages/Reports/components/PeopleReportPage';
import { VisitorsPage } from '../pages/Visitors';
import { VisitorDetailPage } from '../pages/Visitors/Detail';
import { NewVisitorPage } from '../pages/Visitors/New';
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

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route
                      path={AppRoute.Visitors}
                      element={
                        <ProtectedRoute roles={[UserRole.Reception, UserRole.IntegrationTeam, UserRole.Admin]}>
                          <VisitorsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.NewVisitor}
                      element={
                        <ProtectedRoute roles={[UserRole.Reception, UserRole.IntegrationTeam, UserRole.Admin]}>
                          <NewVisitorPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Visitors}/:id`}
                      element={
                        <ProtectedRoute
                          roles={[
                            UserRole.Reception,
                            UserRole.IntegrationTeam,
                            UserRole.Admin,
                            UserRole.Pastor,
                            UserRole.Teacher,
                          ]}
                        >
                          <VisitorDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.Coffee}
                      element={
                        <ProtectedRoute roles={[UserRole.Pastor, UserRole.Admin]}>
                          <CoffeePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.Classes}
                      element={
                        <ProtectedRoute roles={[UserRole.Teacher, UserRole.Admin]}>
                          <ClassesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.Admin}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin]}>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={AppRoute.Reports}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin]}>
                          <ReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Reports}/turmas/:id`}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin]}>
                          <CohortRosterPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={`${AppRoute.Reports}/pessoas`}
                      element={
                        <ProtectedRoute roles={[UserRole.Admin]}>
                          <PeopleReportPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path={AppRoute.Profile} element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to={AppRoute.Visitors} replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
