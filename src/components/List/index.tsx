// Libs
import { ChevronRight } from 'lucide-react';
// Local
import { ChevronButton, ChevronMark } from './styles';

export { List, ListGrow, ListHeader, ListItem, ListItemRow, ListName, ListSlot, ListStatusCell } from './styles';

interface Props {
  label?: string;
  onClick?: () => void;
}

export function ListChevron({ label, onClick }: Props) {
  if (!onClick) {
    return (
      <ChevronMark aria-hidden="true">
        <ChevronRight size={16} />
      </ChevronMark>
    );
  }
  return (
    <ChevronButton type="button" aria-label={label} onClick={onClick}>
      <ChevronRight size={16} />
    </ChevronButton>
  );
}
