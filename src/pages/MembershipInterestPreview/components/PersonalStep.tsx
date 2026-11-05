// React
import { Control } from 'react-hook-form';
// Libs
import { TextInput } from 'bp-kit';
// Local
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '../options';
import { MembershipFormValues } from '../schema';
import { ChoiceField } from './ChoiceField';

interface Props {
  control: Control<MembershipFormValues>;
}

export function PersonalStep({ control }: Props) {
  return (
    <>
      <TextInput label="Nome completo" control={control} name="name" autoComplete="name" />
      <ChoiceField control={control} name="gender" label="Sexo" options={GENDER_OPTIONS} />
      <TextInput label="CPF" control={control} name="cpf" mask="cpf" inputMode="numeric" placeholder="000.000.000-00" />
      <TextInput
        label="Data de nascimento"
        control={control}
        name="birthDate"
        mask="date"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
      />
      <ChoiceField control={control} name="maritalStatus" label="Estado civil" options={MARITAL_STATUS_OPTIONS} />
      <TextInput label="Nome da mãe" control={control} name="motherName" />
      <TextInput label="Nome do pai (opcional)" control={control} name="fatherName" />
    </>
  );
}
