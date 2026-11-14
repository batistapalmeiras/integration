// Libs
import { text } from 'bp-kit';
import { AlertTriangle } from 'lucide-react';
import styled from 'styled-components';
// Local
import { EntryType, ENTRY_TYPE_LABELS } from '../../types/church';
import { NarrowLabel, ReviewFlag, Table, TableWrapper, Td, Th, Tr, WideLabel } from '../Table';

interface EntryTypeRow {
  id: string;
  name: string;
  entryType: EntryType | null;
  reviewReasons?: string[];
}

const ENTRY_COLUMN_WIDTH = '9.75rem';

const EntryTh = styled(Th)`
  min-width: ${ENTRY_COLUMN_WIDTH};
`;

interface Props {
  rows: EntryTypeRow[];
  onSelect?: (id: string) => void;
}

export function EntryTypeTable({ rows, onSelect }: Props) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <Th>{text.fields.name}</Th>
            <EntryTh $shrink>
              <WideLabel>Forma de entrada</WideLabel>
              <NarrowLabel>Entrada</NarrowLabel>
            </EntryTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Tr key={row.id} $clickable={!!onSelect} onClick={onSelect ? () => onSelect(row.id) : undefined}>
              <Td $truncate title={row.name}>
                {row.name}
                {row.reviewReasons?.map((reason) => (
                  <div key={reason}>
                    <ReviewFlag>
                      <AlertTriangle size={12} />
                      {reason}
                    </ReviewFlag>
                  </div>
                ))}
              </Td>
              <Td $shrink>{row.entryType ? ENTRY_TYPE_LABELS[row.entryType] : '—'}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
