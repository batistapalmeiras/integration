// Local
import { centeredFrame, frameCrop, PhotoFrame } from '../../lib/photoFrame';
import { loadImage, scaledJpeg, squareJpeg } from '../../lib/squareImage';
import { MemberPhotoFiles, uploadSubmittedPhoto } from '../../repositories/memberPhotos';

const PHOTO_SIZE = 400;
const THUMB_SIZE = 112;
const ORIGINAL_MAX_SIDE = 1080;
export const CROP_VIEWPORT = 280;

export interface PickedPhoto {
  url: string;
  image: HTMLImageElement;
  frame: PhotoFrame;
}

export async function openPhoto(url: string): Promise<PickedPhoto> {
  const image = await loadImage(url);
  return { url, image, frame: centeredFrame(image.naturalWidth, image.naturalHeight, CROP_VIEWPORT) };
}

export async function preparePhotoFiles(photo: PickedPhoto): Promise<Required<MemberPhotoFiles>> {
  const crop = frameCrop(photo.frame);
  const [full, thumb, original] = await Promise.all([
    squareJpeg(photo.image, PHOTO_SIZE, crop),
    squareJpeg(photo.image, THUMB_SIZE, crop),
    scaledJpeg(photo.image, ORIGINAL_MAX_SIDE),
  ]);
  return { photo: full, thumb, original };
}

export interface ChosenPhoto {
  source: string;
  frame: PhotoFrame;
}

const dataUrlOf = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Não foi possível ler essa foto.'));
    reader.onerror = () => reject(new Error('Não foi possível ler essa foto.'));
    reader.readAsDataURL(blob);
  });

export async function choosePhoto(file: File): Promise<ChosenPhoto> {
  const url = URL.createObjectURL(file);
  try {
    const { image } = await openPhoto(url);
    const source = await dataUrlOf(await scaledJpeg(image, ORIGINAL_MAX_SIDE));
    const reduced = await loadImage(source);
    return { source, frame: centeredFrame(reduced.naturalWidth, reduced.naturalHeight, CROP_VIEWPORT) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadChosenPhoto(photo: ChosenPhoto): Promise<string> {
  const image = await loadImage(photo.source);
  return uploadSubmittedPhoto(await preparePhotoFiles({ url: photo.source, image, frame: photo.frame }));
}
