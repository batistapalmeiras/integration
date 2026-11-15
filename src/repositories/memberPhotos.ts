// Local
import { supabase } from '../lib/supabase';

const BUCKET = 'member-photos';
const URL_LIFETIME_SECONDS = 60 * 60;

export type PhotoVariant = 'photo' | 'thumb' | 'original';

export interface MemberPhotoFiles {
  photo: Blob;
  thumb: Blob;
  original?: Blob;
}

const ALL_VARIANTS: PhotoVariant[] = ['photo', 'thumb', 'original'];

const photoPath = (personId: string, variant: PhotoVariant) => `${personId}/${variant}.jpg`;

export async function saveMemberPhoto(personId: string, files: MemberPhotoFiles): Promise<void> {
  const uploads = await Promise.all(
    ALL_VARIANTS.flatMap((variant) => {
      const file = files[variant];
      return file
        ? [
            supabase.storage
              .from(BUCKET)
              .upload(photoPath(personId, variant), file, { upsert: true, contentType: 'image/jpeg' }),
          ]
        : [];
    }),
  );
  const uploadError = uploads.find((result) => result.error)?.error;
  if (uploadError) throw uploadError;

  const { error } = await supabase
    .from('member_profiles')
    .upsert({ person_id: personId, photo_updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function hasMemberPhoto(personId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('member_profiles')
    .select('photo_updated_at')
    .eq('person_id', personId)
    .maybeSingle();
  if (error) throw error;
  return !!data?.photo_updated_at;
}

export async function removeMemberPhoto(personId: string): Promise<void> {
  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(ALL_VARIANTS.map((variant) => photoPath(personId, variant)));
  if (removeError) throw removeError;

  const { error } = await supabase.from('member_profiles').update({ photo_updated_at: null }).eq('person_id', personId);
  if (error) throw error;
}

export type PhotoUrls = Record<PhotoVariant, Record<string, string>>;

export async function memberPhotoUrls(personIds: string[], variants: PhotoVariant[]): Promise<PhotoUrls> {
  const urls: PhotoUrls = { photo: {}, thumb: {}, original: {} };
  const requests = variants.flatMap((variant) => personIds.map((personId) => ({ variant, personId })));
  if (requests.length === 0) return urls;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(
    requests.map(({ variant, personId }) => photoPath(personId, variant)),
    URL_LIFETIME_SECONDS,
  );
  if (error) throw error;
  data.forEach((item, index) => {
    const { variant, personId } = requests[index];
    if (item.signedUrl) urls[variant][personId] = item.signedUrl;
  });
  return urls;
}
