// Local
import { resolveContactAttemptOutcome, resolveEditedContactStatus } from './contactAttempt';

describe('resolveContactAttemptOutcome', () => {
  it('moves to welcome_coffee when accepted', () => {
    expect(resolveContactAttemptOutcome('accepted', false)).toEqual({
      toStatus: 'welcome_coffee',
      clearWhatsAppOpened: false,
      noteOverride: undefined,
    });
  });

  it('archives when declined', () => {
    expect(resolveContactAttemptOutcome('declined', false)).toEqual({
      toStatus: 'archived',
      clearWhatsAppOpened: false,
      noteOverride: undefined,
    });
  });

  it('retries on the first no_response', () => {
    expect(resolveContactAttemptOutcome('no_response', false)).toEqual({
      toStatus: 'retry_contact',
      clearWhatsAppOpened: true,
      noteOverride: undefined,
    });
  });

  it('archives on no_response once the post-café retry round is already used', () => {
    expect(resolveContactAttemptOutcome('no_response', true)).toEqual({
      toStatus: 'archived',
      clearWhatsAppOpened: false,
      noteOverride: 'Sem resposta na retomada de contato após o café',
    });
  });
});

describe('resolveEditedContactStatus', () => {
  it('maps accepted/declined/no_response without checking the retry flag', () => {
    expect(resolveEditedContactStatus('accepted')).toBe('welcome_coffee');
    expect(resolveEditedContactStatus('declined')).toBe('archived');
    expect(resolveEditedContactStatus('no_response')).toBe('retry_contact');
  });
});
