// Libs
import { Link } from 'lucide-react';
import { Card, Checkbox, IconButton, Skeleton, Typography, useToast } from 'bp-kit';
// Local
import { CountBadge } from '../../../Classes/styles';
import { formatDate } from '../../../../domain/dates';
import { membershipInterestMessage } from '../../../../domain/whatsapp';
import { Person } from '../../types';
import { CardHeader, LessonList, LessonRow, StagePanel } from '../styles';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';

interface IntegrationClassState {
  lessons: { id: string; number: number; date: string }[];
  attendanceByLesson: Record<string, { id: string; attended: boolean }>;
  attendedCount: number;
}

const MEMBERSHIP_THRESHOLD = 4;

interface Props {
  person: Person;
  integrationClass: IntegrationClassState | null;
  loading: boolean;
  canRecordAttendance: boolean;
  onToggle: (lessonId: string, attended: boolean) => Promise<void>;
  onCopyMakeupLink: (lessonId: string) => Promise<string>;
}

export function IntegrationStagePanel({ person, integrationClass, loading, canRecordAttendance, onToggle, onCopyMakeupLink }: Props) {
  const { show: showToast, toast } = useToast();

  if (loading || !integrationClass) return <Skeleton $h="120px" />;

  const { lessons, attendanceByLesson, attendedCount } = integrationClass;
  const lastLesson = lessons[lessons.length - 1];
  const todayKey = new Date().toISOString().slice(0, 10);
  const makeupUnlocked = !!lastLesson && lastLesson.date < todayKey;
  const eligible = attendedCount >= MEMBERSHIP_THRESHOLD;

  const copyMakeupLink = async (lessonId: string) => {
    const link = await onCopyMakeupLink(lessonId);
    await navigator.clipboard.writeText(link);
    showToast('Link de reposição copiado!');
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
            return (
              <LessonRow key={lesson.id}>
                <Checkbox
                  label={`Aula ${lesson.number} (${formatDate(lesson.date)})`}
                  checked={attended}
                  disabled={!canRecordAttendance}
                  onChange={(e) => onToggle(lesson.id, e.target.checked)}
                />
                {!attended && canRecordAttendance && makeupUnlocked && (
                  <IconButton
                    icon={<Link size={14} />}
                    iconPosition="center"
                    variant="secondary"
                    size="sm"
                    onClick={() => copyMakeupLink(lesson.id)}
                    title="Copiar link de reposição"
                  />
                )}
              </LessonRow>
            );
          })}
        </LessonList>
      </Card>

      {canRecordAttendance && eligible && (
        <WhatsAppMessageBox
          person={person}
          defaultMessage={membershipInterestMessage(person.name)}
          buttonLabel="Enviar Ficha de Interesse"
        />
      )}

      {toast}
    </StagePanel>
  );
}
