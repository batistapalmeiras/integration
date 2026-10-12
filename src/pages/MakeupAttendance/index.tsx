// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Checkbox, InfoBox, Skeleton, Textarea, Typography } from 'bp-kit';
import { Check } from 'lucide-react';
// Local
import { getMakeupVideoId } from '../../domain/makeupVideos';
import { AppRoute } from '../../routes/paths';
import { ErrorMsg, Form } from '../../components/PublicPage/styles';
import { PublicPage } from '../../components/PublicPage';
import { useMakeupAttendance } from './hooks/useMakeupAttendance';
import { ConfirmBlock, VideoWrapper } from './styles';
import { makeupAttendanceSchema, MakeupAttendanceFormValues } from './validators/schema';

export function MakeupAttendancePage() {
  const navigate = useNavigate();
  const { token = '' } = useParams<{ token: string }>();
  const [showForm, setShowForm] = useState(false);
  const { context, loadError, loading, submit, submitting, submitError, confirmed } = useMakeupAttendance(token);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MakeupAttendanceFormValues>({
    resolver: zodResolver(makeupAttendanceSchema),
    defaultValues: { notes: '' },
  });

  const onSubmit = handleSubmit((values) => submit(values.notes));

  return (
    <PublicPage title="Reposição de aula">
      {loading && <Skeleton $h="120px" />}

      {!loading && loadError && <ErrorMsg>{loadError}</ErrorMsg>}

      {!loading && context && (confirmed || context.already_confirmed) && (
        <>
          <InfoBox variant="info">
            Presença confirmada na Aula {context.lesson_number} — {context.cohort_name}. Obrigado por assistir!
          </InfoBox>

          <Typography type="p">
            Se você tem interesse em se tornar membro da nossa igreja, já pode preencher a Ficha de Interesse de
            Membresia.
          </Typography>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(AppRoute.MembershipInterest)}
          >
            Preencher Ficha de Interesse
          </Button>
        </>
      )}

      {!loading && context && !confirmed && !context.already_confirmed && (
        <Form onSubmit={onSubmit}>
          <Typography type="p">
            Olá, {context.person_name}! Assista abaixo à <strong>Aula {context.lesson_number}</strong> e
            confirme ao final.
          </Typography>

          {!showForm && (
            <>
              {getMakeupVideoId(context.lesson_number) && (
                <VideoWrapper>
                  <iframe
                    src={`https://www.youtube.com/embed/${getMakeupVideoId(context.lesson_number)}`}
                    title={`Aula ${context.lesson_number}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </VideoWrapper>
              )}

              <Button type="button" variant="primary" size="lg" fullWidth onClick={() => setShowForm(true)}>
                Próximo
              </Button>
            </>
          )}

          <ConfirmBlock hidden={!showForm}>
            <Controller
              control={control}
              name="declaration"
              render={({ field }) => (
                <Checkbox
                  label={`Declaro que assisti a Aula ${context.lesson_number} até o final.`}
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            {errors.declaration && <ErrorMsg>{errors.declaration.message}</ErrorMsg>}

            <Textarea
              label="Teve alguma dúvida ou algo te chamou a atenção? (opcional)"
              control={control}
              name="notes"
              rows={4}
            />

            {submitError && <ErrorMsg>{submitError}</ErrorMsg>}

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
              {submitting ? (
                'Enviando...'
              ) : (
                <>
                  <Check size={16} />
                  Confirmar presença
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              disabled={submitting}
              onClick={() => setShowForm(false)}
            >
              Voltar
            </Button>
          </ConfirmBlock>
        </Form>
      )}
    </PublicPage>
  );
}
