// Libs
import { Send } from 'lucide-react';
import { Card, Checkbox, LinkButton, ModalTitle, Skeleton, Typography, useModal } from 'bp-kit';
// Local
import { CountBadge } from '../../../Classes/styles';
import { formatDate, todayKey } from '../../../../domain/dates';
import { hasCompletedLessons } from '../../../../domain/membershipEligibility';
import { makeupLessonMessage, membershipInterestMessage } from '../../../../domain/whatsapp';
import { Person } from '../../../../features/visitors';
import { CardHeader, LessonList, LessonMakeupAction, LessonRow, StagePanel } from '../styles';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';

interface IntegrationClassState {
  lessons: { id: string; number: number; date: string }[];
  attendanceByLesson: Record<string, { id: string; attended: boolean }>;
  attendedCount: number;
}

interface Props {
  person: Person;
  integrationClass: IntegrationClassState | null;
  loading: boolean;
  canRecordAttendance: boolean;
  onToggle: (lessonId: string, attended: boolean) => Promise<void>;
  onGetMakeupLink: (lessonId: string) => Promise<string>;
  onMembershipInterestSent: () => Promise<void>;
}

export function IntegrationStagePanel({
  person,
  integrationClass,
  loading,
  canRecordAttendance,
  onToggle,
  onGetMakeupLink,
  onMembershipInterestSent,
}: Props) {
  const { open, close, modal } = useModal('drawer');

  if (loading || !integrationClass) return <Skeleton $h="120px" />;

  const { lessons, attendanceByLesson, attendedCount } = integrationClass;
  const lastLesson = lessons[lessons.length - 1];
  const makeupUnlocked = !!lastLesson && lastLesson.date < todayKey();
  const eligible = hasCompletedLessons(attendedCount, lessons.length);

  const openMakeupMessage = async (lessonId: string, lessonNumber: number) => {
    const link = await onGetMakeupLink(lessonId);
    open(
      <>
        <ModalTitle onClose={close}>Reposição da Aula {lessonNumber}</ModalTitle>
        <WhatsAppMessageBox
          person={person}
          defaultMessage={makeupLessonMessage(person.name, lessonNumber, link)}
          buttonLabel="Enviar pelo WhatsApp"
          rows={16}
          bare
          onOpen={close}
        />
      </>,
    );
  };

  return (
    <StagePanel>
      <Card>
        <CardHeader>
          <Typography type="label">Presença nas aulas</Typography>
          <CountBadge $eligible={eligible}>
            {attendedCount}/{lessons.length} aulas
          </CountBadge>
        </CardHeader>

        <LessonList>
          {lessons.map((lesson) => {
            const attended = attendanceByLesson[lesson.id]?.attended ?? false;
            const needsMakeup = !attended && canRecordAttendance && makeupUnlocked;
            return (
              <LessonRow key={lesson.id}>
                <Checkbox
                  label={`Aula ${lesson.number} (${formatDate(lesson.date)})`}
                  checked={attended}
                  disabled={!canRecordAttendance}
                  onChange={(e) => onToggle(lesson.id, e.target.checked)}
                />
                {needsMakeup && (
                  <LessonMakeupAction>
                    <LinkButton type="button" onClick={() => openMakeupMessage(lesson.id, lesson.number)}>
                      <Send size={14} />
                      Link de reposição
                    </LinkButton>
                  </LessonMakeupAction>
                )}
              </LessonRow>
            );
          })}
        </LessonList>
      </Card>

      {canRecordAttendance && (
        <WhatsAppMessageBox
          person={person}
          defaultMessage={membershipInterestMessage(person.name, eligible)}
          buttonLabel="Enviar Ficha de Interesse"
          onOpen={onMembershipInterestSent}
        />
      )}

      {modal}
    </StagePanel>
  );
}
