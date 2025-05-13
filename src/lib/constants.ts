
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Search,
  Users,
  ListOrdered,
  Shield,
  Map as MapIcon,
  Scroll,
  ScrollText,
  Brain,
  Swords, // Added for logo
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const APP_LOGO_ICON = Swords;
export const APP_NAME = "QuestFlow";

export const SITE_NAV_ITEMS: NavItem[] = [
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: BookOpen,
  },
  {
    title: 'Search',
    href: '/search',
    icon: Search,
    disabled: true, // Placeholder for now
  },
];

export const CAMPAIGN_MENU_NAV_ITEMS: NavItem[] = [
  {
    title: 'Characters',
    href: '/characters',
    icon: Users,
  },
  {
    title: 'Tables',
    href: '/tables',
    icon: ListOrdered,
    disabled: true, // Placeholder
  },
  {
    title: 'Encounters',
    href: '/encounters',
    icon: Shield, // Using Shield for encounters
    disabled: true, // Placeholder for now, was /creator/encounters (Soon)
  },
  {
    title: 'Maps',
    href: '/maps',
    icon: MapIcon,
  },
  {
    title: 'Quests',
    href: '/quests',
    icon: Scroll,
    disabled: true, // Placeholder
  },
  {
    title: 'Journal',
    href: '/journal',
    icon: ScrollText,
  },
  {
    title: 'Lore',
    href: '/lore',
    icon: Brain,
    disabled: true, // Placeholder
  },
];
