// Libs
import { PageHeader } from 'bp-kit';
// Local
import { CohortsList } from './CohortsList';

export function CohortsListPage() {
  return (
    <div>
      <PageHeader title="Turmas" subtitle="Todas as turmas do processo de integração" back />
      <CohortsList />
    </div>
  );
}
