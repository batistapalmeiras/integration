// Libs
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Card, Typography } from 'bp-kit';
// Local
import { OptionLabel, OptionRow } from '../styles';

interface Props {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function MenuOptionCard({ icon: Icon, label, onClick }: Props) {
  return (
    <Card $hoverable onClick={onClick} role="button" tabIndex={0}>
      <OptionRow>
        <Icon size={20} />
        <OptionLabel>
          <Typography type="h6">{label}</Typography>
        </OptionLabel>
        <ChevronRight size={18} />
      </OptionRow>
    </Card>
  );
}
