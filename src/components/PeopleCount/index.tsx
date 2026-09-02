// Libs
import { Users } from 'lucide-react';
// Local
import { Badge } from './styles';

interface Props {
  count: number;
}

export function PeopleCount({ count }: Props) {
  return (
    <Badge>
      <Users size={14} />
      {count} {count === 1 ? 'pessoa' : 'pessoas'}
    </Badge>
  );
}
