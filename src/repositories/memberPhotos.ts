// Local
import { storedValue } from '../lib/storage';
import { supabase } from '../lib/supabase';

const BUCKET = 'member-photos';
const DAY_MS = 24 * 60 * 60_000;
const URL_LIFETIME_SECONDS = (7 * DAY_MS) / 1000;
const URL_RENEW_BEFORE_MS = DAY_MS;
const FILE_CACHE_SECONDS = String(365 * 24 * 60 * 60);
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
  version: string;
}

interface SignedPhotoUrl {
  version: string;
  url: string;
  expiresAt: number;
}

type SignedPhotoUrls = Record<string, SignedPhotoUrl>;

const storedPhotoUrls = storedValue<SignedPhotoUrls>('member-photo-urls');
let signedPhotoUrls: SignedPhotoUrls | null = null;

const loadSignedPhotoUrls = (): SignedPhotoUrls => (signedPhotoUrls ??= storedPhotoUrls.load() ?? {});

export function clearSignedPhotoUrls(): void {
  signedPhotoUrls = {};
  storedPhotoUrls.clear();
}

const ALL_VARIANTS: PhotoVariant[] = ['photo', 'thumb', 'original'];

const photoPath = (folder: string, variant: PhotoVariant) => `${folder}/${variant}.jpg`;

export const photoOwnerOf = (
  personId: string,
  profile: { photo_updated_at: string | null; photo_folder: string | null } | null,
): PhotoOwner | null =>
  profile?.photo_updated_at
    ? { personId, folder: profile.photo_folder ?? personId, version: profile.photo_updated_at }
    : null;

export const photoOwnersOf = (rows: { photo: PhotoOwner | null }[]): PhotoOwner[] =>
  rows.flatMap((row) => (row.photo ? [row.photo] : []));

async function uploadPhotoFiles(folder: string, files: MemberPhotoFiles, upsert: boolean): Promise<void> {
  const uploads = await Promise.all(
    ALL_VARIANTS.flatMap((variant) => {
      const file = files[variant];
      return file
        ? [
            supabase.storage.from(BUCKET).upload(photoPath(folder, variant), file, {
              upsert,
              contentType: 'image/jpeg',
              cacheControl: FILE_CACHE_SECONDS,
            }),
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

export async function memberPhotoOwner(personId: string): Promise<PhotoOwner | null> {
  const { data, error } = await supabase
    .from('member_profiles')
    .select('photo_updated_at, photo_folder')
    .eq('person_id', personId)
    .maybeSingle();
  if (error) throw error;
  return photoOwnerOf(personId, data);
}

export async function removeMemberPhoto(owner: Pick<PhotoOwner, 'personId' | 'folder'>): Promise<void> {
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
  const cache = loadSignedPhotoUrls();
  const renewAt = Date.now() + URL_RENEW_BEFORE_MS;
  const requests = variants.flatMap((variant) =>
    owners.map((owner) => ({ variant, owner, path: photoPath(owner.folder, variant) })),
  );
  const missing = requests.filter(({ owner, path }) => {
    const cached = cache[path];
    return !cached || cached.version !== owner.version || cached.expiresAt < renewAt;
  });

  if (missing.length > 0) {
    const signedAt = Date.now();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(
      missing.map(({ path }) => path),
      URL_LIFETIME_SECONDS,
    );
    if (error) throw error;
    data.forEach((item, index) => {
      const { owner, path } = missing[index];
      if (item.signedUrl)
        cache[path] = {
          version: owner.version,
          url: item.signedUrl,
          expiresAt: signedAt + URL_LIFETIME_SECONDS * 1000,
        };
    });
    storedPhotoUrls.save(Object.fromEntries(Object.entries(cache).filter(([, entry]) => entry.expiresAt > signedAt)));
  }

  requests.forEach(({ variant, owner, path }) => {
    const cached = cache[path];
    if (cached?.version === owner.version) urls[variant][owner.personId] = cached.url;
  });
  return urls;
}
