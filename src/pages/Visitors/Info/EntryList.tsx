// Components
import { EntryGrid } from '../../../components/FormLayout';
// Local
import { DetailLabel, SensitiveBlock, SensitiveValue } from '../Detail/styles';
import { InfoEntry } from './sensitive';

export function EntryList({ entries }: { entries: InfoEntry[] }) {
  return (
    <EntryGrid>
      {entries.map((item) => (
        <SensitiveBlock key={item.label} $wide={item.wide}>
          <DetailLabel>{item.label}</DetailLabel>
          <SensitiveValue $muted={!item.answered}>{item.value}</SensitiveValue>
        </SensitiveBlock>
      ))}
    </EntryGrid>
  );
}
