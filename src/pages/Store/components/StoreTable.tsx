// Libs
import { useNavigate } from 'react-router-dom';
import { Button, Empty, IconButton, PageHeader, useToast } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { formatDate } from '../../../domain/dates';
import { AppRoute } from '../../../routes/paths';
import { getStorePublicLink } from '../domain';
import { ActionsRow, HeaderActions, StatusPill } from '../styles';
import { StoreItem } from '../types';

interface Props {
  items: StoreItem[];
}

export function StoreTable({ items }: Props) {
  const navigate = useNavigate();
  const { show: showToast, toast } = useToast();

  // One link for the whole catalog, not per item — the public page lists
  // every active item, so there's nothing to copy per row.
  const copyStoreLink = async () => {
    await navigator.clipboard.writeText(getStorePublicLink());
    showToast('Link copiado!');
  };

  return (
    <div>
      <PageHeader
        title="Loja"
        back
        action={
          <HeaderActions>
            <Button variant="secondary" onClick={copyStoreLink}>
              Copiar link
            </Button>
            <Button onClick={() => navigate(AppRoute.NewStoreItem)}>Adicionar</Button>
          </HeaderActions>
        }
      />

      {items.length === 0 && (
        <Empty title="Nenhum item cadastrado" description="Adicione o primeiro pelo botão acima." />
      )}

      {items.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th $shrink>Status</Th>
                <Th $hideOnMobile>Data limite</Th>
                <Th $shrink>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Tr key={item.id}>
                  <Td $truncate title={item.name}>
                    {item.name}
                  </Td>
                  <Td $shrink>
                    <StatusPill $active={item.active}>{item.active ? 'Ativo' : 'Inativo'}</StatusPill>
                  </Td>
                  <Td $hideOnMobile>{item.deadline ? formatDate(item.deadline) : '—'}</Td>
                  <Td $shrink>
                    <ActionsRow>
                      <IconButton
                        icon={<Pencil size={14} />}
                        iconPosition="center"
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`${AppRoute.Store}/${item.id}/editar`)}
                        title="Editar"
                      />
                    </ActionsRow>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {toast}
    </div>
  );
}
