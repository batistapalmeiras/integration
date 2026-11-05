// Libs
import { useAuthCtx } from 'bp-kit';
// Components
import { PageHeader } from '../../components/PageHeader';
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
