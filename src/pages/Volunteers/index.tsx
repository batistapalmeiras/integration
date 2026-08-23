// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, text, useModal } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { AddVolunteerModal } from './components/AddVolunteerModal';
import { useVolunteers } from './hooks/useVolunteers';

export function VolunteersPage() {
  const navigate = useNavigate();
  const { volunteers, loading, error, addVolunteer } = useVolunteers();
  const { open, close, modal } = useModal();

  const openAddModal = () => open(<AddVolunteerModal close={close} onAdd={addVolunteer} />);

  return (
    <div>
      <PageHeader
        title="Voluntários"
        subtitle="Contas com acesso ao sistema"
        back
        action={<Button onClick={openAddModal}>Adicionar voluntário</Button>}
      />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && volunteers.length === 0 && (
        <Empty title="Nenhum voluntário cadastrado" description="Adicione o primeiro pelo botão acima." />
      )}

      {!loading && !error && volunteers.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((volunteer) => (
                <Tr
                  key={volunteer.id}
                  $clickable
                  onClick={() => navigate(`${AppRoute.Volunteers}/${volunteer.id}`)}
                >
                  <Td data-label={text.fields.name}>
                    {volunteer.name}
                    {!volunteer.active && ' (desabilitado)'}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {modal}
    </div>
  );
}
