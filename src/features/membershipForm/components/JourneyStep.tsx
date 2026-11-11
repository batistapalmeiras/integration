// React
import { Control, useWatch } from 'react-hook-form';
// Libs
import { DatePicker, TextInput } from 'bp-kit';
// Local
import { ENTRY_TYPE_OPTIONS, LAST_CHURCH_PROMPTS } from '../options';
import { MembershipFormValues } from '../schema';
import { Hint } from '../styles';
import { isFutureDate } from '../../../domain/dates';
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
          <TextInput label="Igreja onde foi batizado(a)" control={control} name="baptismChurch" />
          <DatePicker
            label="Data do batismo (opcional)"
            control={control}
            name="baptismDate"
            isDateDisabled={isFutureDate}
          />
        </>
      )}

      {lastChurch && (
        <>
          <TextInput
            label={lastChurch.label}
            control={control}
            name="lastChurch"
            placeholder={lastChurch.placeholder}
          />
          {lastChurch.hint && <Hint>{lastChurch.hint}</Hint>}
        </>
      )}
    </>
  );
}
