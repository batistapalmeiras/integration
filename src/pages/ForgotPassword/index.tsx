// Libs
import { ForgotPasswordPage as SharedForgotPasswordPage } from 'bp-kit';
// Local
import icon from '../../assets/icon.png';
import { AppRoute } from '../../routes/paths';

export function ForgotPasswordPage() {
  return (
    <SharedForgotPasswordPage
      brand={{
        icon,
        iconAlt: 'Batista Palmeiras',
        name: 'Integração',
        sub: 'Igreja Batista Palmeiras',
        quote: 'Mais que uma Igreja, uma Família!',
      }}
      loginPath={AppRoute.Login}
      resetPasswordPath={AppRoute.ResetPassword}
    />
  );
}
