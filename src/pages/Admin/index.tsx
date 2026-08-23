// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, StatCard, StatLabel, StatsGrid, StatValue, text, useAuthCtx, useModal } from 'bp-kit';
// Local
import { RowActions, Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { PersonStatus, STATUS_META } from '../../types/person';
import { ConfirmMemberModal } from './components/ConfirmMemberModal';
import { useAdmin } from './hooks';
import { Hint, Section } from './styles';
import { PendingMember } from './types';

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
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { counts, cohort, pendingMembers, loading, error, closeCohort, confirmMember } = useAdmin();
  const { open, close, modal } = useModal();
  const isAdmin = user?.role === UserRole.Admin;

  const openConfirmModal = (person: PendingMember) =>
    open(<ConfirmMemberModal person={person} close={close} onConfirm={confirmMember} />);

  return (
    <div>
      <PageHeader title="Administração" subtitle="Visão geral do processo de integração" />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

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
              action={cohort && isAdmin ? <Button variant="secondary" onClick={closeCohort}>Encerrar turma</Button> : undefined}
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
                      <Th>{text.fields.name}</Th>
                      <Th>{text.actions.actionsColumn}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMembers.map((person) => (
                      <Tr key={person.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
                        <Td>{person.name}</Td>
                        <Td onClick={(e) => e.stopPropagation()}>
                          <RowActions>
                            <Button size="sm" variant="secondary" onClick={() => openConfirmModal(person)}>
                              Confirmar como membro
                            </Button>
                          </RowActions>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            )}
          </Section>
        </>
      )}
      {modal}
    </div>
  );
}
