// Local
import { MARITAL_STATUS_LABELS, MaritalStatus } from './memberRecords';
import { YES_NO_LABELS, YesNo } from './text';

const DETAIL_SEPARATOR = ' — ';

function withDetail(label: string, detail: string): string {
  return detail.trim() === '' ? label : `${label}${DETAIL_SEPARATOR}${detail.trim()}`;
}

function splitDetail(answer: string): { label: string; detail: string } {
  const [label, ...rest] = answer.trim().split(DETAIL_SEPARATOR);
  return { label, detail: rest.join(DETAIL_SEPARATOR).trim() };
}

function keyForLabel<K extends string>(labels: Record<K, string>, label: string): K | '' {
  return (Object.keys(labels) as K[]).find((key) => labels[key] === label) ?? '';
}

export function baptismAnswer(baptized: YesNo | '', church: string): string {
  if (baptized === 'yes') return withDetail(YES_NO_LABELS.yes, church);
  return baptized === 'no' ? YES_NO_LABELS.no : '';
}

export function readBaptismAnswer(answer: string): { baptized: YesNo | ''; church: string } {
  const { label, detail } = splitDetail(answer);
  const baptized = keyForLabel(YES_NO_LABELS, label);
  return { baptized, church: baptized === 'yes' ? detail : '' };
}

export function maritalStatusAnswer(status: MaritalStatus | '', story: string): string {
  return status ? withDetail(MARITAL_STATUS_LABELS[status], story) : '';
}

export function readMaritalStatusAnswer(answer: string): MaritalStatus | '' {
  return keyForLabel(MARITAL_STATUS_LABELS, splitDetail(answer).label);
}
