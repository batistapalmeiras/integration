// React
import { ReactNode } from 'react';
import { Control, FieldValues, Path, useWatch } from 'react-hook-form';
// Libs
import { TextInput } from 'bp-kit';
// Components
import { Hint } from '../FormLayout';
// Local
import { useZipLookup, ZipAddress } from './useZipLookup';

export type { ZipAddress } from './useZipLookup';

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  onAddress: (address: ZipAddress) => void;
  children?: (state: { looking: boolean }) => ReactNode;
}

export function ZipField<T extends FieldValues>({ control, name, onAddress, children }: Props<T>) {
  const zip = useWatch({ control, name });
  const { looking, notFound } = useZipLookup(String(zip ?? ''), onAddress);

  return (
    <>
      <TextInput label="CEP" control={control} name={name} mask="cep" inputMode="numeric" placeholder="00000-000" />
      {looking && <Hint>Buscando endereço…</Hint>}
      {notFound && <Hint>Não encontramos esse CEP. Preencha o endereço abaixo.</Hint>}
      {children?.({ looking })}
    </>
  );
}
