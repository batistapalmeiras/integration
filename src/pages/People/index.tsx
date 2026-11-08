// Libs
import { useAuthCtx } from 'bp-kit';
// Components
import { PageFlexWrap } from '../../components/ListLayout';
import { PageHeader } from '../../components/PageHeader';
import { hasRole, LEADERSHIP_ROLES } from '../../types/enums';
// Local
import { PeopleSection } from './components/PeopleSection';

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
