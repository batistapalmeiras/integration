// React
import { useEffect, useState } from 'react';
// Libs
import { onlyDigits } from 'bp-kit';
// Local
import { useLatest } from '../../lib/useLatest';

export interface ZipAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ViaCepAddress {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

export function useZipLookup(zip: string, onAddress: (address: ZipAddress) => void) {
  const zipDigits = onlyDigits(zip);
  const [initialZip] = useState(zipDigits);
  const [settled, setSettled] = useState<{ zip: string; found: boolean } | null>(null);
  const onAddressRef = useLatest(onAddress);
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
        onAddressRef.current({
          street: address.logradouro ?? '',
          neighborhood: address.bairro ?? '',
          city: address.localidade ?? '',
          state: address.uf ?? '',
        });
        setSettled({ zip: zipDigits, found: true });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError'))
          setSettled({ zip: zipDigits, found: false });
      });
    return () => controller.abort();
  }, [zipDigits, shouldLookUp, onAddressRef]);

  return {
    looking: shouldLookUp && settled?.zip !== zipDigits,
    notFound: settled?.zip === zipDigits && !settled.found,
  };
}
