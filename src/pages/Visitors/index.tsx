// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, text } from 'bp-kit';
// Local
import { PeopleCount } from '../../components/PeopleCount';
import { StatusPill } from '../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { useVisitors } from './hooks';

export function VisitorsPage() {
  const navigate = useNavigate();
  const { people, loading, error } = useVisitors();

  return (
    <div>
      <PageHeader
        title="Visitantes"
        subtitle="Acompanhamento do primeiro contato até a integração"
        action={<Button onClick={() => navigate(AppRoute.NewVisitor)}>Novo visitante</Button>}
      />

      {!loading && !error && <PeopleCount count={people.length} />}

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && people.length === 0 && (
        <Empty title="Nenhum visitante cadastrado" description="Cadastre o primeiro visitante pelo botão acima." />
      )}

      {!loading && !error && people.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th>{text.fields.status}</Th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <Tr key={person.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
                  <Td $truncate title={person.name}>
                    {person.name}
                  </Td>
                  <Td $shrink>
                    <StatusPill person={person} compact />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}
