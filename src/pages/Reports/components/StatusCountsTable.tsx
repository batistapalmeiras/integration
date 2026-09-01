// Libs
import { Skeleton, text } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th } from '../../../components/Table';
import { STATUS_META } from '../../../types/person';
import { useStatusCounts } from '../hooks';
import { SummaryLabel, SummaryStat, SummaryStrip, SummaryValue } from '../styles';

export function StatusCountsTable() {
  const { counts, total, totalCohorts, loading, error } = useStatusCounts();

  if (loading) return <Skeleton $h="120px" />;
  if (error) return null;

  return (
    <>
      <SummaryStrip>
        <SummaryStat>
          <SummaryValue>{total}</SummaryValue>
          <SummaryLabel>Total de pessoas</SummaryLabel>
        </SummaryStat>
        <SummaryStat>
          <SummaryValue>{totalCohorts}</SummaryValue>
          <SummaryLabel>Total de turmas</SummaryLabel>
        </SummaryStat>
      </SummaryStrip>

      {/* Informational, not a navigation list — Tr has no $clickable, so it
          naturally has no pointer/hover affordance. */}
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>{text.fields.status}</Th>
              <Th>Quantidade</Th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(STATUS_META).map(([status, meta]) => (
              <tr key={status}>
                <Td>{meta.label}</Td>
                <Td>{counts[status as keyof typeof counts] ?? 0}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </>
  );
}
