// Libs
import styled from 'styled-components';
import { Skeleton, text } from 'bp-kit';
// Local
import { STATUS_META } from '../../../types/person';
import { useStatusCounts } from '../hooks';
import { PlainTable, PlainTableWrap, SummaryLabel, SummaryStat, SummaryStrip, SummaryValue } from '../styles';

// This table is informational, not a navigation list like the others built
// on PlainTable — drop the pointer/hover affordance so it doesn't look
// clickable.
const StaticTable = styled(PlainTable)`
  tbody tr {
    cursor: default;

    &:hover {
      background: none;
    }
  }
`;

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

      <PlainTableWrap>
        <StaticTable>
          <thead>
            <tr>
              <th>{text.fields.status}</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(STATUS_META).map(([status, meta]) => (
              <tr key={status}>
                <td>{meta.label}</td>
                <td>{counts[status as keyof typeof counts] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </StaticTable>
      </PlainTableWrap>
    </>
  );
}
