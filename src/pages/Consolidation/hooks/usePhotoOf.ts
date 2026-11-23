// Local
import { useRelativePhotoUrls } from '../../../queries/memberPhotos';

export function usePhotoOf(entries: { personId: string }[]): (entry: { personId: string }) => string | null {
  const photos = useRelativePhotoUrls(entries.map((entry) => entry.personId));
  return (entry) => photos[entry.personId] ?? null;
}
