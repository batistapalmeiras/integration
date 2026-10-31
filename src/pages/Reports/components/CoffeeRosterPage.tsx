// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Skeleton, text } from 'bp-kit';
import { Archive, Check, CircleAlert, Clock, LucideIcon, RotateCcw, Send, X } from 'lucide-react';
// Local
import { PeopleCount } from '../../../components/PeopleCount';
import { TonePill } from '../../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { COFFEE_HISTORY_PRESENCE_LABELS, CoffeeHistoryPresence } from '../../../domain/cafeSchedule';
import { formatDate, weekdayLabel } from '../../../domain/dates';
import { AppRoute } from '../../../routes/paths';
import { StatusTone } from '../../../types/person';
import { useCoffeeHistory } from '../hooks';

const PRESENCE_TONES: Record<CoffeeHistoryPresence, { tone: StatusTone; icon: LucideIcon }> = {
  came: { tone: 'success', icon: Check },
  missed: { tone: 'danger', icon: X },
  archived: { tone: 'muted', icon: Archive },
  unmarked: { tone: 'warning', icon: CircleAlert },
  enrolled: { tone: 'info', icon: Clock },
  invited: { tone: 'info', icon: Send },
  awaiting_contact: { tone: 'warning', icon: RotateCcw },
};

export function CoffeeRosterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, loading, error } = useCoffeeHistory();
  const event = events.find((item) => item.id === id);

  if (loading) return <Skeleton $h="320px" />;
  if (error || !event) return <Empty title="Café não encontrado" description={error ?? ''} />;

  return (
    <div>
      <PageHeader title="Café de Boas-vindas" subtitle={`${weekdayLabel(event.eventDate)}, ${formatDate(event.eventDate)}`} back />

      <PeopleCount count={event.people.length} />

      {event.people.length === 0 ? (
        <Empty title="Ninguém nesse café" description="Ninguém foi convidado para esse café." />
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th $shrink>Presença</Th>
              </tr>
            </thead>
            <tbody>
              {event.people.map((person) => (
                <Tr key={person.personId} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${person.personId}`)}>
                  <Td $truncate title={person.name}>
                    {person.name}
                  </Td>
                  <Td $shrink>
                    <PresencePill presence={person.presence} />
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

function PresencePill({ presence }: { presence: CoffeeHistoryPresence }) {
  const { tone, icon: Icon } = PRESENCE_TONES[presence];
  return (
    <TonePill $tone={tone}>
      <Icon size={12} />
      {COFFEE_HISTORY_PRESENCE_LABELS[presence]}
    </TonePill>
  );
}
