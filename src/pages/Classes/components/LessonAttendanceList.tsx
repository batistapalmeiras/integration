// React
import { useState } from 'react';
// Libs
import { Checkbox, Typography } from 'bp-kit';
// Local
import { List, ListItem, ListItemRow } from '../../../components/List';
import { StatusPill } from '../../../components/StatusPill';
import { todayKey } from '../../../domain/dates';
import { formatDate } from '../domain';
import { EnrollmentRow, Lesson } from '../types';
import {
  CountBadge,
  LessonTab,
  LessonTabs,
  PresenceBar,
  PresenceHeader,
  StudentTags,
  StudentText,
} from '../styles';

interface Props {
  lessons: Lesson[];
  rows: EnrollmentRow[];
  onToggle: (enrollmentId: string, lessonId: string, attended: boolean) => void;
  onOpen: (personId: string) => void;
}

export function currentLessonId(lessons: Lesson[]): string | undefined {
  const today = todayKey();
  return [...lessons].reverse().find((l) => l.date <= today)?.id ?? lessons[0]?.id;
}

export function LessonAttendanceList({ lessons, rows, onToggle, onOpen }: Props) {
  const [lessonId, setLessonId] = useState(() => currentLessonId(lessons));
  const today = todayKey();
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  if (!lesson) return null;

  const present = rows.filter((r) => r.attendanceByLesson[lesson.id]?.attended).length;

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

      <PresenceHeader>
        <Typography type="h4" as="h2">
          Quem está aqui?
        </Typography>
        <Typography type="caption" as="span">
          {present} de {rows.length} presentes
        </Typography>
      </PresenceHeader>
      <PresenceBar $percent={rows.length ? Math.round((present / rows.length) * 100) : 0} />

      <List>
        {rows.map((row) => {
          const checked = !!row.attendanceByLesson[lesson.id]?.attended;
          return (
            <ListItem key={row.id} $selected={checked}>
              <ListItemRow>
                <Checkbox
                  aria-label={`Presença de ${row.person.name} na aula ${lesson.number}`}
                  checked={checked}
                  onChange={(e) => onToggle(row.id, lesson.id, e.target.checked)}
                />
                <StudentText type="button" onClick={() => onOpen(row.person.id)}>
                  <span>{row.person.name}</span>
                  <StudentTags>
                    <CountBadge $eligible={row.attendedCount >= lessons.length}>
                      {row.attendedCount}/{lessons.length}
                    </CountBadge>
                    <StatusPill person={row.person} compact />
                  </StudentTags>
                </StudentText>
              </ListItemRow>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
