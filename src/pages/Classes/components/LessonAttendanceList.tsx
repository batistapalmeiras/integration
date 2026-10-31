// React
import { ReactNode, useState } from 'react';
// Libs
import { Checkbox, text, Typography } from 'bp-kit';
// Local
import { List, ListChevron, ListHeader, ListItem, ListItemRow, ListName, ListSlot, ListStatusCell } from '../../../components/List';
import { StatusPill } from '../../../components/StatusPill';
import { currentLesson } from '../../../domain/cohortSchedule';
import { todayKey } from '../../../domain/dates';
import { hasCompletedLessons } from '../../../domain/membershipEligibility';
import { formatDate } from '../domain';
import { EnrollmentRow, Lesson } from '../types';
import { CountBadge, LessonTab, LessonTabs, NameHeading, PresenceHeading, StudentText } from '../styles';

interface Props {
  lessons: Lesson[];
  rows: EnrollmentRow[];
  onToggle: (enrollmentId: string, lessonId: string, attended: boolean) => void;
  onOpen: (personId: string) => void;
  summary: ReactNode;
  empty: ReactNode;
}

export function LessonAttendanceList({ lessons, rows, onToggle, onOpen, summary, empty }: Props) {
  const [lessonId, setLessonId] = useState(() => currentLesson(lessons, todayKey())?.id);
  const today = todayKey();
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  if (!lesson) return null;

  return (
    <>
      <LessonTabs role="tablist" aria-label="Aula">
        {lessons.map((l) => (
          <LessonTab
            key={l.id}
            type="button"
            role="tab"
            aria-selected={l.id === lesson.id}
            $selected={l.id === lesson.id}
            onClick={() => setLessonId(l.id)}
          >
            <Typography type="h6" as="span">
              Aula {l.number}
            </Typography>
            <Typography type="caption" as="span">
              {l.date === today ? 'Hoje' : formatDate(l.date).slice(0, 5)}
            </Typography>
          </LessonTab>
        ))}
      </LessonTabs>

      {summary}

      {rows.length === 0 && empty}

      {rows.length > 0 && (
        <List>
          <ListHeader aria-hidden="true">
            <ListSlot $width={20} />
            <NameHeading>
              <span>{text.fields.name}</span>
              <PresenceHeading>Presenças</PresenceHeading>
            </NameHeading>
            <ListStatusCell>Situação</ListStatusCell>
            <ListSlot $width={16} />
          </ListHeader>
          {rows.map((row) => {
            const checked = !!row.attendanceByLesson[lesson.id]?.attended;
            return (
              <ListItem key={row.id}>
                <ListItemRow>
                  <Checkbox
                    aria-label={`Presença de ${row.person.name} na aula ${lesson.number}`}
                    checked={checked}
                    onChange={(e) => onToggle(row.id, lesson.id, e.target.checked)}
                  />
                  <StudentText type="button" onClick={() => onOpen(row.person.id)}>
                    <ListName>{row.person.name}</ListName>
                    <CountBadge $eligible={hasCompletedLessons(row.attendedCount, lessons.length)}>
                      {row.attendedCount} de {lessons.length} aulas
                    </CountBadge>
                  </StudentText>
                  <ListStatusCell>
                    <StatusPill person={row.person} compact />
                  </ListStatusCell>
                  <ListChevron label={`Abrir perfil de ${row.person.name}`} onClick={() => onOpen(row.person.id)} />
                </ListItemRow>
              </ListItem>
            );
          })}
        </List>
      )}
    </>
  );
}
