// React
import { Control } from 'react-hook-form';
// Libs
import { TextInput } from 'bp-kit';
// Local
import { FieldPair } from '../../../components/PublicPage/styles';
import { MARITAL_STATUS_OPTIONS } from '../../../domain/memberRecords';
import { GENDER_OPTIONS } from '../options';
import { MembershipFormValues } from '../schema';
import { SelectField } from '../../../components/SelectField';

interface Props {
  control: Control<MembershipFormValues>;
}

export function PersonalStep({ control }: Props) {
  return (
    <>
      <TextInput label="Nome completo" control={control} name="name" autoComplete="name" />
      <FieldPair>
        <TextInput
          label="CPF"
          control={control}
          name="cpf"
          mask="cpf"
          inputMode="numeric"
          placeholder="000.000.000-00"
        />
        <TextInput
          label="Data de nascimento"
          control={control}
          name="birthDate"
          mask="date"
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
        />
      </FieldPair>
      <FieldPair>
        <SelectField control={control} name="gender" label="Sexo" options={GENDER_OPTIONS} />
        <SelectField control={control} name="maritalStatus" label="Estado civil" options={MARITAL_STATUS_OPTIONS} />
      </FieldPair>
      <FieldPair>
        <TextInput label="Nome da mãe (opcional)" control={control} name="motherName" />
        <TextInput label="Nome do pai (opcional)" control={control} name="fatherName" />
      </FieldPair>
    </>
  );
}
