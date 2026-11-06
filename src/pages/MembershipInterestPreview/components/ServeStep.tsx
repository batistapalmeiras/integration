// React
import { Control, Controller, useWatch } from 'react-hook-form';
// Libs
import { Checkbox, MultiSelect, MultiSelectOption, Select, Textarea, TextInput } from 'bp-kit';
// Local
import { SmallGroupOption, smallGroupLabel } from '../hooks/usePublicGroups';
import { YES_NO_OPTIONS } from '../../../domain/text';
import { WANTS_SMALL_GROUP_OPTIONS } from '../options';
import { MembershipFormValues } from '../schema';
import { Hint } from '../styles';
import { ChoiceField } from './ChoiceField';
import { SelectField } from '../../../components/SelectField';

interface Props {
  control: Control<MembershipFormValues>;
  ministries: MultiSelectOption[];
  smallGroups: SmallGroupOption[] | null;
}

export function ServeStep({ control, ministries, smallGroups }: Props) {
  const noMinistryInterest = useWatch({ control, name: 'noMinistryInterest' });
  const wantsSmallGroup = useWatch({ control, name: 'wantsSmallGroup' });
  const secretSociety = useWatch({ control, name: 'secretSociety' });

  return (
    <>
      <Controller
        control={control}
        name="ministryInterests"
        render={({ field, fieldState }) => (
          <MultiSelect
            label="Em qual(is) ministério(s) deseja servir? Marque até 3."
            options={ministries}
            value={field.value}
            onChange={field.onChange}
            max={3}
            disabled={noMinistryInterest}
            placeholder="Buscar ministério…"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="noMinistryInterest"
        render={({ field }) => (
          <Checkbox
            label="Não posso ou não desejo servir agora"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />

      <SelectField
        control={control}
        name="wantsSmallGroup"
        label="Você deseja fazer parte de um dos nossos Pequenos Grupos?"
        options={WANTS_SMALL_GROUP_OPTIONS}
      />
      {wantsSmallGroup === 'yes' && <Hint>Que bom! Nossos líderes entrarão em contato com você.</Hint>}
      {wantsSmallGroup === 'already' && (
        <Select label="Qual PG você frequenta?" control={control} name="smallGroupId">
          <option value="">{smallGroups === null ? 'Carregando…' : 'Selecione o PG'}</option>
          {(smallGroups ?? []).map((group) => (
            <option key={group.id} value={group.id}>
              {smallGroupLabel(group)}
            </option>
          ))}
        </Select>
      )}

      <ChoiceField
        control={control}
        name="secretSociety"
        label="Você faz parte de alguma sociedade secreta, ordem iniciática ou grupo reservado (como a maçonaria, rosacruz, etc.)?"
        options={YES_NO_OPTIONS}
      />
      {secretSociety === 'yes' && <TextInput label="Qual?" control={control} name="secretSocietyName" />}

      <Textarea label="Deseja nos falar alguma coisa? (opcional)" control={control} name="membershipNote" rows={3} />
    </>
  );
}
