// Local
import { SignupFormValues, signupFormSchema, toSignupAnswers } from '../../../../src/pages/IntegrationSignup/validators/schema';

vi.mock('../../../../src/lib/supabase', () => ({ supabase: {} }));
vi.mock('bp-kit', () => ({
  text: { validation: { required: (what: string) => `Informe ${what}` } },
  formatCPF: (value: string) => value,
  maskPhone: (value: string) => value,
}));

const complete: SignupFormValues = {
  name: 'Ana Lima',
  baptized: 'yes',
  baptismChurch: 'Igreja Batista Central',
  previousChurch: ' Igreja Batista Central ',
  conversionTestimony: 'Aceitei Jesus em 2020.',
  maritalStatus: 'married',
  maritalStatusStory: 'Casados há 5 anos.',
};

describe('toSignupAnswers', () => {
  it('composes the stored text from the answers', () => {
    expect(toSignupAnswers(complete)).toEqual({
      previousChurch: 'Igreja Batista Central',
      baptismInfo: 'Sim — Igreja Batista Central',
      conversionTestimony: 'Aceitei Jesus em 2020.',
      maritalStatusStory: 'Casado(a) — Casados há 5 anos.',
    });
  });

  it('writes the negative answers and single status without details', () => {
    const answers = toSignupAnswers({
      ...complete,
      baptized: 'no',
      maritalStatus: 'single',
      maritalStatusStory: '',
    });
    expect(answers.baptismInfo).toBe('Não');
    expect(answers.maritalStatusStory).toBe('Solteiro(a)');
  });
});

describe('signupFormSchema', () => {
  it('accepts a complete form', () => {
    expect(signupFormSchema.safeParse(complete).success).toBe(true);
  });

  it('requires the follow-up answers', () => {
    const result = signupFormSchema.safeParse({
      ...complete,
      baptismChurch: '',
      previousChurch: '',
      maritalStatusStory: '',
    });
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
    expect(paths).toEqual(['previousChurch', 'baptismChurch', 'maritalStatusStory']);
  });

  it('does not ask for the relationship story when single', () => {
    expect(signupFormSchema.safeParse({ ...complete, maritalStatus: 'single', maritalStatusStory: '' }).success).toBe(
      true,
    );
  });
});
