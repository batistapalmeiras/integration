// React
import { ReactNode } from 'react';
// Libs
import { theme, useMediaQuery } from 'bp-kit';
// Components
import { Avatar } from '../../../components/Avatar';
import {
  List,
  ListChevron,
  ListGrow,
  ListHeader,
  ListItem,
  ListRowButton,
  ListRowText,
  ListSlot,
  ListStatusCell,
} from '../../../components/List';
// Local
import { CONSOLIDATION_KIND_LABELS, ConsolidationKind } from '../../../domain/consolidation';
import { GroupCell } from '../styles';
import { GroupCards } from './GroupCards';

interface Row {
  id: string;
  personId: string;
  personName: string;
  groupName: string;
}

interface Props<T extends Row> {
  kind: ConsolidationKind;
  rows: T[];
  statusLabel: string;
  renderStatus: (row: T) => ReactNode;
  photoOf: (row: T) => string | null;
  onOpen: (row: T) => void;
}

export function ConsolidationRows<T extends Row>({ kind, rows, statusLabel, renderStatus, photoOf, onOpen }: Props<T>) {
  const wide = useMediaQuery(`(min-width: ${theme.breakpoints.tablet})`);

  const renderRow = (row: T) => (
    <ListItem key={row.id}>
      <ListRowButton type="button" onClick={() => onOpen(row)}>
        <Avatar name={row.personName} size={40} photoUrl={photoOf(row)} />
        <ListRowText>{row.personName}</ListRowText>
        {wide && <GroupCell>{row.groupName}</GroupCell>}
        <ListStatusCell>{renderStatus(row)}</ListStatusCell>
        <ListChevron />
      </ListRowButton>
    </ListItem>
  );

  if (!wide) return <GroupCards kind={kind} rows={rows} renderRow={renderRow} />;

  return (
    <List>
      <ListHeader aria-hidden="true">
        <ListGrow>Pessoa</ListGrow>
        <GroupCell>{CONSOLIDATION_KIND_LABELS[kind]}</GroupCell>
        <ListStatusCell>{statusLabel}</ListStatusCell>
        <ListSlot $width={16} />
      </ListHeader>
      {rows.map(renderRow)}
    </List>
  );
}
