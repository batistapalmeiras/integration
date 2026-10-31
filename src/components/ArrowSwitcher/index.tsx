// Libs
import { Typography } from 'bp-kit';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// Local
import { Arrow, Label, Wrapper } from './styles';

interface Props {
  title: string;
  caption?: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function ArrowSwitcher({ title, caption, previousLabel, nextLabel, onPrevious, onNext }: Props) {
  return (
    <Wrapper>
      <Arrow type="button" aria-label={previousLabel} disabled={!onPrevious} onClick={onPrevious}>
        <ChevronLeft size={20} />
      </Arrow>
      <Label>
        <Typography type="h4">{title}</Typography>
        {caption && <Typography type="caption">{caption}</Typography>}
      </Label>
      <Arrow type="button" aria-label={nextLabel} disabled={!onNext} onClick={onNext}>
        <ChevronRight size={20} />
      </Arrow>
    </Wrapper>
  );
}
