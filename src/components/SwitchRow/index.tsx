// Libs
import { Switch } from 'bp-kit';
// Local
import { Hint, Row, Text, Title } from './styles';

interface Props {
  title: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export function SwitchRow({ title, hint, checked, onChange, disabled }: Props) {
  return (
    <Row>
      <Switch
        label={
          <Text>
            <Title>{title}</Title>
            <Hint>{hint}</Hint>
          </Text>
        }
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </Row>
  );
}
