// Components
import { HistoryCard } from '../../../../components/History';
// Local
import { visitTimeline } from '../../../../domain/personTimeline';
import { Person } from '../../../../features/visitors';
import { usePersonHistory } from '../../../../queries/person';
import { PersonProfileSummary } from '../../../../repositories/people';

interface Props {
  person: Person;
  profile: PersonProfileSummary;
}

export function VisitHistory({ person, profile }: Props) {
  const changes = usePersonHistory(person.id).data ?? [];
  const entries = visitTimeline({
    visitedOn: person.visited_on,
    changes,
    upcomingCoffeeDate: profile.coffee && !profile.coffee.attended ? profile.coffee.date : null,
    cohortName: profile.cohort?.name ?? null,
    membershipInterestSentAt: person.membership_interest_sent_at,
  });

  return (
    <HistoryCard
      title="Histórico"
      modalTitle={`Histórico de ${person.name}`}
      entries={entries}
      emptyText="Ainda não há registros."
    />
  );
}
