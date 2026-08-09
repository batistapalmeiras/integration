// React
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
// Libs
import { Button, RadioGroup } from 'bp-kit';
// Local
import { RESULT_LABELS } from '../../types';
import { ContactAttemptFormValues, contactAttemptSchema } from '../../validators';
import { Actions, Form } from '../styles';

const RESULT_OPTIONS = Object.entries(RESULT_LABELS).map(([value, label]) => ({ value, label }));

interface Props {
  onSubmit: (values: ContactAttemptFormValues) => Promise<void>;
}

export function ContactTab({ onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactAttemptFormValues>({
    resolver: zodResolver(contactAttemptSchema),
    defaultValues: { result: 'accepted' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <Form onSubmit={submit}>
      <Controller
        control={control}
        name="result"
        render={({ field }) => (
          <RadioGroup label="Resultado" name="result" options={RESULT_OPTIONS} value={field.value} onChange={field.onChange} />
        )}
      />

      <Actions>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Registrar'}
        </Button>
      </Actions>
    </Form>
  );
}
