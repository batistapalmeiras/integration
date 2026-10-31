// Libs
import { MultiSelect } from 'bp-kit';
import { Control, Controller } from 'react-hook-form';
// Local
import { CommunityGroup } from '../../../domain/communityGroups';
import { CommunityRequirements } from '../../../domain/membershipCommunity';
import { Hint } from '../Detail/styles';
import { CommunityFormValues } from '../validators';

interface Props {
  control: Control<CommunityFormValues>;
  requirements: CommunityRequirements;
  smallGroups: CommunityGroup[];
  ministries: CommunityGroup[];
}

const toOptions = (groups: CommunityGroup[]) => groups.map((g) => ({ value: g.id, label: g.name }));

export function CommunityFields({ control, requirements, smallGroups, ministries }: Props) {
  return (
    <>
      <Controller
        control={control}
        name="smallGroupIds"
        render={({ field, fieldState }) => (
          <MultiSelect
            label={requirements.smallGroupRequired ? 'Pequeno Grupo' : 'Pequeno Grupo (opcional)'}
            options={toOptions(smallGroups)}
            value={field.value}
            onChange={field.onChange}
            placeholder={requirements.smallGroupRequired ? 'Selecione…' : 'Nenhum por enquanto'}
            max={1}
            searchable={false}
            error={fieldState.error?.message}
          />
        )}
      />
      {!requirements.smallGroupRequired && (
        <Hint>Na ficha, a pessoa disse que não quer participar de um PG neste momento.</Hint>
      )}
      <Controller
        control={control}
        name="ministryIds"
        render={({ field, fieldState }) => (
          <MultiSelect
            label={requirements.ministryRequired ? 'Ministérios' : 'Ministérios (opcional)'}
            options={toOptions(ministries)}
            value={field.value}
            onChange={field.onChange}
            placeholder={requirements.ministryRequired ? 'Selecione…' : 'Nenhum por enquanto'}
            searchable={false}
            error={fieldState.error?.message}
          />
        )}
      />
      {!requirements.ministryRequired && (
        <Hint>Na ficha, a pessoa disse que não pode servir em um ministério agora.</Hint>
      )}
    </>
  );
}
