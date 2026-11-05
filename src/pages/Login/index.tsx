// Libs
import { LoginPage as SharedLoginPage } from 'bp-kit';
// Local
import icon from '../../assets/icon.png';
import { InstallPrompt } from '../../components/InstallPrompt';
import { homeRouteFor } from '../../routes/HomeRedirect';
import { AppRoute } from '../../routes/paths';

export function LoginPage() {
  return (
    <SharedLoginPage
      brand={{
        icon,
        iconAlt: 'Batista Palmeiras',
        name: 'Integração',
        sub: 'Igreja Batista Palmeiras',
        quote: 'Mais que uma Igreja, uma Família!',
      }}
      resolveRoute={homeRouteFor}
      forgotPasswordPath={AppRoute.ForgotPassword}
      footerSlot={<InstallPrompt />}
    />
  );
}
