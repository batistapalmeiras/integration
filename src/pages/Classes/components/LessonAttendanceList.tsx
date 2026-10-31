// React
import { useState } from 'react';
// Libs
import { Checkbox } from 'bp-kit';
// Local
import { todayKey } from '../../../domain/dates';
import { formatDate } from '../domain';
import { EnrollmentRow, Lesson } from '../types';
import {
  FootHint,
  LessonTab,
  LessonTabs,
  PresenceBar,
  PresenceHeader,
  StudentList,
  StudentText,
  StudentToggle,
} from '../styles';

interface Props {
  lessons: Lesson[];
  rows: EnrollmentRow[];
  onToggle: (enrollmentId: string, lessonId: string, attended: boolean) => void;
}

export function currentLessonId(lessons: Lesson[]): string | undefined {
  const today = todayKey();
  return [...lessons].reverse().find((l) => l.date <= today)?.id ?? lessons[0]?.id;
}

export function LessonAttendanceList({ lessons, rows, onToggle }: Props) {
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
            <strong>Aula {l.number}</strong>
            <span>{l.date === today ? 'Hoje' : formatDate(l.date).slice(0, 5)}</span>
          </LessonTab>
        ))}
      </LessonTabs>

      <PresenceHeader>
        <h2>Quem está aqui?</h2>
        <span>
          {present} de {rows.length} presentes
        </span>
      </PresenceHeader>
      <PresenceBar $percent={rows.length ? Math.round((present / rows.length) * 100) : 0} />

      <StudentList>
        {rows.map((row) => {
          const checked = !!row.attendanceByLesson[lesson.id]?.attended;
          return (
            <li key={row.id}>
              <StudentToggle $checked={checked}>
                <Checkbox
                  checked={checked}
                  onChange={(e) => onToggle(row.id, lesson.id, e.target.checked)}
                  label={
                    <StudentText>
                      <strong>{row.person.name}</strong>
                      <span>
                        {row.attendedCount} de {lessons.length} aulas
                      </span>
                    </StudentText>
                  }
                />
              </StudentToggle>
            </li>
          );
        })}
      </StudentList>
      <FootHint>Toque no nome para marcar. Salva sozinho.</FootHint>
    </>
  );
}
