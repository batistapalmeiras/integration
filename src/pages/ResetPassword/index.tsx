// Libs
import { ResetPasswordPage as SharedResetPasswordPage } from 'bp-kit';
// Local
import icon from '../../assets/icon.png';
import { AppRoute } from '../../routes/paths';

export function ResetPasswordPage() {
  return (
    <SharedResetPasswordPage
      brand={{
        icon,
        iconAlt: 'Batista Palmeiras',
        name: 'Integração',
        sub: 'Igreja Batista Palmeiras',
        quote: 'Mais que uma Igreja, uma Família!',
      }}
      loginPath={AppRoute.Login}
    />
  );
}
