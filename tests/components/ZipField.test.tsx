// React
import { useForm } from 'react-hook-form';
// Libs
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { ZipField } from '../../src/components/ZipField';
import { renderScreen } from '../support/render';

function Harness({ onAddress, initial = '' }: { onAddress: (address: unknown) => void; initial?: string }) {
  const { control } = useForm<{ zip: string }>({ defaultValues: { zip: initial } });
  return <ZipField control={control} name="zip" onAddress={onAddress} />;
}

const respond = (body: object) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('zip field', () => {
  it('says nothing under the field until there is a lookup to report', () => {
    respond({});
    renderScreen(<Harness onAddress={vi.fn()} />);

    expect(screen.queryByText(/Digite o CEP/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Buscando|Não encontramos/)).not.toBeInTheDocument();
  });

  it('looks the address up when the zip is complete and hands it over', async () => {
    respond({ logradouro: 'Rua Júlio de Castilho', bairro: 'Cinquentenário', localidade: 'Belo Horizonte', uf: 'MG' });
    const onAddress = vi.fn();
    renderScreen(<Harness onAddress={onAddress} />);

    await userEvent.type(screen.getByPlaceholderText('00000-000'), '30570080');

    await waitFor(() =>
      expect(onAddress).toHaveBeenCalledWith({
        street: 'Rua Júlio de Castilho',
        neighborhood: 'Cinquentenário',
        city: 'Belo Horizonte',
        state: 'MG',
      }),
    );
    expect(screen.getByPlaceholderText('00000-000')).toHaveValue('30570-080');
  });

  it('says when the zip was not found', async () => {
    respond({ erro: true });
    renderScreen(<Harness onAddress={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('00000-000'), '99999999');

    expect(await screen.findByText('Não encontramos esse CEP. Preencha o endereço abaixo.')).toBeInTheDocument();
  });

  it('does not look up the zip the form already had', () => {
    respond({});
    renderScreen(<Harness onAddress={vi.fn()} initial="30570-080" />);

    expect(fetch).not.toHaveBeenCalled();
  });
});
