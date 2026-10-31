// Local
import { resolveContactAttemptOutcome, statusAfterContact } from './contactAttempt';

describe('resolveContactAttemptOutcome', () => {
  it('moves to welcome_coffee when accepted', () => {
    expect(resolveContactAttemptOutcome('accepted', false, false)).toEqual({
      toStatus: 'welcome_coffee',
      clearWhatsAppOpened: false,
      noteOverride: undefined,
    });
  });

  it('archives when declined', () => {
    expect(resolveContactAttemptOutcome('declined', false, false)).toEqual({
      toStatus: 'archived',
      clearWhatsAppOpened: false,
      noteOverride: undefined,
    });
  });

  it('retries on the first no_response', () => {
    expect(resolveContactAttemptOutcome('no_response', false, false)).toEqual({
      toStatus: 'retry_contact',
      clearWhatsAppOpened: true,
      noteOverride: undefined,
    });
  });

  it('archives on no_response once the post-café retry round is already used', () => {
    expect(resolveContactAttemptOutcome('no_response', true, false)).toEqual({
      toStatus: 'archived',
      clearWhatsAppOpened: false,
      noteOverride: 'Sem resposta na retomada de contato após o café',
    });
  });
});

describe('statusAfterContact', () => {
  it('sends someone who already came to a café straight to the class signup', () => {
    expect(statusAfterContact('accepted', true)).toBe('pending_signup');
    expect(statusAfterContact('accepted', false)).toBe('welcome_coffee');
  });

  it('archives a refusal and retries a missing answer, café or not', () => {
    expect(statusAfterContact('declined', true)).toBe('archived');
    expect(statusAfterContact('no_response', true)).toBe('retry_contact');
  });
});
