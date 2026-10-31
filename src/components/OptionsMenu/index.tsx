// Libs
import { MoreHorizontal } from 'lucide-react';
// Local
import { RoundButton } from './styles';

export { OptionsMenuActions } from './styles';

interface Props {
  label: string;
  onClick: () => void;
}

export function OptionsMenuButton({ label, onClick }: Props) {
  return (
    <RoundButton type="button" aria-label={label} onClick={onClick}>
      <MoreHorizontal size={20} />
    </RoundButton>
  );
}
