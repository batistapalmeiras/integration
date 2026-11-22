// React
import { ReactNode } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
import { KeyRound } from 'lucide-react';
// Components
import { SectionItem, SectionShell } from '../../../components/SectionShell';
// Local
import { profileSections } from '../../../features/access/profileSections';
import { personItems } from '../../../features/access/recordSections';
import { profilePath } from '../../../routes/paths';
import { hasRole, MEMBER_RECORD_ROLES } from '../../../types/enums';

interface Props {
  viewing?: string;
  children: ReactNode;
}

export function ProfileShell({ viewing, children }: Props) {
  const { user } = useAuthCtx();
  const ownProfile = !viewing || viewing === user?.id;

  if (!ownProfile) {
    const opensRecord = hasRole(user?.role, MEMBER_RECORD_ROLES);
    const items: SectionItem[] = opensRecord
      ? personItems(profilePath(viewing))
      : [{ label: 'Acesso', path: profilePath(viewing), icon: KeyRound }];
    return (
      <SectionShell title="Perfil" items={items} switcher>
        {children}
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="Perfil"
      items={profileSections(user?.id ?? '', user?.role)}
      switcher
    >
      {children}
    </SectionShell>
  );
}
