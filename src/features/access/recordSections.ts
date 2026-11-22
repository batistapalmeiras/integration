// Libs
import { KeyRound, User } from 'lucide-react';
// Components
import { SectionItem } from '../../components/SectionShell';

export function personItems(base: string): SectionItem[] {
  return [
    { label: 'Cadastro', path: base, icon: User },
    { label: 'Acesso', path: `${base}/acesso`, icon: KeyRound },
  ];
}
