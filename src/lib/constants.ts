
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  ScrollText,
  Users,
  Map,
  BookOpen,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: BookOpen,
  },
  {
    title: 'Creator Tools',
    href: '/creator/characters', // Default to characters
    icon: Users,
  },
  {
    title: 'Map Maker',
    href: '/map-maker',
    icon: Map,
  },
  {
    title: 'Journal',
    href: '/journal',
    icon: ScrollText,
  },
  // Dice Roller and Combat Tracker moved to right sidebar
  // {
  //   title: 'Dice Roller',
  //   href: '/dice-roller',
  //   icon: Dice5,
  // },
  // {
  //   title: 'Combat Tracker',
  //   href: '/combat-tracker',
  //   icon: Swords,
  // },
];
