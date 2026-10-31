// Local
import { visitorQueue, visitorReason, type VisitorQueuePerson } from './visitorQueue';

const now = new Date('2026-10-30T15:00:00-03:00');

const person = (overrides: Partial<VisitorQueuePerson>): VisitorQueuePerson => ({
  status: 'initial_contact',
  whatsapp_opened_at: null,
  coffee_retry_used: false,
  created_at: '2026-10-26T12:00:00-03:00',
  updated_at: '2026-10-26T12:00:00-03:00',
  ...overrides,
});

describe('visitorQueue', () => {
  it('needs contact while nobody opened WhatsApp', () => {
    expect(visitorQueue(person({ status: 'retry_contact' }))).toBe('contact');
  });

  it('waits once WhatsApp was opened', () => {
    expect(visitorQueue(person({ whatsapp_opened_at: '2026-10-29T10:00:00-03:00' }))).toBe('waiting');
  });

  it('keeps archived people apart', () => {
    expect(visitorQueue(person({ status: 'archived', whatsapp_opened_at: '2026-10-29T10:00:00-03:00' }))).toBe(
      'archived',
    );
  });
});

describe('visitorReason', () => {
  it('shows when a first contact was registered', () => {
    expect(visitorReason(person({}), [], now)).toBe('Primeiro contato · cadastrado em 26/10/2026');
  });

  it('counts the attempts and the silence since the last one', () => {
    const reason = visitorReason(
      person({ status: 'retry_contact' }),
      ['2026-10-20T10:00:00-03:00', '2026-10-25T10:00:00-03:00'],
      now,
    );
    expect(reason).toBe('Sem resposta há 5 dias · 3ª tentativa');
  });

  it('flags the single retry left after missing the café', () => {
    expect(visitorReason(person({ status: 'retry_contact', coffee_retry_used: true }), [], now)).toBe(
      'Faltou ao café · última tentativa',
    );
  });

  it('says when the message went out', () => {
    expect(visitorReason(person({ whatsapp_opened_at: '2026-10-29T10:00:00-03:00' }), [], now)).toBe(
      'Mensagem enviada ontem',
    );
  });
});
