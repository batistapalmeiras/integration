// Local
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { memberPhotoUrls, PhotoVariant } from '../repositories/memberPhotos';

const PHOTO_URL_STALE_TIME = 30 * 60_000;

export const useMemberPhotoUrls = (personIds: string[], variants: PhotoVariant[]) =>
  useQuery(queryKeys.memberPhotos(variants.join(','), personIds), () => memberPhotoUrls(personIds, variants), {
    enabled: personIds.length > 0,
    staleTime: PHOTO_URL_STALE_TIME,
  });
