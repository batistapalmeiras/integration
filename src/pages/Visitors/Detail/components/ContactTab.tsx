// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, RawSelect, TextInput } from 'bp-kit';
// Local
import { CHANNEL_LABELS, RESULT_LABELS } from '../../types';
import { ContactAttemptFormValues, contactAttemptSchema } from '../../validators';
import { Actions } from '../styles';

interface Props {
  onSubmit: (values: ContactAttemptFormValues) => Promise<void>;
}

export function ContactTab({ onSubmit }: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactAttemptFormValues>({
    resolver: zodResolver(contactAttemptSchema),
    defaultValues: { channel: 'text', result: 'accepted' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <form onSubmit={submit}>
      <RawSelect label="Canal" {...register('channel')}>
        {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </RawSelect>

      <RawSelect label="Resultado" {...register('result')}>
        {Object.entries(RESULT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </RawSelect>

      <TextInput label="Observação (opcional)" control={control} name="note" placeholder="Ex: pediu pra ligar depois das 18h" />

      <Actions>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Registrar'}
        </Button>
      </Actions>
    </form>
  );
}
