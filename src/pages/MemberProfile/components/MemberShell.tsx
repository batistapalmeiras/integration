// React
import { ReactNode } from 'react';
// Components
import { SectionShell } from '../../../components/SectionShell';
// Local
import { personItems } from '../../../features/access/recordSections';
import { memberPath } from '../../../routes/paths';

export function MemberShell({ personId, children }: { personId: string; children: ReactNode }) {
  return (
    <SectionShell title="Perfil" items={personItems(memberPath(personId))} switcher>
      {children}
    </SectionShell>
  );
}
