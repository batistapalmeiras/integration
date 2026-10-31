// Libs
import { Button, Checkbox, StatCard, StatLabel, StatValue, Typography } from 'bp-kit';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { TableWrapper, Td, Th } from '../../../components/Table';
import { formatTimestampDate, todayKey } from '../../../domain/dates';
import { formatDate } from '../domain';
import { EnrollmentRow, Lesson } from '../types';
import {
  CheckCell,
  Grid,
  LessonHead,
  StudentLink,
  SummaryCards,
} from '../styles';

interface Props {
  lessons: Lesson[];
  rows: EnrollmentRow[];
  onToggle: (enrollmentId: string, lessonId: string, attended: boolean) => void;
  onOpen: (personId: string) => void;
  onSendInterest: (row: EnrollmentRow) => void;
  onSendMakeup: (row: EnrollmentRow, lesson: Lesson) => void;
}

export function missedLessons(row: EnrollmentRow, lessons: Lesson[], today: string): Lesson[] {
  return lessons.filter((l) => l.date < today && !row.attendanceByLesson[l.id]?.attended);
}

export function AttendanceGrid({ lessons, rows, onToggle, onOpen, onSendInterest, onSendMakeup }: Props) {
  const today = todayKey();
  const completed = rows.filter((r) => r.attendedCount >= lessons.length && !r.person.membership_interest_sent_at);
  const needMakeup = rows.filter((r) => missedLessons(r, lessons, today).length > 0);
  const interestSent = rows.filter((r) => !!r.person.membership_interest_sent_at);

  const nextAction = (row: EnrollmentRow) => {
    if (row.person.membership_interest_sent_at) {
      return <Typography type="caption">Ficha enviada em {formatTimestampDate(row.person.membership_interest_sent_at)}</Typography>;
    }
    if (row.attendedCount >= lessons.length) {
      return (
        <Button size="sm" onClick={() => onSendInterest(row)}>
          Enviar ficha de interesse
        </Button>
      );
    }
    const missed = missedLessons(row, lessons, today)[0];
    if (missed) {
      return (
        <Button size="sm" variant="secondary" onClick={() => onSendMakeup(row, missed)}>
          Enviar reposição da aula {missed.number}
        </Button>
      );
    }
    return <StatusPill person={row.person} compact />;
  };

  return (
    <>
      <SummaryCards $columns={3}>
        <StatCard>
          <StatLabel>completaram as {lessons.length} aulas · enviar ficha</StatLabel>
          <StatValue>{completed.length}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>precisam de reposição</StatLabel>
          <StatValue $tone="warning">{needMakeup.length}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>ficha já enviada</StatLabel>
          <StatValue>{interestSent.length}</StatValue>
        </StatCard>
      </SummaryCards>

      <TableWrapper>
        <Grid>
          <thead>
            <tr>
              <Th scope="col">Aluno</Th>
              {lessons.map((l) => (
                <LessonHead key={l.id} scope="col">
                  Aula {l.number}
                  <span>{formatDate(l.date).slice(0, 5)}</span>
                </LessonHead>
              ))}
              <Th scope="col">Próxima ação</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <StudentLink type="button" onClick={() => onOpen(row.person.id)}>
                    <span>{row.person.name}</span>
                  </StudentLink>
                </Td>
                {lessons.map((l) => (
                  <CheckCell key={l.id}>
                    <Checkbox
                      aria-label={`Presença de ${row.person.name} na aula ${l.number}`}
                      checked={!!row.attendanceByLesson[l.id]?.attended}
                      onChange={(e) => onToggle(row.id, l.id, e.target.checked)}
                    />
                  </CheckCell>
                ))}
                <Td>{nextAction(row)}</Td>
              </tr>
            ))}
          </tbody>
        </Grid>
      </TableWrapper>
    </>
  );
}
