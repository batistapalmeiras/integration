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

export async function loadImage(file: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (image.naturalWidth === 0 || image.naturalHeight === 0) throw new Error(PREPARE_ERROR);
    return image;
  } catch {
    throw new Error(PREPARE_ERROR);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function squareJpeg(image: HTMLImageElement, size: number): Promise<Blob> {
  const { x, y, side } = centerSquare(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error(PREPARE_ERROR));
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);
  context.drawImage(image, x, y, side, side, 0, 0, size, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(PREPARE_ERROR))), 'image/jpeg', 0.85),
  );
}
