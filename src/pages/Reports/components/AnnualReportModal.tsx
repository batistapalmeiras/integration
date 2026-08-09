// Libs
import { Button, ModalActions, ModalTitle, RawSelect, Skeleton, StatCard, StatLabel, StatsGrid, StatValue } from 'bp-kit';
// Local
import { useAnnualReport } from '../hooks';
import { FiltersRow } from '../styles';

interface Props {
  close: () => void;
}

export function AnnualReportModal({ close }: Props) {
  const { year, setYear, availableYears, counts, loading, error } = useAnnualReport();

  return (
    <>
      <ModalTitle>Relatório anual</ModalTitle>

      <FiltersRow>
        <RawSelect label="Ano" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </RawSelect>
      </FiltersRow>

      {loading && <Skeleton $h="160px" />}
      {!loading && error && <p>{error}</p>}

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

      <ModalActions>
        <Button type="button" variant="secondary" onClick={close}>
          Fechar
        </Button>
      </ModalActions>
    </>
  );
}
