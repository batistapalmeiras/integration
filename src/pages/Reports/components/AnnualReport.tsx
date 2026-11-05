// Libs
import { Empty, Skeleton, StatCard, StatLabel, StatsGrid, StatValue, text } from 'bp-kit';
// Local
import { useAnnualReport } from '../hooks';

interface Props {
  year: number;
}

export function AnnualReport({ year }: Props) {
  const { counts, loading, error } = useAnnualReport(year);

  return (
    <>
      {loading && <Skeleton $h="160px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && (
        <StatsGrid $columns={5}>
          <StatCard>
            <StatLabel>Iniciaram contato</StatLabel>
            <StatValue>{counts.initialContact}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Foram ao café</StatLabel>
            <StatValue>{counts.welcomeCoffee}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Entraram em turma</StatLabel>
            <StatValue>{counts.integration}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Viraram membro</StatLabel>
            <StatValue>{counts.member}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Foram arquivados</StatLabel>
            <StatValue $tone="danger">{counts.archived}</StatValue>
          </StatCard>
        </StatsGrid>
      )}
    </>
  );
}
