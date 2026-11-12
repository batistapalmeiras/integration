// React
import { ReactNode } from 'react';
// Libs
import { LucideIcon } from 'lucide-react';
// Local
import { Badge, Body, Item, Label, Panel } from './styles';

interface Props {
  icon: LucideIcon;
  label?: string;
  empty?: boolean;
  children: ReactNode;
}

export function InfoLine({ icon: Icon, label, empty = false, children }: Props) {
  return (
    <Item $empty={empty}>
      <Badge $empty={empty}>
        <Icon size={18} aria-hidden="true" />
      </Badge>
      <Body>
        {label && <Label>{label}</Label>}
        {children}
      </Body>
    </Item>
  );
}

export function InfoPanel({ children }: { children: ReactNode }) {
  return <Panel>{children}</Panel>;
}
