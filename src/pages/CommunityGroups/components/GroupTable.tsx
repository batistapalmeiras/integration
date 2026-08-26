// Libs
import { Button, Empty, PageHeader, Skeleton, text, useModal } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { GroupRow } from '../hooks/useCommunityGroupsList';
import { GroupModal } from './GroupModal';
import { CountPill } from '../styles';

interface Props {
  title: string;
  fieldLabel: string;
  rows: GroupRow[];
  loading: boolean;
  error: string | null;
  hasHosts?: boolean;
  onAdd: (name: string, leaders: string[], hosts: string[]) => Promise<void>;
  onRowClick: (id: string) => void;
}

export function GroupTable({ title, fieldLabel, rows, loading, error, hasHosts, onAdd, onRowClick }: Props) {
  const { open, close, modal } = useModal('drawer');

  const openAdd = () =>
    open(
      <GroupModal
        title={`Novo ${fieldLabel.toLowerCase()}`}
        fieldLabel={fieldLabel}
        hasHosts={hasHosts}
        close={close}
        onSave={onAdd}
      />,
    );

  return (
    <div>
      <PageHeader title={title} back action={<Button onClick={openAdd}>Adicionar</Button>} />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}
      {!loading && !error && rows.length === 0 && (
        <Empty title={`Nenhum ${fieldLabel.toLowerCase()} cadastrado`} description="Adicione o primeiro pelo botão acima." />
      )}

      {!loading && !error && rows.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Pessoas</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id} $clickable onClick={() => onRowClick(row.id)}>
                  <Td data-label="Nome">{row.name}</Td>
                  <Td data-label="Pessoas">
                    <CountPill>{row.peopleCount}</CountPill>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {modal}
    </div>
  );
}
