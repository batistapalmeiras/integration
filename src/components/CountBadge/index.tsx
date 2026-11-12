// Libs
import { LucideIcon } from 'lucide-react';
// Local
import { Badge } from './styles';

interface Props {
  icon: LucideIcon;
  count: number;
  singular: string;
  plural: string;
}

export function CountBadge({ icon: Icon, count, singular, plural }: Props) {
  return (
    <Badge>
      <Icon size={14} />
      {count} {count === 1 ? singular : plural}
    </Badge>
  );
}

export { BadgeRow } from './styles';
