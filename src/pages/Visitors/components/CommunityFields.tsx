// Libs
import { MultiSelect, Select } from 'bp-kit';
import { Control, Controller } from 'react-hook-form';
// Local
import { GroupOption } from '../../../domain/communityGroups';
import { CommunityDeclines } from '../../../domain/membership';
import { Hint } from '../Detail/styles';
import { FieldStack } from '../../../components/FormLayout';
import { CommunityFormValues } from '../validators';

interface Props {
  control: Control<CommunityFormValues>;
  declines: CommunityDeclines;
  smallGroups: GroupOption[];
  ministries: GroupOption[];
}

const toOptions = (groups: GroupOption[]) => groups.map((g) => ({ value: g.id, label: g.name }));

export function CommunityFields({ control, declines, smallGroups, ministries }: Props) {
  return (
    <>
      <FieldStack>
        <Select label="Pequeno Grupo" control={control} name="smallGroupId">
          <option value="">Nenhum por enquanto</option>
          {smallGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        {declines.smallGroup && <Hint>Na ficha, a pessoa disse que não quer participar de um PG neste momento.</Hint>}
      </FieldStack>
      <FieldStack>
        <Controller
          control={control}
          name="ministryIds"
          render={({ field, fieldState }) => (
            <MultiSelect
              label="Ministérios"
              options={toOptions(ministries)}
              value={field.value}
              onChange={field.onChange}
              placeholder="Nenhum por enquanto"
              searchable={false}
              error={fieldState.error?.message}
            />
          )}
        />
        {declines.ministry && <Hint>Na ficha, a pessoa disse que não pode servir em um ministério agora.</Hint>}
      </FieldStack>
    </>
  );
}
