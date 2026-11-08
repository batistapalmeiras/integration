// Local
import { NAV_ITEMS } from '../../../routes/navigation';
import { STATUS_META } from '../../../types/person';
import { AgendaPanel, coffeeEntry } from '../components/AgendaPanel';
import { DashboardShell } from '../components/DashboardShell';
import { HighlightCards } from '../components/HighlightCards';
import { useIntegrationTeamDashboard } from '../hooks/useIntegrationTeamDashboard';

export function IntegrationTeamDashboard() {
  const { overview, loading, error } = useIntegrationTeamDashboard();

  return (
    <DashboardShell loading={loading || !overview} error={error}>
      {() => {
        const { funnel, newThisWeek, coffee } = overview!;

        return (
          <>
            <AgendaPanel entries={coffee ? [coffeeEntry(coffee)] : []} emptyText="Nenhum café agendado." />
            <HighlightCards
              label="Fila da Equipe de Integração"
              items={[
                {
                  label: STATUS_META.initial_contact.label,
                  value: funnel.initial_contact ?? 0,
                  icon: STATUS_META.initial_contact.icon,
                },
                {
                  label: STATUS_META.retry_contact.label,
                  value: funnel.retry_contact ?? 0,
                  icon: STATUS_META.retry_contact.icon,
                },
                {
                  label: 'Aguardando o café',
                  value: funnel.welcome_coffee ?? 0,
                  icon: STATUS_META.welcome_coffee.icon,
                },
                {
                  label: 'Novos na semana',
                  value: newThisWeek,
                  icon: NAV_ITEMS.visitors.icon,
                },
              ]}
            />
          </>
        );
      }}
    </DashboardShell>
  );
}
