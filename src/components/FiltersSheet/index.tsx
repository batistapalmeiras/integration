// React
import { FormEvent, ReactNode } from 'react';
// Libs
import { Button, Form, LinkButton, ModalFooter, ModalTitle } from 'bp-kit';
import { FilterX } from 'lucide-react';
// Local
import { FooterContent, Group, GroupTitle } from './styles';

interface Props {
  close: () => void;
  onApply: () => void;
  onClear: () => void;
  canClear: boolean;
  children: ReactNode;
}

export function FiltersSheet({ close, onApply, onClear, canClear, children }: Props) {
  return (
    <>
      <ModalTitle onClose={close}>Filtros</ModalTitle>
      <Form onSubmit={(event: FormEvent) => event.preventDefault()}>{children}</Form>
      <ModalFooter>
        <FooterContent>
          <LinkButton icon={<FilterX size={16} />} onClick={onClear} disabled={!canClear}>
            Limpar
          </LinkButton>
          <Button type="button" variant="primary" onClick={onApply}>
            Aplicar
          </Button>
        </FooterContent>
      </ModalFooter>
    </>
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
