// Libs
import { Button, PageHeader, useModal } from 'bp-kit';
// Local
import { AnnualReportModal } from './components/AnnualReportModal';
import { StatusCountsTable } from './components/StatusCountsTable';

export function ReportsPage() {
  const { open, close, modal } = useModal();

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Visão geral do processo de integração"
        back
        action={<Button onClick={() => open(<AnnualReportModal close={close} />)}>Gerar relatório</Button>}
      />

      <StatusCountsTable />

      {modal}
    </div>
  );
}
