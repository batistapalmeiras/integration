import { AppRoute } from '../routes/paths';

export function buildWhatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(text)}`;
}

export function coffeeInviteMessage(name: string): string {
  const firstName = name.split(' ')[0];
  return `Olá, ${firstName}! Tudo bem? Somos da Igreja Batista de Palmeiras e ficamos muito felizes com sua visita. Gostaríamos de te convidar para o nosso Café de Boas-vindas, um momento especial para te conhecermos melhor. Podemos te contar mais sobre isso?`;
}

export function classInviteMessage(name: string): string {
  const firstName = name.split(' ')[0];
  const signupUrl = `${window.location.origin}${AppRoute.IntegrationSignup}`;
  return `Olá, ${firstName}! Foi muito bom te ter no nosso Café de Boas-vindas 😊 Agora é hora de participar das nossas aulas de Integração! Preencha sua inscrição por este link: ${signupUrl}`;
}
