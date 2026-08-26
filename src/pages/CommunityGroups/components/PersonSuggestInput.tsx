// React
import { useMemo, useRef, useState } from 'react';
// Libs
import { BaseInput, InputField } from 'bp-kit';
// Local
import { SuggestPanel, SuggestItem, SuggestWrapper } from '../styles';

const MAX_SUGGESTIONS = 6;

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (name: string) => void;
  options: string[];
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function PersonSuggestInput({ label, value, onChange, onSelect, options, placeholder, onKeyDown }: Props) {
  const [open, setOpen] = useState(false);
  // A blur can fire (e.g. tapping a suggestion on mobile) right before the
  // input regains focus. Without cancelling the pending close, that stale
  // timeout fires after the reopen and closes the panel that just opened.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    const filtered = query ? options.filter((name) => name.toLowerCase().includes(query)) : options;
    return filtered.slice(0, MAX_SUGGESTIONS);
  }, [value, options]);

  const showPanel = open && matches.length > 0;

  return (
    <BaseInput label={label}>
      <SuggestWrapper>
        <InputField
          value={value}
          placeholder={placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={() => {
            clearTimeout(closeTimer.current);
            setOpen(true);
          }}
          onBlur={() => {
            closeTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
        />
        {showPanel && (
          <SuggestPanel>
            {matches.map((name) => (
              <SuggestItem
                key={name}
                type="button"
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                onClick={() => {
                  clearTimeout(closeTimer.current);
                  onSelect(name);
                  setOpen(true);
                }}
              >
                {name}
              </SuggestItem>
            ))}
          </SuggestPanel>
        )}
      </SuggestWrapper>
    </BaseInput>
  );
}
