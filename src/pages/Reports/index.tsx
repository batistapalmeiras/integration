// React
import { useSearchParams } from 'react-router-dom';
// Libs
import { Button, Tab, TabBar, Typography, useToast } from 'bp-kit';
import { FileDown } from 'lucide-react';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { AnnualReport } from './components/AnnualReport';
import { StatusCountsTable } from './components/StatusCountsTable';
import { useAnnualYears } from './hooks';
import { ReportSection } from './styles';

export function ReportsPage() {
  const availableYears = useAnnualYears();
  const { show: showToast, toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedYear = Number(searchParams.get('year'));
  const year = availableYears.includes(requestedYear) ? requestedYear : availableYears[0];

  const selectYear = (next: number) => setSearchParams({ year: String(next) }, { replace: true });

  return (
    <div>
      <PageHeader
        title="Relatórios"
        back
        action={
          <Button onClick={() => showToast('A geração do arquivo do relatório ainda não está disponível.')}>
            <FileDown size={16} />
            Gerar relatório
          </Button>
        }
      />

      <ReportSection aria-labelledby="current-status">
        <Typography type="label" as="h2" id="current-status">
          Situação atual
        </Typography>
        <StatusCountsTable />
      </ReportSection>

      <ReportSection aria-labelledby="by-year">
        <Typography type="label" as="h2" id="by-year">
          Por ano
        </Typography>
        <TabBar>
          {availableYears.map((option) => (
            <Tab key={option} $active={option === year} onClick={() => selectYear(option)}>
              {option}
            </Tab>
          ))}
        </TabBar>
        <AnnualReport year={year} />
      </ReportSection>

      {toast}
    </div>
  );
}
