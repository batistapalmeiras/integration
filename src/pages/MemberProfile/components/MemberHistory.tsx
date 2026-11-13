// Components
import { HistoryCard } from '../../../components/History';
// Local
import { isDirectSignup } from '../../../domain/origin';
import { membershipTimeline, visitTimeline } from '../../../domain/personTimeline';
import { sortTimeline } from '../../../domain/timeline';
import { recordFieldLabel } from '../../../features/memberRecord';
import { useMemberEvents, usePersonHistory } from '../../../queries/person';
import { MemberPage } from '../../../repositories/memberRecords';

interface Props {
  personId: string;
  name: string;
  info: MemberPage['info'];
}

export function MemberHistory({ personId, name, info }: Props) {
  const changes = usePersonHistory(personId).data ?? [];
  const events = useMemberEvents(personId).data ?? [];

  const integration = isDirectSignup(info.origin)
    ? []
    : visitTimeline({
        visitedOn: info.visitedOn,
        changes: changes.filter((change) => change.toStatus !== 'member'),
        upcomingCoffeeDate: null,
        cohortName: null,
        membershipInterestSentAt: null,
      });

  const membership = membershipTimeline({
    origin: info.origin,
    createdAt: info.createdAt,
    membershipInterestSentAt: info.membershipInterestSentAt,
    councilDate: info.council?.meetingDate ?? null,
    changes,
    events,
    communityJoins: info.communityJoins,
    fieldLabel: recordFieldLabel,
  });

  return (
    <HistoryCard
      title="Histórico"
      modalTitle={`Histórico de ${name}`}
      entries={sortTimeline([...integration, ...membership])}
      sections={[
        { title: 'Integração', entries: integration },
        { title: 'Membro', entries: membership },
      ]}
    />
  );
}
