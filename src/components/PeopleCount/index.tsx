// Libs
import { Users } from 'lucide-react';
// Local
import { CountBadge } from '../CountBadge';

interface Props {
  count: number;
}

export function PeopleCount({ count }: Props) {
  return <CountBadge icon={Users} count={count} singular="pessoa" plural="pessoas" />;
}
