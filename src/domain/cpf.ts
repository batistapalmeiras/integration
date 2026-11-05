function checkDigit(digits: number[], weight: number): number {
  const sum = digits.reduce((total, digit, index) => total + digit * (weight - index), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '').split('').map(Number);
  if (digits.length !== 11 || digits.every((digit) => digit === digits[0])) return false;
  return checkDigit(digits.slice(0, 9), 10) === digits[9] && checkDigit(digits.slice(0, 10), 11) === digits[10];
}
