// Local
import { AGENDA_TITLE, AgendaPanel, agendaEntries } from '../components/AgendaPanel';
import { BirthdaysHighlight } from '../components/BirthdaysHighlight';
import { ChurchMembersCard } from '../components/ChurchMembersCard';
import { DashboardShell } from '../components/DashboardShell';
import { FunnelCards } from '../components/FunnelSection';
import { MakeupNotesPanel } from '../components/MakeupNotesPanel';
import { useGeneralAdminDashboard } from '../hooks/useGeneralAdminDashboard';
import { AreaTitle, FunnelArea, GridArea, GeneralAdminGrid } from '../styles';

export function GeneralAdminDashboard() {
  const { overview, loading, error } = useGeneralAdminDashboard();

  return (
    <DashboardShell loading={loading || !overview} error={error}>
      {() => {
        const { funnel, makeupNotes } = overview!;

        return (
          <GeneralAdminGrid>
            <GridArea $area="members">
              <ChurchMembersCard />
            </GridArea>
            <GridArea $area="birthdays">
              <BirthdaysHighlight />
            </GridArea>
            <AreaTitle $area="agenda-title" id="agenda">
              {AGENDA_TITLE}
            </AreaTitle>
            <GridArea $area="agenda">
              <AgendaPanel
                titled={false}
                entries={agendaEntries(overview!)}
                emptyText="Nenhum café ou turma agendado."
              />
              {makeupNotes.length > 0 && <MakeupNotesPanel notes={makeupNotes} />}
            </GridArea>
            <AreaTitle $area="title" id="integration">
              Integração
            </AreaTitle>
            <FunnelArea>
              <FunnelCards counts={funnel} />
            </FunnelArea>
          </GeneralAdminGrid>
        );
      }}
    </DashboardShell>
  );
}
