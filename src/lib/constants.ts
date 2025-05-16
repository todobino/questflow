
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Search as SearchIcon,
  Users,
  ShieldAlert,
  Map as MapIcon,
  BookMarked,
  BookOpenText,
  Swords,
  Settings,
  UsersRound,
  Scroll as ScrollIconEntry,
  Flag,
  Table,
  Crosshair,
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
  // Campaigns item removed
];

export const CAMPAIGN_MENU_NAV_ITEMS: NavItem[] = [
  {
    title: 'Session Log',
    href: '/journal',
    icon: BookMarked,
  },
  {
    title: 'Party Manager', // Changed from Party Roster
    href: '/party',
    icon: UsersRound,
  },
  {
    title: 'Encounters',
    href: '/encounters',
    icon: Crosshair, 
    disabled: false, 
  },
  {
    title: 'Factions & Quests',
    href: '/factions-quests',
    icon: Flag,
    disabled: false,
  },
  {
    title: 'Maps & Boards',
    href: '/maps',
    icon: MapIcon,
  },
  {
    title: 'Random Tables',
    href: '/tables',
    icon: Table,
    disabled: false,
  },
  {
    title: 'Lore & World',
    href: '/lore',
    icon: BookOpenText,
    disabled: true,
  },
];

// Filter out the disabled "Characters" link for actual rendering if it's truly removed
export const getFilteredCampaignNavItems = () => CAMPAIGN_MENU_NAV_ITEMS.filter(item => item.href !== '/characters' || !item.disabled);
