// React
import { Control, FieldPath, FieldValues } from 'react-hook-form';
// Libs
import { Select } from 'bp-kit';

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: { value: string; label: string }[];
}

export function SelectField<T extends FieldValues>({ control, name, label, options }: Props<T>) {
  return (
    <Select label={label} control={control} name={name}>
      <option value="">Selecione</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
