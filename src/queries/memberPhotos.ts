// Local
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { memberPhotoOwner, memberPhotoUrls, PhotoOwner, PhotoVariant } from '../repositories/memberPhotos';

const PHOTO_URL_STALE_TIME = 30 * 60_000;

export const useMemberPhotoUrls = (owners: PhotoOwner[], variants: PhotoVariant[]) =>
  useQuery(
    queryKeys.memberPhotos(
      variants.join(','),
      owners.map((owner) => `${owner.personId}:${owner.folder}:${owner.version}`),
    ),
    () => memberPhotoUrls(owners, variants),
    { enabled: owners.length > 0, staleTime: PHOTO_URL_STALE_TIME },
  );

async function personPhotoUrl(personId: string): Promise<string | null> {
  const owner = await memberPhotoOwner(personId);
  if (!owner) return null;
  const urls = await memberPhotoUrls([owner], ['photo']);
  return urls.photo[personId] ?? null;
}

export const usePersonPhotoUrl = (personId: string, enabled: boolean) =>
  useQuery(queryKeys.personPhoto(personId), () => personPhotoUrl(personId), {
    enabled: enabled && !!personId,
    staleTime: PHOTO_URL_STALE_TIME,
  });
