// Libs
import { Checkbox } from 'bp-kit';
// Local
import { CheckboxColumns, CheckboxLabel, CheckboxSet } from '../styles';

interface Props<K extends string> {
  label?: string;
  options: { value: K; label: string }[];
  value: K[];
  onChange: (value: K[]) => void;
}

export function CheckboxFilter<K extends string>({ label, options, value, onChange }: Props<K>) {
  const toggle = (item: K) => onChange(value.includes(item) ? value.filter((chosen) => chosen !== item) : [...value, item]);

  return (
    <CheckboxSet role="group" aria-label={label}>
      {label && <CheckboxLabel>{label}</CheckboxLabel>}
      <CheckboxColumns>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
        ))}
      </CheckboxColumns>
    </CheckboxSet>
  );
}
