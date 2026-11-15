// Local
import { supabase } from '../lib/supabase';

const BUCKET = 'member-photos';
const URL_LIFETIME_SECONDS = 60 * 60;

export type PhotoVariant = 'photo' | 'thumb';

const photoPath = (personId: string, variant: PhotoVariant) => `${personId}/${variant}.jpg`;

export async function saveMemberPhoto(personId: string, photo: Blob, thumb: Blob): Promise<void> {
  const uploads = await Promise.all(
    [
      { variant: 'photo' as const, file: photo },
      { variant: 'thumb' as const, file: thumb },
    ].map(({ variant, file }) =>
      supabase.storage
        .from(BUCKET)
        .upload(photoPath(personId, variant), file, { upsert: true, contentType: 'image/jpeg' }),
    ),
  );
  const uploadError = uploads.find((result) => result.error)?.error;
  if (uploadError) throw uploadError;

  const { error } = await supabase
    .from('member_profiles')
    .upsert({ person_id: personId, photo_updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function removeMemberPhoto(personId: string): Promise<void> {
  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove([photoPath(personId, 'photo'), photoPath(personId, 'thumb')]);
  if (removeError) throw removeError;

  const { error } = await supabase.from('member_profiles').update({ photo_updated_at: null }).eq('person_id', personId);
  if (error) throw error;
}

export async function memberPhotoUrls(personIds: string[], variant: PhotoVariant): Promise<Record<string, string>> {
  if (personIds.length === 0) return {};
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(
    personIds.map((personId) => photoPath(personId, variant)),
    URL_LIFETIME_SECONDS,
  );
  if (error) throw error;
  return Object.fromEntries(
    data.flatMap((item, index) => (item.signedUrl ? [[personIds[index], item.signedUrl]] : [])),
  );
}
