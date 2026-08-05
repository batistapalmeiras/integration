// Libs
import { Button, Checkbox, Empty, PageHeader, Skeleton, useAuthCtx, useModal } from 'bp-kit';
// Local
import { RowActions, Table, TableWrapper, Td, Th } from '../../components/Table';
import { UserRole } from '../../types/enums';
import { CreateEventModal } from './components/CreateEventModal';
import { formatDate } from './domain';
import { useCoffee } from './hooks';
import { Section } from './styles';

export function CoffeePage() {
  const { user } = useAuthCtx();
  const {
    event,
    attendees,
    pendingPeople,
    activeCohort,
    loading,
    error,
    createEvent,
    addPersonToEvent,
    updateAttendance,
    inviteToClasses,
  } = useCoffee();
  const { open, close, modal } = useModal();

  const canPlan = user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin;

  const openCreateModal = () => open(<CreateEventModal close={close} onCreate={createEvent} />);

  return (
    <div>
      <PageHeader
        title="Café de Boas-vindas"
        subtitle={event ? `${formatDate(event.event_date)} às ${event.event_time.slice(0, 5)}` : 'Nenhum café agendado'}
        action={canPlan ? <Button onClick={openCreateModal}>Novo café</Button> : undefined}
      />

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title="Erro ao carregar" description={error} />}

      {!loading && !error && !event && (
        <Empty
          title="Nenhum café agendado"
          description={canPlan ? 'Crie o próximo café pelo botão acima.' : 'Aguarde a Equipe de Integração agendar o próximo café.'}
        />
      )}

      {!loading && !error && event && (
        <>
          {attendees.length === 0 && pendingPeople.length === 0 && (
            <Empty title="Ninguém convidado ainda" description="Visitantes que aceitaram o convite aparecerão aqui." />
          )}

          {attendees.length > 0 && (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>Nome</Th>
                    <Th>Telefone</Th>
                    <Th>Confirmou</Th>
                    <Th>Compareceu</Th>
                    <Th>Pastor apresentou</Th>
                    {canPlan && <Th>Ações</Th>}
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendance) => (
                    <tr key={attendance.id}>
                      <Td data-label="Nome">{attendance.person.name}</Td>
                      <Td data-label="Telefone">{attendance.person.phone}</Td>
                      <Td data-label="Confirmou">
                        <Checkbox
                          checked={attendance.confirmed}
                          onChange={(e) => updateAttendance(attendance, { confirmed: e.target.checked })}
                        />
                      </Td>
                      <Td data-label="Compareceu">
                        <Checkbox
                          checked={attendance.attended}
                          onChange={(e) => updateAttendance(attendance, { attended: e.target.checked })}
                        />
                      </Td>
                      <Td data-label="Pastor apresentou">
                        <Checkbox
                          checked={attendance.presented_by_pastor}
                          onChange={(e) => updateAttendance(attendance, { presented_by_pastor: e.target.checked })}
                        />
                      </Td>
                      {canPlan && (
                        <Td data-label="Ações">
                          {attendance.attended && (
                            <RowActions>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={!activeCohort}
                                onClick={() => inviteToClasses(attendance)}
                              >
                                {activeCohort ? 'Convidar para Integração' : 'Nenhuma turma ativa'}
                              </Button>
                            </RowActions>
                          )}
                        </Td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}

          {pendingPeople.length > 0 && (
            <Section>
              <PageHeader title="Aguardando confirmação" subtitle="Aceitaram o convite mas ainda não estão nessa lista" />
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Nome</Th>
                      <Th>Telefone</Th>
                      <Th>Ações</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPeople.map((person) => (
                      <tr key={person.id}>
                        <Td data-label="Nome">{person.name}</Td>
                        <Td data-label="Telefone">{person.phone}</Td>
                        <Td data-label="Ações">
                          <RowActions>
                            <Button size="sm" variant="secondary" onClick={() => addPersonToEvent(person.id)}>
                              Adicionar ao café
                            </Button>
                          </RowActions>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            </Section>
          )}
        </>
      )}

      {modal}
    </div>
  );
}
