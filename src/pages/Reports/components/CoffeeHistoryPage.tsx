// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Skeleton, text } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { formatDate, weekdayLabel } from '../../../domain/dates';
import { AppRoute } from '../../../routes/paths';
import { useCoffeeHistory } from '../hooks';

export function CoffeeHistoryPage() {
  const navigate = useNavigate();
  const { events, loading, error } = useCoffeeHistory();

  return (
    <div>
      <PageHeader title="Histórico de cafés" back />

      {loading && <Skeleton $h="180px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && events.length === 0 && (
        <Empty title="Nenhum café cadastrado" description="Cafés agendados aparecerão aqui." />
      )}

      {!loading && !error && events.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Café</Th>
                <Th $shrink>Vieram</Th>
                <Th $shrink>Faltaram</Th>
                <Th $shrink $hideOnMobile>
                  Inscritos
                </Th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <Tr key={event.id} $clickable onClick={() => navigate(`${AppRoute.Reports}/cafes/${event.id}`)}>
                  <Td>
                    {weekdayLabel(event.eventDate)}, {formatDate(event.eventDate)}
                  </Td>
                  <Td $shrink>{event.people.filter((person) => person.presence === 'came').length}</Td>
                  <Td $shrink>{event.people.filter((person) => person.presence === 'missed').length}</Td>
                  <Td $shrink $hideOnMobile>
                    {event.people.filter((person) => person.presence === 'enrolled').length}
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
