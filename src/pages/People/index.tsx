// Libs
import { PageHeader } from 'bp-kit';
// Local
import { PageFlexWrap } from '../Reports/styles';
import { PeopleSection } from '../Reports/components/PeopleSection';

export function PeoplePage() {
  return (
    <PageFlexWrap>
      <PageHeader title="Pessoas" />
      <PeopleSection />
    </PageFlexWrap>
  );
}
