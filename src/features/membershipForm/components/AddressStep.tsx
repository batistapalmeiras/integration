// React
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
// Libs
import { onlyDigits, text, TextInput } from 'bp-kit';
// Local
import { ZipField, ZipAddress } from '../../../components/ZipField';
import { PHONE_PLACEHOLDER } from '../../../domain/text';
import { MembershipFormValues } from '../schema';
import { FieldRow } from '../styles';

interface Props {
  control: Control<MembershipFormValues>;
  setValue: UseFormSetValue<MembershipFormValues>;
  optionalPhone: boolean;
}

export function AddressStep({ control, setValue, optionalPhone }: Props) {
  const zip = useWatch({ control, name: 'zip' });
  const showAddress = onlyDigits(zip).length === 8;

  const fillAddress = (address: ZipAddress) => {
    const options = { shouldValidate: true, shouldDirty: true };
    if (address.street) setValue('street', address.street, options);
    if (address.neighborhood) setValue('neighborhood', address.neighborhood, options);
    if (address.city) setValue('city', address.city, options);
    if (address.state) setValue('state', address.state, options);
  };

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
      {optionalPhone && (
        <TextInput
          label="Telefone (opcional)"
          control={control}
          name="phone"
          mask="phone"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={PHONE_PLACEHOLDER}
        />
      )}
      <ZipField control={control} name="zip" onAddress={fillAddress}>
        {({ looking }) =>
          showAddress && !looking && (
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
          )
        }
      </ZipField>
    </>
  );
}
