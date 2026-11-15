// Local
import { centeredFrame, frameCrop, PhotoFrame } from '../../lib/photoFrame';
import { loadImage, scaledJpeg, squareJpeg } from '../../lib/squareImage';
import { MemberPhotoFiles } from '../../repositories/memberPhotos';

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
