// React
import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
// Libs
import { onlyDigits } from 'bp-kit';
// Local
import { MembershipFormValues } from '../schema';

interface ViaCepAddress {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

export function useZipLookup(zip: string, setValue: UseFormSetValue<MembershipFormValues>) {
  const zipDigits = onlyDigits(zip);
  const [initialZip] = useState(zipDigits);
  const [settled, setSettled] = useState<{ zip: string; found: boolean } | null>(null);
  const shouldLookUp = zipDigits.length === 8 && zipDigits !== initialZip;

  useEffect(() => {
    if (!shouldLookUp) return;
    const controller = new AbortController();
    fetch(`https://viacep.com.br/ws/${zipDigits}/json/`, { signal: controller.signal })
      .then((response) => response.json() as Promise<ViaCepAddress>)
      .then((address) => {
        if (address.erro) {
          setSettled({ zip: zipDigits, found: false });
          return;
        }
        const fill = {
          street: address.logradouro,
          neighborhood: address.bairro,
          city: address.localidade,
          state: address.uf,
        };
        Object.entries(fill).forEach(([field, value]) => {
          if (value) setValue(field as keyof typeof fill, value, { shouldValidate: true, shouldDirty: true });
        });
        setSettled({ zip: zipDigits, found: true });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError'))
          setSettled({ zip: zipDigits, found: false });
      });
    return () => controller.abort();
  }, [zipDigits, shouldLookUp, setValue]);

  return {
    looking: shouldLookUp && settled?.zip !== zipDigits,
    notFound: settled?.zip === zipDigits && !settled.found,
  };
}
