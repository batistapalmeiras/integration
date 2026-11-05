// React
import { Control, Controller, FieldPath } from 'react-hook-form';
// Libs
import { RadioGroup, RadioGroupOption } from 'bp-kit';
// Local
import { MembershipFormValues } from '../schema';

interface Props {
  control: Control<MembershipFormValues>;
  name: FieldPath<MembershipFormValues>;
  label: string;
  options: RadioGroupOption[];
}

export function ChoiceField({ control, name, label, options }: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <RadioGroup
          label={label}
          name={name}
          options={options}
          value={field.value as string}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
