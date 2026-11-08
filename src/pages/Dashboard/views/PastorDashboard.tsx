// Local
import { findNavAreaById, NAV_ITEMS, PASTOR_NAV_AREAS } from '../../../routes/navigation';
import { AgendaPanel, cohortEntry, coffeeEntry } from '../components/AgendaPanel';
import { BirthdaysHighlight } from '../components/BirthdaysHighlight';
import { DashboardShell } from '../components/DashboardShell';
import { countInIntegration, FunnelSection } from '../components/FunnelSection';
import { HighlightCards } from '../components/HighlightCards';
import { MakeupNotesPanel } from '../components/MakeupNotesPanel';
import { usePastorDashboard } from '../hooks/usePastorDashboard';
import { Columns, MainColumn, SideColumn } from '../styles';

const INTEGRATION_ICON = findNavAreaById(PASTOR_NAV_AREAS, 'integration')!.icon;

export function PastorDashboard() {
  const { overview, loading, error } = usePastorDashboard();

  return (
    <DashboardShell loading={loading || !overview} error={error}>
      {() => {
        const { funnel, totalMembers, community, coffee, cohort, makeupNotes } = overview!;
        const inIntegration = countInIntegration(funnel);

        return (
          <>
            <AgendaPanel
              entries={[...(coffee ? [coffeeEntry(coffee)] : []), ...(cohort ? [cohortEntry(cohort)] : [])]}
              emptyText="Nenhum café ou turma agendado."
            />
            <BirthdaysHighlight />
            <HighlightCards
              label="Números da igreja"
              items={[
                {
                  label: 'Membros',
                  value: totalMembers,
                  icon: NAV_ITEMS.members.icon,
                  link: 'Ver membros',
                  path: NAV_ITEMS.members.path,
                },
                {
                  label: 'Na Integração',
                  value: inIntegration,
                  icon: INTEGRATION_ICON,
                  link: 'Ver pessoas',
                  path: NAV_ITEMS.people.path,
                },
                {
                  label: 'Em processo de membresia',
                  value: funnel.membership_pending ?? 0,
                  icon: NAV_ITEMS.membership.icon,
                  link: 'Ver membresia',
                  path: NAV_ITEMS.membership.path,
                },
                {
                  label: 'Pequenos Grupos',
                  value: community.smallGroups,
                  icon: NAV_ITEMS.smallGroups.icon,
                  link: 'Ver PGs',
                  path: NAV_ITEMS.smallGroups.path,
                },
                {
                  label: 'Ministérios',
                  value: community.ministries,
                  icon: NAV_ITEMS.ministries.icon,
                  link: 'Ver ministérios',
                  path: NAV_ITEMS.ministries.path,
                },
              ]}
            />
            <Columns>
              <MainColumn>
                <FunnelSection counts={funnel} />
              </MainColumn>
              {makeupNotes.length > 0 && (
                <SideColumn>
                  <MakeupNotesPanel notes={makeupNotes} />
                </SideColumn>
              )}
            </Columns>
          </>
        );
      }}
    </DashboardShell>
  );
}
