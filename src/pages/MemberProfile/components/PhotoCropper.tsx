// React
import { ChangeEvent, PointerEvent, useRef } from 'react';
// Libs
import { ZoomIn, ZoomOut } from 'lucide-react';
// Local
import { MAX_ZOOM, MIN_ZOOM, moveFrame, PhotoFrame, frameScale, zoomFrame } from '../../../lib/photoFrame';
import { CropImage, CropMask, CropViewport, ZoomRange, ZoomRow } from '../styles';

interface Props {
  url: string;
  frame: PhotoFrame;
  onChange: (frame: PhotoFrame) => void;
}

export function PhotoCropper({ url, frame, onChange }: Props) {
  const last = useRef<{ x: number; y: number } | null>(null);
  const scale = frameScale(frame);

  const start = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    last.current = { x: event.clientX, y: event.clientY };
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!last.current) return;
    const deltaX = event.clientX - last.current.x;
    const deltaY = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY };
    onChange(moveFrame(frame, deltaX, deltaY));
  };

  const stop = () => {
    last.current = null;
  };

  return (
    <>
      <CropViewport
        $size={frame.viewport}
        onPointerDown={start}
        onPointerMove={drag}
        onPointerUp={stop}
        onPointerCancel={stop}
        aria-label="Arraste para posicionar a foto"
      >
        <CropImage
          src={url}
          alt=""
          draggable={false}
          $width={frame.imageWidth * scale}
          $height={frame.imageHeight * scale}
          $x={frame.offsetX}
          $y={frame.offsetY}
        />
        <CropMask />
      </CropViewport>
      <ZoomRow>
        <ZoomOut size={16} aria-hidden="true" />
        <ZoomRange
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={frame.zoom}
          aria-label="Aproximar"
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(zoomFrame(frame, Number(event.target.value)))}
        />
        <ZoomIn size={16} aria-hidden="true" />
      </ZoomRow>
    </>
  );
}
