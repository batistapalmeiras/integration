// Libs
import { LayoutGrid, List } from 'lucide-react';
// Local
import { ToggleButton, ToggleGroup } from './styles';

export type ListView = 'list' | 'grid';

const VIEWS = [
  { value: 'list', label: 'Lista', icon: List },
  { value: 'grid', label: 'Grade', icon: LayoutGrid },
] as const;

interface Props {
  value: ListView;
  onChange: (view: ListView) => void;
}

export function ViewToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup role="group" aria-label="Modo de exibição">
      {VIEWS.map(({ value: view, label, icon: Icon }) => (
        <ToggleButton
          key={view}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={value === view}
          $active={value === view}
          onClick={() => onChange(view)}
        >
          <Icon size={16} aria-hidden="true" />
        </ToggleButton>
      ))}
    </ToggleGroup>
  );
}
