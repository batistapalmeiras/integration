// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
// Libs
import { Button, Checkbox, DatePicker, MultiSelectOption, MultiSelect, RadioGroup, Textarea, TextInput, Typography } from 'bp-kit';
// Local
import { ErrorMsg, Form } from '../../../components/PublicPage/styles';
import { supabase } from '../../../lib/supabase';
import { ENTRY_TYPE_LABELS, WANTS_SMALL_GROUP_LABELS } from '../../../types/church';
import { MembershipInterestFormValues, membershipInterestSchema } from '../validators/schema';

const ENTRY_TYPE_OPTIONS = Object.entries(ENTRY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const WANTS_SMALL_GROUP_OPTIONS = Object.entries(WANTS_SMALL_GROUP_LABELS).map(([value, label]) => ({ value, label }));

interface Props {
  name: string;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (values: MembershipInterestFormValues) => void;
}

export function InterestFormStep({ name, submitting, submitError, onSubmit }: Props) {
  const [ministries, setMinistries] = useState<MultiSelectOption[]>([]);

  useEffect(() => {
    supabase
      .rpc('list_ministries')
      .then(({ data }) => setMinistries(((data ?? []) as { name: string }[]).map((m) => ({ value: m.name, label: m.name }))));
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MembershipInterestFormValues>({
    resolver: zodResolver(membershipInterestSchema),
    defaultValues: {
      birthDate: '',
      originChurch: '',
      secretSociety: '',
      membershipNote: '',
      ministryInterests: [],
      noMinistryInterest: false,
    },
  });

  const entryType = watch('entryType');
  const noMinistryInterest = watch('noMinistryInterest');

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Typography type="p">
        Olá, {name}! Preencha os dados abaixo para demonstrar seu desejo em fazer parte da nossa família. Sugerimos
        que você leia o estatuto da igreja antes de continuar — para ter acesso ao texto completo, basta pedir ao Pr.
        Ismael Arêdes.
      </Typography>

      <DatePicker
        label="Data de nascimento"
        control={control}
        name="birthDate"
        isDateDisabled={(date) => date > new Date()}
      />

      <Controller
        control={control}
        name="entryType"
        render={({ field }) => (
          <RadioGroup
            label="Você se tornará membro por qual forma?"
            name="entryType"
            options={ENTRY_TYPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {errors.entryType && <ErrorMsg>{errors.entryType.message}</ErrorMsg>}

      {entryType && entryType !== 'baptism' && (
        <TextInput
          label="De qual igreja você está vindo?"
          control={control}
          name="originChurch"
          placeholder="Nome da igreja"
        />
      )}

      <Controller
        control={control}
        name="statuteAgreed"
        render={({ field }) => (
          <Checkbox
            label="Declaro que estou de acordo em cumprir todo o Estatuto Social da Igreja Batista Central no Palmeiras."
            checked={field.value ?? false}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />
      {errors.statuteAgreed && <ErrorMsg>{errors.statuteAgreed.message}</ErrorMsg>}

      <Controller
        control={control}
        name="ministryInterests"
        render={({ field }) => (
          <MultiSelect
            label="Em quais ministérios deseja servir? Marque pelo menos 3."
            options={ministries}
            value={field.value}
            onChange={field.onChange}
            disabled={noMinistryInterest}
            placeholder="Buscar ministério…"
            error={errors.ministryInterests?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="noMinistryInterest"
        render={({ field }) => (
          <Checkbox
            label="Não posso ou não desejo servir agora"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />

      <Textarea
        label="Você faz parte de alguma sociedade secreta, ordem iniciática ou grupo reservado (como maçonaria, rosacruz, etc.)? Se sim, qual?"
        control={control}
        name="secretSociety"
        rows={2}
      />

      <Controller
        control={control}
        name="wantsSmallGroup"
        render={({ field }) => (
          <RadioGroup
            label="Você deseja fazer parte de um dos nossos Pequenos Grupos?"
            name="wantsSmallGroup"
            options={WANTS_SMALL_GROUP_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {errors.wantsSmallGroup && <ErrorMsg>{errors.wantsSmallGroup.message}</ErrorMsg>}

      <Textarea label="Deseja nos falar alguma coisa? (opcional)" control={control} name="membershipNote" rows={3} />

      {submitError && <ErrorMsg>{submitError}</ErrorMsg>}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar ficha'}
      </Button>
    </Form>
  );
}
