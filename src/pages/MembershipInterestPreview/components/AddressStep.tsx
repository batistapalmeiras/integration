// React
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
// Libs
import { text, TextInput } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { useZipLookup } from '../hooks/useZipLookup';
import { MembershipFormValues } from '../schema';
import { FieldRow, Hint } from '../styles';

interface Props {
  control: Control<MembershipFormValues>;
  setValue: UseFormSetValue<MembershipFormValues>;
}

export function AddressStep({ control, setValue }: Props) {
  const zip = useWatch({ control, name: 'zip' });
  const { looking, notFound } = useZipLookup(zip, setValue);
  const showAddress = zip.replace(/\D/g, '').length === 8 && !looking;

  return (
    <>
      <TextInput
        label={text.fields.email}
        control={control}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={text.fields.emailPlaceholder}
      />
      <TextInput
        label="Outro telefone para contato (opcional)"
        control={control}
        name="otherPhone"
        mask="phone"
        inputMode="numeric"
        placeholder={PHONE_PLACEHOLDER}
      />
      <Hint>Pode ser um telefone fixo ou o celular de alguém da sua casa.</Hint>

      <TextInput label="CEP" control={control} name="zip" mask="cep" inputMode="numeric" placeholder="00000-000" />
      <Hint>
        {looking
          ? 'Buscando endereço…'
          : notFound
            ? 'Não encontramos esse CEP. Preencha o endereço abaixo.'
            : 'Digite o CEP para preencher o endereço.'}
      </Hint>
      {showAddress && (
        <>
          <TextInput label="Rua" control={control} name="street" autoComplete="address-line1" />
          <FieldRow>
            <TextInput label="Número" control={control} name="number" inputMode="numeric" />
            <TextInput label="Complemento" control={control} name="complement" placeholder="Opcional" />
          </FieldRow>
          <TextInput label="Bairro" control={control} name="neighborhood" />
          <FieldRow>
            <TextInput label="Cidade" control={control} name="city" />
            <TextInput label="Estado" control={control} name="state" placeholder="MG" maxLength={2} />
          </FieldRow>
        </>
      )}
    </>
  );
}
