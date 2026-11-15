// Local
import { frameScale, PhotoFrame } from '../../lib/photoFrame';
import { CropImage, FramedCircle } from './styles';

interface Props {
  source: string;
  frame: PhotoFrame;
  size: number;
}

export function FramedPhoto({ source, frame, size }: Props) {
  const ratio = size / frame.viewport;
  const scale = frameScale(frame) * ratio;
  return (
    <FramedCircle $size={size}>
      <CropImage
        src={source}
        alt=""
        $width={frame.imageWidth * scale}
        $height={frame.imageHeight * scale}
        $x={frame.offsetX * ratio}
        $y={frame.offsetY * ratio}
      />
    </FramedCircle>
  );
}
