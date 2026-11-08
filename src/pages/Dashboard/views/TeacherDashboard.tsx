// Local
import { AgendaPanel, dayLabel, plural } from '../components/AgendaPanel';
import { DashboardShell } from '../components/DashboardShell';
import { MakeupNotesPanel } from '../components/MakeupNotesPanel';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { SpacedSection } from '../styles';

export function TeacherDashboard() {
  const { overview, loading, error } = useTeacherDashboard();

  return (
    <DashboardShell loading={loading || !overview} error={error}>
      {() => {
        const { cohorts, makeupNotes } = overview!;
        const entries = cohorts
          .filter((cohort) => cohort.nextLesson)
          .map((cohort) => ({
            date: cohort.nextLesson!.date,
            title: `Aula ${cohort.nextLesson!.number} da ${cohort.cohortName}`,
            detail: `${dayLabel(cohort.nextLesson!.date)} · ${plural(cohort.enrolled, 'inscrito', 'inscritos')}`,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        return (
          <>
            <AgendaPanel entries={entries} emptyText="Nenhuma aula agendada." />
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
