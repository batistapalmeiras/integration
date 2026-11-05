// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { CohortsList } from './CohortsList';

export function CohortsListPage() {
  return (
    <div>
      <PageHeader title="Histórico de turmas" back />
      <CohortsList />
    </div>
  );
}
