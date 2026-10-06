import { AppRoute } from '../routes/paths';

export function buildWhatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(text)}`;
}

export function initialContactMessage(personName: string, volunteerName: string): string {
  const firstName = personName.split(' ')[0];
  return `Olá, ${firstName}! Tudo bem? Sou ${volunteerName} e tenho um convite especial para você:`;
}

export function classInviteMessage(name: string): string {
  const firstName = name.split(' ')[0];
  const signupUrl = `${window.location.origin}${AppRoute.IntegrationSignup}`;
  return [
    `Olá, ${firstName}!`,
    '',
    'Foi muito bom ter você conosco no nosso Café de Boas-vindas!',
    '',
    'Agora, se você tiver interesse, é hora de dar o próximo passo e participar das nossas aulas de Integração. Para que possamos nos organizar, pedimos que faça sua inscrição o quanto antes.',
    '',
    'No link você encontra os dias das nossas aulas.',
    '',
    'Preencha sua inscrição por este link:',
    '',
    signupUrl,
  ].join('\n');
}

// Same public link for everyone (no per-person token) — the form identifies
// the person by phone and checks eligibility itself, so there's nothing to
// generate here besides the message text.
// Two wordings because the ficha can now be sent at any point in the
// integração: congratulating someone on finishing the classes when they
// still have two to go would read as a mistake on their side.
export function membershipInterestMessage(name: string, completedClasses: boolean): string {
  const firstName = name.split(' ')[0];
  const formUrl = `${window.location.origin}${AppRoute.MembershipInterest}`;
  const opening = completedClasses
    ? `Olá, ${firstName}! Você concluiu as 4 aulas de Integração 🎉 Agora é hora de preencher sua Ficha de Interesse de Membresia.`
    : `Olá, ${firstName}! Se você tem interesse em se tornar membro da nossa igreja, já pode preencher a Ficha de Interesse de Membresia — ela fica guardada e será analisada quando você concluir as aulas de Integração.`;
  return `${opening} Preencha por este link: ${formUrl}`;
}
