// Local
import { SquareCrop } from './squareImage';

export interface PhotoFrame {
  imageWidth: number;
  imageHeight: number;
  viewport: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

const coverScale = (frame: Pick<PhotoFrame, 'imageWidth' | 'imageHeight' | 'viewport'>) =>
  frame.viewport / Math.min(frame.imageWidth, frame.imageHeight);

export const frameScale = (frame: PhotoFrame) => coverScale(frame) * frame.zoom;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function clampFrame(frame: PhotoFrame): PhotoFrame {
  const scale = frameScale(frame);
  return {
    ...frame,
    offsetX: clamp(frame.offsetX, frame.viewport - frame.imageWidth * scale, 0),
    offsetY: clamp(frame.offsetY, frame.viewport - frame.imageHeight * scale, 0),
  };
}

export function centeredFrame(imageWidth: number, imageHeight: number, viewport: number): PhotoFrame {
  const scale = coverScale({ imageWidth, imageHeight, viewport });
  return {
    imageWidth,
    imageHeight,
    viewport,
    zoom: MIN_ZOOM,
    offsetX: (viewport - imageWidth * scale) / 2,
    offsetY: (viewport - imageHeight * scale) / 2,
  };
}

export function moveFrame(frame: PhotoFrame, deltaX: number, deltaY: number): PhotoFrame {
  return clampFrame({ ...frame, offsetX: frame.offsetX + deltaX, offsetY: frame.offsetY + deltaY });
}

export function zoomFrame(frame: PhotoFrame, zoom: number): PhotoFrame {
  const nextZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  const half = frame.viewport / 2;
  const ratio = nextZoom / frame.zoom;
  return clampFrame({
    ...frame,
    zoom: nextZoom,
    offsetX: half - (half - frame.offsetX) * ratio,
    offsetY: half - (half - frame.offsetY) * ratio,
  });
}

export function frameCrop(frame: PhotoFrame): SquareCrop {
  const scale = frameScale(frame);
  return {
    x: Math.round(-frame.offsetX / scale) || 0,
    y: Math.round(-frame.offsetY / scale) || 0,
    side: Math.round(frame.viewport / scale),
  };
}
