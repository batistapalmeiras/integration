// React
import { Control, useWatch } from 'react-hook-form';
// Libs
import { TextInput } from 'bp-kit';
// Local
import { ENTRY_TYPE_OPTIONS, LAST_CHURCH_PROMPTS } from '../options';
import { MembershipFormValues } from '../schema';
import { Hint } from '../styles';
import { ChoiceField } from './ChoiceField';

interface Props {
  control: Control<MembershipFormValues>;
}

export function JourneyStep({ control }: Props) {
  const entryType = useWatch({ control, name: 'entryType' });
  const lastChurch = entryType ? LAST_CHURCH_PROMPTS[entryType] : null;

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

      {lastChurch && (
        <>
          <TextInput label={lastChurch.label} control={control} name="lastChurch" placeholder={lastChurch.placeholder} />
          {lastChurch.hint && <Hint>{lastChurch.hint}</Hint>}
        </>
      )}
    </>
  );
}
