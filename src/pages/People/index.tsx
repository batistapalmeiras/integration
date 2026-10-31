// Libs
import { PageHeader, useAuthCtx } from 'bp-kit';
// Local
import { hasRole, LEADERSHIP_ROLES } from '../../types/enums';
import { PageFlexWrap } from '../Reports/styles';
import { PeopleSection } from '../Reports/components/PeopleSection';

export function PeoplePage() {
  const { user } = useAuthCtx();
  const openedFromMenu = hasRole(user?.role, LEADERSHIP_ROLES);

  return (
    <PageFlexWrap>
      <PageHeader title="Pessoas" back={openedFromMenu} />
      <PeopleSection />
    </PageFlexWrap>
  );
}
