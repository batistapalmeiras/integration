// Libs
import { Button, Empty, PageHeader, Skeleton, StatCard, StatLabel, StatsGrid, StatValue } from 'bp-kit';
// Local
import { RowActions, Table, TableWrapper, Td, Th } from '../../components/Table';
import { PersonStatus, STATUS_META } from '../../types/person';
import { useAdmin } from './hooks';
import { Hint, Section } from './styles';

// Split so each row of cards fills the grid evenly instead of one awkward
// 7-card wrap — the active pipeline first, then the two outcomes.
const PIPELINE_STATUSES: PersonStatus[] = [
  'initial_contact',
  'retry_contact',
  'welcome_coffee',
  'integration',
  'membership_pending',
];
const OUTCOME_STATUSES: PersonStatus[] = ['member', 'archived'];

export function AdminPage() {
  const { counts, cohort, pendingMembers, loading, error, closeCohort, confirmMember } = useAdmin();

  return (
    <div>
      <PageHeader title="Administração" subtitle="Visão geral do processo de integração" />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title="Erro ao carregar" description={error} />}

      {!loading && !error && (
        <>
          <StatsGrid $columns={PIPELINE_STATUSES.length}>
            {PIPELINE_STATUSES.map((status) => (
              <StatCard key={status}>
                <StatLabel>{STATUS_META[status].label}</StatLabel>
                <StatValue>{counts[status] ?? 0}</StatValue>
              </StatCard>
            ))}
          </StatsGrid>

          <StatsGrid $columns={OUTCOME_STATUSES.length}>
            {OUTCOME_STATUSES.map((status) => (
              <StatCard key={status}>
                <StatLabel>{STATUS_META[status].label}</StatLabel>
                <StatValue $tone={status === 'archived' ? 'danger' : undefined}>{counts[status] ?? 0}</StatValue>
              </StatCard>
            ))}
          </StatsGrid>

          <Section>
            <PageHeader
              title="Turma ativa"
              subtitle={cohort ? cohort.name : 'Nenhuma turma ativa no momento'}
              action={cohort ? <Button variant="secondary" onClick={closeCohort}>Encerrar turma</Button> : undefined}
            />
            {!cohort && <Hint>Abra uma nova turma na tela de Turma.</Hint>}
          </Section>

          <Section>
            <PageHeader title="Pendentes de membresia" subtitle="Concluíram as aulas e aguardam confirmação" />
            {pendingMembers.length === 0 ? (
              <Empty title="Ninguém pendente" description="Quem completar 3 de 4 aulas aparece aqui." />
            ) : (
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Nome</Th>
                      <Th>Ações</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMembers.map((person) => (
                      <tr key={person.id}>
                        <Td data-label="Nome">{person.name}</Td>
                        <Td data-label="Ações">
                          <RowActions>
                            <Button size="sm" variant="secondary" onClick={() => confirmMember(person)}>
                              Confirmar como membro
                            </Button>
                          </RowActions>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
