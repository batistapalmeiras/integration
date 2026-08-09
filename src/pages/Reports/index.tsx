// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, PageHeader, useModal } from 'bp-kit';
// Local
import { AppRoute } from '../../routes/paths';
import { AnnualReportModal } from './components/AnnualReportModal';
import { CohortsList } from './components/CohortsList';
import { ActionsRow } from './styles';

export function ReportsPage() {
  const navigate = useNavigate();
  const { open, close, modal } = useModal();

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Turmas do processo de integração"
        action={
          <ActionsRow>
            <Button variant="secondary" onClick={() => navigate(`${AppRoute.Reports}/pessoas`)}>
              Ver todas as pessoas
            </Button>
            <Button onClick={() => open(<AnnualReportModal close={close} />)}>Gerar relatório</Button>
          </ActionsRow>
        }
      />

      <CohortsList />

      {modal}
    </div>
  );
}
