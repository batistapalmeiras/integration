// React
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm, useWatch } from 'react-hook-form';
// Libs
import { Button, Textarea, TextInput } from 'bp-kit';
import { Check } from 'lucide-react';
// Local
import { ActionBar, Form } from '../../../components/PublicPage/styles';
import { TeamContactError } from '../../../components/PublicPage/TeamContactError';
import { SelectField } from '../../../components/SelectField';
import { MARITAL_STATUS_OPTIONS } from '../../../domain/memberRecords';
import { YES_NO_OPTIONS } from '../../../domain/text';
import { SignupFormValues, signupFormSchema } from '../validators/schema';

interface Props {
  name: string;
  submitting: boolean;
  error: string | null;
  initialValues?: Partial<SignupFormValues>;
  onSubmit: (values: SignupFormValues) => void;
  onValuesChange: (values: Partial<SignupFormValues>) => void;
}

export function SignupFormStep({ name, submitting, error, initialValues, onSubmit, onValuesChange }: Props) {
  const { control, handleSubmit, watch } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema) as Resolver<SignupFormValues>,
    defaultValues: {
      name,
      baptized: '',
      baptismChurch: '',
      previousChurch: '',
      conversionTestimony: '',
      maritalStatus: '',
      maritalStatusStory: '',
      ...initialValues,
    },
  });
  const [baptized, maritalStatus] = useWatch({ control, name: ['baptized', 'maritalStatus'] });

  useEffect(() => {
    const subscription = watch(onValuesChange);
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextInput label="Nome completo" control={control} name="name" placeholder="Nome completo" />
      <SelectField control={control} name="baptized" label="Você é batizado(a)?" options={YES_NO_OPTIONS} />
      {baptized === 'yes' && (
        <TextInput label="Em qual igreja você foi batizado(a)?" control={control} name="baptismChurch" />
      )}

      <TextInput
        label="Qual igreja você frequentava antes?"
        control={control}
        name="previousChurch"
        placeholder="Se não frequentava, escreva: nenhuma"
      />

      <Textarea
        label="Conte como foi sua conversão. Fique à vontade para dar detalhes."
        control={control}
        name="conversionTestimony"
        rows={4}
      />

      <SelectField control={control} name="maritalStatus" label="Estado civil" options={MARITAL_STATUS_OPTIONS} />
      {maritalStatus && maritalStatus !== 'single' && (
        <Textarea
          label="Conte um pouco da história do seu relacionamento"
          control={control}
          name="maritalStatusStory"
          rows={4}
        />
      )}

      {error && <TeamContactError message={error} />}

      <ActionBar>
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
          {submitting ? (
            'Enviando...'
          ) : (
            <>
              <Check size={16} />
              Confirmar inscrição
            </>
          )}
        </Button>
      </ActionBar>
    </Form>
  );
}
