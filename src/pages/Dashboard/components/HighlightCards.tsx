// React
import { ComponentType } from 'react';
// Libs
import { StatCard, StatLabel } from 'bp-kit';
// Components
import { IconBadge } from '../../../components/MenuOptions';
// Local
import { CardLink, HighlightValue, Highlights, StatRow, StatText } from '../styles';

interface Highlight {
  label: string;
  value: number;
  icon: ComponentType<{ size?: number }>;
  link?: string;
  path?: string;
}

const LABEL_CHAR_WIDTH = 6.5;
const CARD_CHROME_WIDTH = 96;

function minCardWidth(items: Highlight[]): number {
  const longest = Math.max(...items.map((item) => item.label.length));
  return Math.ceil(longest * LABEL_CHAR_WIDTH + CARD_CHROME_WIDTH);
}

interface Props {
  label: string;
  items: Highlight[];
}

export function HighlightCards({ label, items }: Props) {
  return (
    <Highlights aria-label={label} $count={items.length} $minCardWidth={minCardWidth(items)}>
      {items.map((item) => (
        <StatCard key={item.label}>
          <StatRow>
            <IconBadge>
              <item.icon size={22} />
            </IconBadge>
            <StatText $singleLine>
              <StatLabel title={item.label}>{item.label}</StatLabel>
              <HighlightValue>{item.value}</HighlightValue>
              {item.link && item.path && <CardLink to={item.path}>{item.link}</CardLink>}
            </StatText>
          </StatRow>
        </StatCard>
      ))}
    </Highlights>
  );
}
