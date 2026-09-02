// Libs
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Typography } from 'bp-kit';
// Local
import { Chevron, ComingSoonTag, IconBadge, OptionCard, OptionLabel, OptionRow } from '../styles';

interface Props {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function MenuOptionCard({ icon: Icon, label, onClick, disabled }: Props) {
  return (
    <OptionCard
      $hoverable={!disabled}
      $disabled={disabled}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <OptionRow>
        <IconBadge>
          <Icon size={20} />
        </IconBadge>
        <OptionLabel>
          <Typography type="h6">{label}</Typography>
          {disabled && <ComingSoonTag>Em breve</ComingSoonTag>}
        </OptionLabel>
        {!disabled && (
          <Chevron>
            <ChevronRight size={18} />
          </Chevron>
        )}
      </OptionRow>
    </OptionCard>
  );
}
