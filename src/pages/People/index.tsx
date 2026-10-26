// Libs
import { PageHeader, useAuthCtx } from 'bp-kit';
// Local
import { UserRole } from '../../types/enums';
import { PageFlexWrap } from '../Reports/styles';
import { PeopleSection } from '../Reports/components/PeopleSection';

export function PeoplePage() {
  const { user } = useAuthCtx();
  const openedFromMenu = user?.role === UserRole.Admin || user?.role === UserRole.Pastor;

  return (
    <PageFlexWrap>
      <PageHeader title="Pessoas" back={openedFromMenu} />
      <PeopleSection />
    </PageFlexWrap>
  );
}
