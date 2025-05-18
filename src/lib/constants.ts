
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
    title: 'Sessions', // Changed from 'Session Log'
    href: '/journal',
    icon: BookMarked,
  },
  {
    title: 'Adventurers', // Changed from 'Party Manager'
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
    title: 'Factions', // Changed from 'Factions & Quests'
    href: '/factions-quests',
    icon: Flag,
    disabled: false,
  },
  {
    title: 'Maps', // Changed from 'Maps & Boards'
    href: '/maps',
    icon: MapIcon,
  },
  {
    title: 'Tables', // Changed from 'Random Tables'
    href: '/tables',
    icon: Table,
    disabled: false,
  },
   {
    title: 'Questing', // No change requested for this one in this specific prompt, but kept for consistency with prior state
    href: '/quests',
    icon: ScrollIconEntry, 
    disabled: true,
  },
  {
    title: 'Story', // Changed from 'Lore & World'
    href: '/lore',
    icon: BookOpenText,
    disabled: true,
  },
];

// Filter out the disabled "Characters" link for actual rendering if it's truly removed
export const getFilteredCampaignNavItems = () => CAMPAIGN_MENU_NAV_ITEMS.filter(item => item.href !== '/characters' || !item.disabled);

