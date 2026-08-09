// Libs
import { PageHeader } from 'bp-kit';
// Local
import { PeopleSection } from './PeopleSection';

export function PeopleReportPage() {
  return (
    <div>
      <PageHeader title="Pessoas" subtitle="Todas as pessoas do processo de integração" back />
      <PeopleSection />
    </div>
  );
}
