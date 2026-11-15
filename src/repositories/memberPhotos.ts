// Local
import { supabase } from '../lib/supabase';

const BUCKET = 'member-photos';
const URL_LIFETIME_SECONDS = 60 * 60;
const SUBMISSIONS_FOLDER = 'submissions';

export type PhotoVariant = 'photo' | 'thumb' | 'original';

export interface MemberPhotoFiles {
  photo: Blob;
  thumb: Blob;
  original?: Blob;
}

export interface PhotoOwner {
  personId: string;
  folder: string;
}

const ALL_VARIANTS: PhotoVariant[] = ['photo', 'thumb', 'original'];

const photoPath = (folder: string, variant: PhotoVariant) => `${folder}/${variant}.jpg`;

export const photoFolderOf = (
  personId: string,
  profile: { photo_updated_at: string | null; photo_folder: string | null } | null,
): string | null => (profile?.photo_updated_at ? (profile.photo_folder ?? personId) : null);

export const photoOwnersOf = (rows: { id: string; photoFolder: string | null }[]): PhotoOwner[] =>
  rows.flatMap((row) => (row.photoFolder ? [{ personId: row.id, folder: row.photoFolder }] : []));

async function uploadPhotoFiles(folder: string, files: MemberPhotoFiles, upsert: boolean): Promise<void> {
  const uploads = await Promise.all(
    ALL_VARIANTS.flatMap((variant) => {
      const file = files[variant];
      return file
        ? [
            supabase.storage
              .from(BUCKET)
              .upload(photoPath(folder, variant), file, { upsert, contentType: 'image/jpeg' }),
          ]
        : [];
    }),
  );
  const uploadError = uploads.find((result) => result.error)?.error;
  if (uploadError) throw uploadError;
}

export async function saveMemberPhoto(personId: string, files: MemberPhotoFiles): Promise<void> {
  await uploadPhotoFiles(personId, files, true);
  const { error } = await supabase
    .from('member_profiles')
    .upsert({ person_id: personId, photo_updated_at: new Date().toISOString(), photo_folder: null });
  if (error) throw error;
}

export async function uploadSubmittedPhoto(files: MemberPhotoFiles): Promise<string> {
  const token = crypto.randomUUID();
  await uploadPhotoFiles(`${SUBMISSIONS_FOLDER}/${token}`, files, false);
  return token;
}

export async function memberPhotoFolder(personId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('member_profiles')
    .select('photo_updated_at, photo_folder')
    .eq('person_id', personId)
    .maybeSingle();
  if (error) throw error;
  return photoFolderOf(personId, data);
}

export async function removeMemberPhoto(owner: PhotoOwner): Promise<void> {
  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(ALL_VARIANTS.map((variant) => photoPath(owner.folder, variant)));
  if (removeError) throw removeError;

  const { error } = await supabase
    .from('member_profiles')
    .update({ photo_updated_at: null, photo_folder: null })
    .eq('person_id', owner.personId);
  if (error) throw error;
}

export type PhotoUrls = Record<PhotoVariant, Record<string, string>>;

export async function memberPhotoUrls(owners: PhotoOwner[], variants: PhotoVariant[]): Promise<PhotoUrls> {
  const urls: PhotoUrls = { photo: {}, thumb: {}, original: {} };
  const requests = variants.flatMap((variant) => owners.map((owner) => ({ variant, owner })));
  if (requests.length === 0) return urls;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(
    requests.map(({ variant, owner }) => photoPath(owner.folder, variant)),
    URL_LIFETIME_SECONDS,
  );
  if (error) throw error;
  data.forEach((item, index) => {
    const { variant, owner } = requests[index];
    if (item.signedUrl) urls[variant][owner.personId] = item.signedUrl;
  });
  return urls;
}
