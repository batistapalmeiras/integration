// React
import { Control, Controller, useWatch } from 'react-hook-form';
// Libs
import { Checkbox, TextInput } from 'bp-kit';
// Local
import { ENTRY_TYPE_OPTIONS } from '../options';
import { MembershipFormValues } from '../schema';
import { ChoiceField } from './ChoiceField';

interface Props {
  control: Control<MembershipFormValues>;
}

export function JourneyStep({ control }: Props) {
  const entryType = useWatch({ control, name: 'entryType' });
  const firstChurch = useWatch({ control, name: 'firstChurch' });

  return (
    <>
      <ChoiceField
        control={control}
        name="entryType"
        label="De que forma você vai se tornar membro da Igreja Batista Palmeiras?"
        options={ENTRY_TYPE_OPTIONS}
      />

      {entryType && entryType !== 'baptism' && (
        <>
          <TextInput label="Igreja onde foi batizado(a) (opcional)" control={control} name="baptismChurch" />
          <TextInput
            label="Data do batismo (opcional)"
            control={control}
            name="baptismDate"
            mask="date"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
          />
        </>
      )}

      <TextInput
        label="Qual a última igreja que você frequentou?"
        control={control}
        name="lastChurch"
        placeholder="Nome da igreja"
        disabled={firstChurch}
      />
      <Controller
        control={control}
        name="firstChurch"
        render={({ field }) => (
          <Checkbox
            label="A Batista Palmeiras é a primeira igreja que frequento"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />
    </>
  );
}
