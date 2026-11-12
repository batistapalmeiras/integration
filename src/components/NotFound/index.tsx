// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Typography } from 'bp-kit';
import { ArrowLeft, SearchX } from 'lucide-react';
// Local
import { Action, IconCircle, Texts, Wrapper } from './styles';

interface Props {
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
}

export function NotFound({ title, description, backTo, backLabel }: Props) {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <IconCircle>
        <SearchX size={28} aria-hidden="true" />
      </IconCircle>
      <Texts>
        <Typography type="h4" as="h1">
          {title}
        </Typography>
        <Typography type="p">{description}</Typography>
      </Texts>
      <Action>
        <Button type="button" variant="secondary" fullWidth onClick={() => navigate(backTo, { replace: true })}>
          <ArrowLeft size={16} />
          {backLabel}
        </Button>
      </Action>
    </Wrapper>
  );
}
