// React
import { Control, Controller } from 'react-hook-form';
// Libs
import { Select } from 'bp-kit';
// Components
import { WideField } from '../../components/FormLayout';
// Local
import { useMemberNames } from '../../queries/reference';
import { Family } from '../../repositories/family';
import { ChildrenField } from './ChildrenField';
import { FamilyFormValues } from './form';

interface Props {
  personId: string;
  family: Family;
  control: Control<FamilyFormValues>;
}

export function FamilyFields({ personId, family, control }: Props) {
  const members = (useMemberNames().data ?? []).filter((member) => member.id !== personId);
  const knownNames = new Map([...family.children, ...members].map((person) => [person.id, person.name]));

  const memberOptions = (
    <>
      <option value="">Nenhum</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </>
  );

  return (
    <>
      <WideField>
        <Select label="Cônjuge" control={control} name="spouseId" searchable>
          {memberOptions}
        </Select>
      </WideField>
      <WideField>
        <Controller
          control={control}
          name="childIds"
          render={({ field }) => (
            <ChildrenField value={field.value} onChange={field.onChange} candidates={members} knownNames={knownNames} />
          )}
        />
      </WideField>
    </>
  );
}
