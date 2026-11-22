// React
import { useEffect, useRef } from 'react';
// Libs
import { LucideIcon } from 'lucide-react';
// Local
import { FilterBar, FilterCount, FilterItem } from '../styles';

export interface ModuleFilterOption {
  value: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

interface Props {
  options: ModuleFilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export function ModuleFilter({ options, value, onChange }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [value]);

  return (
    <FilterBar role="group" aria-label="Módulo">
      {options.map(({ value: optionValue, label, icon: Icon, count }) => {
        const active = optionValue === value;
        return (
          <FilterItem
            key={optionValue}
            ref={active ? activeRef : undefined}
            type="button"
            $active={active}
            aria-pressed={active}
            onClick={() => onChange(optionValue)}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
            <FilterCount $active={active}>{count}</FilterCount>
          </FilterItem>
        );
      })}
    </FilterBar>
  );
}
