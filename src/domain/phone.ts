export const INCOMPLETE_PHONE_MESSAGE = 'Telefone incompleto';

function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isCompletePhone(value: string): boolean {
  return [10, 11].includes(phoneDigits(value).length);
}

export function isSamePhone(a: string, b: string): boolean {
  return phoneDigits(a) !== '' && phoneDigits(a) === phoneDigits(b);
}
