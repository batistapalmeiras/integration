// React
import { FormEvent, ReactNode } from 'react';
// Libs
import { Button, Form, LinkButton, ModalTitle } from 'bp-kit';
import { FilterX } from 'lucide-react';
// Local
import { Footer, Group, GroupTitle, Sheet } from './styles';

interface Props {
  close: () => void;
  onApply: () => void;
  onClear: () => void;
  canClear: boolean;
  children: ReactNode;
}

export function FiltersSheet({ close, onApply, onClear, canClear, children }: Props) {
  return (
    <Sheet>
      <ModalTitle onClose={close}>Filtros</ModalTitle>
      <Form onSubmit={(event: FormEvent) => event.preventDefault()}>{children}</Form>
      <Footer>
        <LinkButton icon={<FilterX size={16} />} onClick={onClear} disabled={!canClear}>
          Limpar
        </LinkButton>
        <Button type="button" variant="primary" onClick={onApply}>
          Aplicar
        </Button>
      </Footer>
    </Sheet>
  );
}

interface GroupProps {
  title?: string;
  children: ReactNode;
}

export function FilterGroup({ title, children }: GroupProps) {
  return (
    <Group>
      {title && <GroupTitle>{title}</GroupTitle>}
      {children}
    </Group>
  );
}
