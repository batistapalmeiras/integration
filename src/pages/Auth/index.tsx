// Libs
import { AuthBrand, AuthLayout, ForgotPasswordForm, LoginForm, ResetPasswordForm } from 'bp-kit';
// Local
import icon from '../../assets/SeloBrancoVetor.png';
import { InstallPrompt } from '../../components/InstallPrompt';
import { homeRouteFor } from '../../routes/HomeRedirect';
import { AppRoute } from '../../routes/paths';

const BRAND: AuthBrand = {
  icon,
  iconAlt: 'Batista Palmeiras',
  motto: {
    words: ['Amar', 'Acolher', 'Servir'],
    lead: 'Amar a Deus\nAcolher as pessoas\nServir à cidade',
    closing: 'Mais que\numa igreja,\numa família.',
  },
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
