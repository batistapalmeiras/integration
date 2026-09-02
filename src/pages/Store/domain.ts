// Libs
import { AppRoute } from '../../routes/paths';

// One shared link for the whole catalog — not per item — the pastor
// copies this once and sends it in the broadcast list.
export function getStorePublicLink(): string {
  return `${window.location.origin}${AppRoute.StorePublic}`;
}
