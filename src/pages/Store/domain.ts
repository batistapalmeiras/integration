// Libs
import { AppRoute } from '../../routes/paths';

export function getStorePublicLink(): string {
  return `${window.location.origin}${AppRoute.StorePublic}`;
}
