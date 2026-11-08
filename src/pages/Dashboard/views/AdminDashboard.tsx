// Local
import { NAV_ITEMS } from '../../../routes/navigation';
import { AgendaPanel, cohortEntry, coffeeEntry } from '../components/AgendaPanel';
import { DashboardShell } from '../components/DashboardShell';
import { countInIntegration } from '../components/FunnelSection';
import { HighlightCards } from '../components/HighlightCards';
import { MakeupNotesPanel } from '../components/MakeupNotesPanel';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { SpacedSection } from '../styles';

export function AdminDashboard() {
  const { overview, loading, error } = useAdminDashboard();

  return (
    <DashboardShell loading={loading || !overview} error={error}>
      {() => {
        const { funnel, coffee, cohort, makeupNotes, volunteers } = overview!;

        return (
          <>
            <AgendaPanel
              entries={[...(coffee ? [coffeeEntry(coffee)] : []), ...(cohort ? [cohortEntry(cohort)] : [])]}
              emptyText="Nenhum café ou turma agendado."
            />
            <HighlightCards
              label="Números da Integração"
              items={[
                { label: 'Na Integração', value: countInIntegration(funnel), icon: NAV_ITEMS.people.icon },
                {
                  label: 'Em processo de membresia',
                  value: funnel.membership_pending ?? 0,
                  icon: NAV_ITEMS.membership.icon,
                },
                { label: 'Voluntários', value: volunteers, icon: NAV_ITEMS.volunteers.icon },
              ]}
            />
            {makeupNotes.length > 0 && (
              <SpacedSection>
                <MakeupNotesPanel notes={makeupNotes} />
              </SpacedSection>
            )}
          </>
        );
      }}
    </DashboardShell>
  );
}
