export const PHONE_PLACEHOLDER = '(11) 99999-9999';

export type YesNo = 'yes' | 'no';

export const YES_NO_LABELS: Record<YesNo, string> = { yes: 'Sim', no: 'Não' };

export function toOptions<K extends string>(labels: Record<K, string>): { value: K; label: string }[] {
  return (Object.entries(labels) as [K, string][]).map(([value, label]) => ({ value, label }));
}

export const YES_NO_OPTIONS = toOptions(YES_NO_LABELS);

export const LOAD_RETRY_MESSAGE = 'Não foi possível carregar agora. Atualize a página para tentar de novo.';

export const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'pt-BR');
