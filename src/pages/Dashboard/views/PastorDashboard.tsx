// Local
import { AgendaPanel, cohortEntry, coffeeEntry } from '../components/AgendaPanel';
import { BirthdaysHighlight } from '../components/BirthdaysHighlight';
import { ChurchMembersCard } from '../components/ChurchMembersCard';
import { DashboardShell } from '../components/DashboardShell';
import { FunnelCards } from '../components/FunnelSection';
import { MakeupNotesPanel } from '../components/MakeupNotesPanel';
import { usePastorDashboard } from '../hooks/usePastorDashboard';
import { FunnelArea, FunnelTitle, GridArea, PastorGrid } from '../styles';

export function PastorDashboard() {
  const { overview, loading, error } = usePastorDashboard();

  return (
    <DashboardShell loading={loading || !overview} error={error}>
      {() => {
        const { funnel, coffee, cohort, makeupNotes } = overview!;

        return (
          <PastorGrid>
            <GridArea $area="members">
              <ChurchMembersCard />
            </GridArea>
            <GridArea $area="birthdays">
              <BirthdaysHighlight />
            </GridArea>
            <GridArea $area="agenda">
              <AgendaPanel
                entries={[...(coffee ? [coffeeEntry(coffee)] : []), ...(cohort ? [cohortEntry(cohort)] : [])]}
                emptyText="Nenhum café ou turma agendado."
              />
              {makeupNotes.length > 0 && <MakeupNotesPanel notes={makeupNotes} />}
            </GridArea>
            <FunnelTitle id="integration">Integração</FunnelTitle>
            <FunnelArea>
              <FunnelCards counts={funnel} />
            </FunnelArea>
          </PastorGrid>
        );
      }}
    </DashboardShell>
  );
}
