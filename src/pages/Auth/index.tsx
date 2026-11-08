// Libs
import { AuthLayout, ForgotPasswordForm, LoginForm, ResetPasswordForm } from 'bp-kit';
// Local
import icon from '../../assets/icon.png';
import { InstallPrompt } from '../../components/InstallPrompt';
import { homeRouteFor } from '../../routes/HomeRedirect';
import { AppRoute } from '../../routes/paths';

const BRAND = {
  icon,
  iconAlt: 'Batista Palmeiras',
  name: 'Integração',
  sub: 'Igreja Batista Palmeiras',
  quote: 'Mais que uma Igreja, uma Família!',
};

export function AuthPages() {
  return <AuthLayout brand={BRAND} />;
}

export function LoginPage() {
  return (
    <LoginForm resolveRoute={homeRouteFor} forgotPasswordPath={AppRoute.ForgotPassword} footerSlot={<InstallPrompt />} />
  );
}

export function ForgotPasswordPage() {
  return <ForgotPasswordForm loginPath={AppRoute.Login} resetPasswordPath={AppRoute.ResetPassword} />;
}

export function ResetPasswordPage() {
  return <ResetPasswordForm loginPath={AppRoute.Login} />;
}
