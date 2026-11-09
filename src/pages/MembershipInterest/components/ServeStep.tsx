// React
import { Control, Controller, useWatch } from 'react-hook-form';
// Libs
import { InfoBox, MultiSelect, MultiSelectOption, Select, Textarea, TextInput } from 'bp-kit';
// Local
import { SmallGroupOption } from '../../../repositories/publicForms';
import { smallGroupLabel } from '../hooks/usePublicGroups';
import { LOAD_RETRY_MESSAGE, YES_NO_OPTIONS } from '../../../domain/text';
import { WANTS_SMALL_GROUP_OPTIONS, WANTS_TO_SERVE_OPTIONS } from '../options';
import { MembershipFormValues } from '../schema';
import { SelectField } from '../../../components/SelectField';
import { ChoiceField } from './ChoiceField';

interface Props {
  control: Control<MembershipFormValues>;
  ministries: MultiSelectOption[];
  smallGroups: SmallGroupOption[] | null;
  loadError: boolean;
}

export function ServeStep({ control, ministries, smallGroups, loadError }: Props) {
  const wantsToServe = useWatch({ control, name: 'wantsToServe' });
  const wantsSmallGroup = useWatch({ control, name: 'wantsSmallGroup' });
  const secretSociety = useWatch({ control, name: 'secretSociety' });

  return (
    <>
      {loadError && <InfoBox variant="warning">{LOAD_RETRY_MESSAGE}</InfoBox>}
      <SelectField
        control={control}
        name="wantsToServe"
        label="Você deseja servir em algum dos nossos ministérios?"
        options={WANTS_TO_SERVE_OPTIONS}
      />
      {wantsToServe === 'yes' && (
        <Controller
          control={control}
          name="ministryInterests"
          render={({ field, fieldState }) => (
            <MultiSelect
              label="Em qual(is) ministério(s)? Marque até 3."
              options={ministries}
              value={field.value}
              onChange={field.onChange}
              max={3}
              placeholder="Buscar ministério…"
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      <SelectField
        control={control}
        name="wantsSmallGroup"
        label="Você deseja fazer parte de um dos nossos Pequenos Grupos?"
        options={WANTS_SMALL_GROUP_OPTIONS}
      />
      {wantsSmallGroup === 'yes' && (
        <InfoBox variant="success">Que bom! Nossos líderes entrarão em contato com você.</InfoBox>
      )}
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
