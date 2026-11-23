// React
import { ReactNode } from 'react';
// Libs
import { Button, Empty, Skeleton, text, theme, useMediaQuery, useModal } from 'bp-kit';
import { Plus } from 'lucide-react';
// Components
import { CountRow } from '../../../components/CountRow';
import { IconBadge } from '../../../components/MenuOptions';
import { PageHeader } from '../../../components/PageHeader';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { GroupInput, WEEK_DAY_LABELS, WeekDay } from '../../../domain/communityGroups';
import { GroupRow } from '../hooks/useCommunityGroupsList';
import { CountPill, DaySuffix, NameWithIcon } from '../styles';
import { GroupModal } from './GroupModal';

interface Props {
  title: string;
  fieldLabel: string;
  rows: GroupRow[];
  loading: boolean;
  error: string | null;
  smallGroup?: boolean;
  tileFor?: (name: string) => ReactNode;
  counts: ReactNode;
  onAdd: (input: GroupInput) => Promise<void>;
  onRowClick: (id: string) => void;
}

export function GroupTable({ title, fieldLabel, rows, loading, error, smallGroup, tileFor, counts, onAdd, onRowClick }: Props) {
  const { open, close, modal } = useModal('drawer');
  const inlineAction = useMediaQuery(`(min-width: ${theme.breakpoints.tablet})`);

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

  const addButton = (
    <Button variant="secondary" onClick={openAdd}>
      <Plus size={16} />
      Adicionar
    </Button>
  );

  return (
    <div>
      <PageHeader title={title} back action={inlineAction ? undefined : addButton} />

      {inlineAction ? (
        <CountRow>
          {!loading && !error ? counts : <span />}
          {addButton}
        </CountRow>
      ) : (
        !loading && !error && counts
      )}

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
                  <Td data-label="Nome">{tileFor ? <RowName name={row.name} tile={tileFor(row.name)} /> : row.name}</Td>
                  {smallGroup && <Td data-label="Dia">{row.meetingDay ? <DayName day={row.meetingDay} /> : '—'}</Td>}
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

const WEEKDAY_SUFFIX = '-feira';

function DayName({ day }: { day: WeekDay }) {
  const label = WEEK_DAY_LABELS[day];
  if (!label.endsWith(WEEKDAY_SUFFIX)) return label;
  return (
    <>
      {label.slice(0, -WEEKDAY_SUFFIX.length)}
      <DaySuffix>{WEEKDAY_SUFFIX}</DaySuffix>
    </>
  );
}

function RowName({ name, tile }: { name: string; tile: ReactNode }) {
  return (
    <NameWithIcon>
      <IconBadge>{tile}</IconBadge>
      {name}
    </NameWithIcon>
  );
}
