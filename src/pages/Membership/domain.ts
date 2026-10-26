const NO_ANSWERS = ['não', 'nao'];

export function needsSecretSocietyReview(answer: string | null): boolean {
  const normalized = (answer ?? '').trim().toLowerCase().replace(/[.!]+$/, '').trim();
  return normalized !== '' && !NO_ANSWERS.includes(normalized);
}

export function needsBaptismReview(answer: string | null): boolean {
  return (answer ?? '').trim() === '';
}

export interface ReviewInput {
  secretSociety: string | null;
  baptismInfo: string | null;
}

export function membershipReviewReasons({ secretSociety, baptismInfo }: ReviewInput): string[] {
  return [
    ...(needsSecretSocietyReview(secretSociety) ? ['Sociedade secreta'] : []),
    ...(needsBaptismReview(baptismInfo) ? ['Batismo não informado'] : []),
  ];
}
