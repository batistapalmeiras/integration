// Libs
import {
  AudioLines,
  Baby,
  Briefcase,
  Camera,
  Cast,
  Coffee,
  Crown,
  DoorOpen,
  Flame,
  Flower2,
  HeartHandshake,
  Laptop,
  Lightbulb,
  LucideIcon,
  Megaphone,
  MonitorPlay,
  Music,
  UsersRound,
} from 'lucide-react';
// Local
import { foldText } from '../../domain/text';

const MINISTRY_ICONS: [keyword: string, icon: LucideIcon][] = [
  ['louvor', Music],
  ['kids', Baby],
  ['criva', Flame],
  ['60+', Flower2],
  ['cafe', Coffee],
  ['instagram', Camera],
  ['comunicacao', Megaphone],
  ['diretoria', Briefcase],
  ['familias', UsersRound],
  ['iluminacao', Lightbulb],
  ['lider de pg', Crown],
  ['multimidia', MonitorPlay],
  ['recepcao', DoorOpen],
  ['sonoplastia', AudioLines],
  ['tecnologia', Laptop],
  ['transmissao', Cast],
];

export function ministryIconFor(name: string): LucideIcon {
  const normalized = foldText(name);
  return MINISTRY_ICONS.find(([keyword]) => normalized.includes(keyword))?.[1] ?? HeartHandshake;
}
