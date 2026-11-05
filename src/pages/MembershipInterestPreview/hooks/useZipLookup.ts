// React
import { useEffect, useRef, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
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
  const [looking, setLooking] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const zipDigits = zip.replace(/\D/g, '');
  const lookedUp = useRef(zipDigits);

  useEffect(() => {
    if (zipDigits === lookedUp.current) return;
    lookedUp.current = zipDigits;
    setNotFound(false);
    if (zipDigits.length !== 8) return;

    const controller = new AbortController();
    setLooking(true);
    fetch(`https://viacep.com.br/ws/${zipDigits}/json/`, { signal: controller.signal })
      .then((response) => response.json() as Promise<ViaCepAddress>)
      .then((address) => {
        if (address.erro) {
          setNotFound(true);
          return;
        }
        const fill = { street: address.logradouro, neighborhood: address.bairro, city: address.localidade, state: address.uf };
        Object.entries(fill).forEach(([field, value]) => {
          if (value) setValue(field as keyof typeof fill, value, { shouldValidate: true, shouldDirty: true });
        });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setNotFound(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLooking(false);
      });

    return () => {
      controller.abort();
      lookedUp.current = '';
    };
  }, [zipDigits, setValue]);

  return { looking, notFound };
}
