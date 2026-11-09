// React
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Libs
import { AuthProvider, Skeleton } from 'bp-kit';
// Components
import { Layout } from '../components/Layout';
import { PasswordGate } from '../components/PasswordGate';
import { QueryCacheReset } from '../components/QueryCacheReset';
// Local
import { supabase } from '../lib/supabase';
import { memberProfileSource } from '../repositories/profiles';
import { HomeRedirect } from './HomeRedirect';
import { AuthPages, ForgotPasswordPage, LoginPage, ResetPasswordPage } from './pages';
import { AppRoute } from './paths';
import { ProtectedRoute } from './ProtectedRoute';
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from './table';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider client={supabase} profileSource={memberProfileSource}>
        <QueryCacheReset />
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AuthPages />}>
              <Route path={AppRoute.Login} element={<LoginPage />} />
              <Route path={AppRoute.ForgotPassword} element={<ForgotPasswordPage />} />
              <Route path={AppRoute.ResetPassword} element={<ResetPasswordPage />} />
            </Route>
            {PUBLIC_ROUTES.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <PasswordGate>
                    <Layout>
                      <Suspense fallback={<Skeleton $h="480px" />}>
                        <Routes>
                          {PRIVATE_ROUTES.map(({ path, element, roles }) => (
                            <Route
                              key={path}
                              path={path}
                              element={roles ? <ProtectedRoute roles={roles}>{element}</ProtectedRoute> : element}
                            />
                          ))}
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
