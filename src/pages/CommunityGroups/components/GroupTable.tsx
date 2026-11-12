// React
import { ReactNode } from 'react';
// Libs
import { Button, Empty, Skeleton, text, useModal } from 'bp-kit';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { GroupInput, WEEK_DAY_LABELS } from '../../../domain/communityGroups';
import { GroupRow } from '../hooks/useCommunityGroupsList';
import { CountPill } from '../styles';
import { GroupModal } from './GroupModal';

interface Props {
  title: string;
  fieldLabel: string;
  rows: GroupRow[];
  loading: boolean;
  error: string | null;
  smallGroup?: boolean;
  counts: ReactNode;
  onAdd: (input: GroupInput) => Promise<void>;
  onRowClick: (id: string) => void;
}

export function GroupTable({ title, fieldLabel, rows, loading, error, smallGroup, counts, onAdd, onRowClick }: Props) {
  const { open, close, modal } = useModal('drawer');

  const openAdd = () =>
    open(
      <GroupModal
        title={`Novo ${fieldLabel.toLowerCase()}`}
        fieldLabel={fieldLabel}
        smallGroup={smallGroup}
        close={close}
        onSave={onAdd}
      />,
    );

  return (
    <div>
      <PageHeader title={title} back action={<Button onClick={openAdd}>Adicionar</Button>} />

      {!loading && !error && counts}

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
                {smallGroup && <Th>Dia</Th>}
                <Th>Pessoas</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id} $clickable onClick={() => onRowClick(row.id)}>
                  <Td data-label="Nome">{row.name}</Td>
                  {smallGroup && <Td data-label="Dia">{row.meetingDay ? WEEK_DAY_LABELS[row.meetingDay] : '—'}</Td>}
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
