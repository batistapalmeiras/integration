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
  return `Olá, ${firstName}! Foi muito bom te ter no nosso Café de Boas-vindas 😊 Agora é hora de participar das nossas aulas de Integração! Preencha sua inscrição por este link: ${signupUrl}`;
}

// Same public link for everyone (no per-person token) — the form identifies
// the person by phone and checks eligibility itself, so there's nothing to
// generate here besides the message text.
export function membershipInterestMessage(name: string): string {
  const firstName = name.split(' ')[0];
  const formUrl = `${window.location.origin}${AppRoute.MembershipInterest}`;
  return `Olá, ${firstName}! Você concluiu as 4 aulas de Integração 🎉 Agora é hora de preencher sua Ficha de Interesse de Membresia. Preencha por este link: ${formUrl}`;
}
