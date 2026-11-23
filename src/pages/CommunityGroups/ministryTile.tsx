// Local
import { ministryIconFor } from './ministryIcons';

export function ministryTile(name: string) {
  const Icon = ministryIconFor(name);
  return <Icon size={20} aria-hidden="true" />;
}
