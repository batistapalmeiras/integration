// Libs
import { PageHeader } from 'bp-kit';
// Local
import { PeopleSection } from '../Reports/components/PeopleSection';

export function PeoplePage() {
  return (
    <div>
      <PageHeader title="Pessoas" subtitle="Todas as pessoas do processo de integração" />
      <PeopleSection />
    </div>
  );
}
