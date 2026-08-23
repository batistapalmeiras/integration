// React
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
// Libs
import { Button, Checkbox, InfoBox, Skeleton, Textarea, Typography } from 'bp-kit';
// Local
import { ErrorMsg, Form } from '../../components/PublicPage/styles';
import { PublicPage } from '../../components/PublicPage';
import { useMakeupAttendance } from './hooks/useMakeupAttendance';
import { makeupAttendanceSchema, MakeupAttendanceFormValues } from './validators/schema';

export function MakeupAttendancePage() {
  const { token = '' } = useParams<{ token: string }>();
  const { context, loadError, loading, submit, submitting, submitError, confirmed } = useMakeupAttendance(token);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MakeupAttendanceFormValues>({
    resolver: zodResolver(makeupAttendanceSchema),
  });

  const onSubmit = handleSubmit((values) => submit(values.notes));

  return (
    <PublicPage title="Reposição de aula">
      {loading && <Skeleton $h="120px" />}

      {!loading && loadError && <ErrorMsg>{loadError}</ErrorMsg>}

      {!loading && context && (confirmed || context.already_confirmed) && (
        <InfoBox variant="info">
          Presença confirmada na Aula {context.lesson_number} — {context.cohort_name}. Obrigado por assistir!
        </InfoBox>
      )}

      {!loading && context && !confirmed && !context.already_confirmed && (
        <Form onSubmit={onSubmit}>
          <Typography type="p">
            Olá, {context.person_name}! Confirme abaixo que você assistiu a{' '}
            <strong>Aula {context.lesson_number}</strong> da {context.cohort_name}.
          </Typography>

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
            {submitting ? 'Enviando...' : 'Confirmar presença'}
          </Button>
        </Form>
      )}
    </PublicPage>
  );
}
