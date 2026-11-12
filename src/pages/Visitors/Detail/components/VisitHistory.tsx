// Libs
import { Button, Card, ModalTitle, useModal } from 'bp-kit';
import { Bot, Clock, User } from 'lucide-react';
// Components
import { FormActions } from '../../../../components/FormLayout';
import { PanelTitle } from '../../../../components/Panel';
// Local
import { formatDate, formatTimestamp } from '../../../../domain/dates';
import { Person, previewTimeline, SYSTEM_ACTOR, TimelineEntry, visitTimeline } from '../../../../features/visitors';
import { usePersonHistory } from '../../../../queries/person';
import { PersonProfileSummary } from '../../../../repositories/people';
import {
  GapDots,
  Hint,
  ModalHeading,
  TimelineActor,
  TimelineBody,
  TimelineDate,
  TimelineDetail,
  TimelineDot,
  TimelineGap,
  TimelineHeadline,
  TimelineItem,
  TimelineLabel,
  TimelineList,
  TitleRow,
} from '../styles';

interface EntryProps {
  entry: TimelineEntry;
  detailed: boolean;
}

function HistoryEntry({ entry, detailed }: EntryProps) {
  const when = detailed && entry.at ? formatTimestamp(entry.at) : formatDate(entry.date);

  return (
    <TimelineItem $spacious={detailed}>
      <TimelineDot aria-hidden="true" />
      <TimelineBody>
        <TimelineHeadline>
          <TimelineDate>{when}</TimelineDate>
          {detailed && entry.actor && (
            <TimelineActor>
              {entry.actor === SYSTEM_ACTOR ? <Bot size={14} aria-hidden="true" /> : <User size={14} aria-hidden="true" />}
              {entry.actor}
            </TimelineActor>
          )}
        </TimelineHeadline>
        <TimelineLabel>{entry.label}</TimelineLabel>
        {entry.detail && <TimelineDetail>{entry.detail}</TimelineDetail>}
      </TimelineBody>
    </TimelineItem>
  );
}

interface Props {
  person: Person;
  profile: PersonProfileSummary;
}

export function VisitHistory({ person, profile }: Props) {
  const { open, close, modal } = useModal('drawer', { fullScreenOnMobile: true });
  const changes = usePersonHistory(person.id).data ?? [];
  const entries = visitTimeline({
    visitedOn: person.visited_on,
    changes,
    upcomingCoffeeDate: profile.coffee && !profile.coffee.attended ? profile.coffee.date : null,
    cohortName: profile.cohort?.name ?? null,
    membershipInterestSentAt: person.membership_interest_sent_at,
  });

  const openFullHistory = () =>
    open(
      <>
        <ModalTitle onClose={close}>
          <ModalHeading>
            <Clock size={20} aria-hidden="true" />
            Histórico de {person.name}
          </ModalHeading>
        </ModalTitle>
        <TimelineList>
          {entries.map((entry) => (
            <HistoryEntry key={`${entry.at ?? entry.date}-${entry.label}`} entry={entry} detailed />
          ))}
        </TimelineList>
      </>,
    );

  return (
    <Card as="section" aria-label="Histórico">
      <TitleRow>
        <Clock size={18} aria-hidden="true" />
        <PanelTitle>Histórico</PanelTitle>
      </TitleRow>
      {entries.length === 0 ? (
        <Hint>Ainda não há registros.</Hint>
      ) : (
        <>
          <TimelineList>
            {previewTimeline(entries).map((item) =>
              item.kind === 'gap' ? (
                <TimelineGap key="gap" aria-hidden="true">
                  <GapDots>
                    <span />
                  </GapDots>
                </TimelineGap>
              ) : (
                <HistoryEntry key={`${item.entry.at ?? item.entry.date}-${item.entry.label}`} entry={item.entry} detailed={false} />
              ),
            )}
          </TimelineList>
          <FormActions>
            <Button type="button" variant="secondary" onClick={openFullHistory}>
              Ver histórico completo
            </Button>
          </FormActions>
        </>
      )}
      {modal}
    </Card>
  );
}
