// Libs
import { Button, Card, ModalTitle, useModal } from 'bp-kit';
import { Bot, Clock, User } from 'lucide-react';
// Components
import { FormActions } from '../FormLayout';
import { PanelTitle } from '../Panel';
// Local
import { formatDate, formatTimestamp } from '../../domain/dates';
import { previewTimeline, SYSTEM_ACTOR, TimelineEntry } from '../../domain/timeline';
import {
  EmptyText,
  GapDots,
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
} from './styles';

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

const entryKey = (entry: TimelineEntry) => `${entry.at ?? entry.date}-${entry.label}-${entry.detail ?? ''}`;

interface Props {
  title: string;
  modalTitle: string;
  entries: TimelineEntry[];
  emptyText?: string;
}

export function HistoryCard({ title, modalTitle, entries, emptyText }: Props) {
  const { open, close, modal } = useModal('drawer', { fullScreenOnMobile: true });

  if (entries.length === 0 && !emptyText) return null;

  const openFullHistory = () =>
    open(
      <>
        <ModalTitle onClose={close}>
          <ModalHeading>
            <Clock size={20} aria-hidden="true" />
            {modalTitle}
          </ModalHeading>
        </ModalTitle>
        <TimelineList>
          {entries.map((entry) => (
            <HistoryEntry key={entryKey(entry)} entry={entry} detailed />
          ))}
        </TimelineList>
      </>,
    );

  return (
    <Card as="section" aria-label={title}>
      <TitleRow>
        <Clock size={18} aria-hidden="true" />
        <PanelTitle>{title}</PanelTitle>
      </TitleRow>
      {entries.length === 0 ? (
        <EmptyText>{emptyText}</EmptyText>
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
                <HistoryEntry key={entryKey(item.entry)} entry={item.entry} detailed={false} />
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
