
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  ScrollText,
  Swords,
  Users,
  Dice5,
  Map,
  Brain,
  Settings,
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
    // description: 'Generate D&D battle maps with AI.' // This field is not used by NavItem, description is on PageHeader
  },
  {
    title: 'Journal',
    href: '/journal',
    icon: ScrollText,
  },
  {
    title: 'Dice Roller',
    href: '/dice-roller',
    icon: Dice5,
  },
  {
    title: 'Combat Tracker',
    href: '/combat-tracker',
    icon: Swords,
  },
  // The AI assistant is integrated into other tools, so no dedicated nav item for now.
  // {
  //   title: 'AI Assistant',
  //   href: '/ai-assistant',
  //   icon: Brain,
  // },
];
