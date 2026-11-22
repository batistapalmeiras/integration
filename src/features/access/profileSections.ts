// Libs
import { Layers, ShieldCheck, User } from 'lucide-react';
// Components
import { SectionItem } from '../../components/SectionShell';
// Local
import { AppRoute, profilePath } from '../../routes/paths';
import { UserRole } from '../../types/enums';

export function profileSections(userId: string, role: string | undefined): SectionItem[] {
  return [
    { label: 'Meus dados', path: profilePath(userId), icon: User },
    { label: 'Segurança', path: AppRoute.ChangePassword, icon: ShieldCheck },
    ...(role === UserRole.Developer
      ? [{ label: 'Visão dos módulos', path: AppRoute.ProfileView, icon: Layers }]
      : []),
  ];
}
