// Libs
import { LoginPage as SharedLoginPage } from 'bp-kit';
// Local
import icon from '../../assets/icon.png';
import { UserRole } from '../../types/enums';
import { AppRoute } from '../../routes/paths';

function resolveRoute(role: string): string {
  if (role === UserRole.Admin) return AppRoute.Admin;
  if (role === UserRole.Pastor) return AppRoute.Coffee;
  if (role === UserRole.Teacher) return AppRoute.Classes;
  return AppRoute.Visitors;
}

export function LoginPage() {
  return (
    <SharedLoginPage
      brand={{
        icon,
        iconAlt: 'Batista Palmeiras',
        name: 'Integração',
        sub: 'Igreja Batista de Palmeiras',
        quote: 'Mais que uma Igreja, uma Família!',
      }}
      resolveRoute={resolveRoute}
    />
  );
}
