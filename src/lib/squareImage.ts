export interface SquareCrop {
  x: number;
  y: number;
  side: number;
}

const PREPARE_ERROR = 'Não foi possível ler essa foto. Tente outra, em JPG ou PNG.';

export function centerSquare(width: number, height: number): SquareCrop {
  const side = Math.min(width, height);
  return { x: Math.round((width - side) / 2), y: Math.round((height - side) / 2), side };
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  try {
    const image = new Image();
    if (!url.startsWith('blob:')) image.crossOrigin = 'anonymous';
    image.src = url;
    await image.decode();
    if (image.naturalWidth === 0 || image.naturalHeight === 0) throw new Error(PREPARE_ERROR);
    return image;
  } catch {
    throw new Error(PREPARE_ERROR);
  }
}

export function fitInside(width: number, height: number, maxSide: number): { width: number; height: number } {
  const ratio = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

function drawJpeg(
  image: HTMLImageElement,
  width: number,
  height: number,
  source: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error(PREPARE_ERROR));
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(PREPARE_ERROR))), 'image/jpeg', 0.85),
  );
}

export function squareJpeg(
  image: HTMLImageElement,
  size: number,
  crop: SquareCrop = centerSquare(image.naturalWidth, image.naturalHeight),
): Promise<Blob> {
  return drawJpeg(image, size, size, { x: crop.x, y: crop.y, width: crop.side, height: crop.side });
}

export function scaledJpeg(image: HTMLImageElement, maxSide: number): Promise<Blob> {
  const { width, height } = fitInside(image.naturalWidth, image.naturalHeight, maxSide);
  return drawJpeg(image, width, height, { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight });
}
