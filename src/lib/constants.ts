
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Search as SearchIcon,
  Users,
  ListOrdered,
  ShieldAlert,
  Map as MapIcon,
  BookMarked,
  BookOpenText,
  Swords,
  Settings,
  UsersRound,
  Scroll as ScrollIconEntry,
  Flag,
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
    title: 'Search',
    href: '/search',
    icon: SearchIcon,
    disabled: true,
  },
];

export const CAMPAIGN_MENU_NAV_ITEMS: NavItem[] = [
  {
    title: 'Session Log', // Renamed and moved to top
    href: '/journal',
    icon: BookMarked,
  },
  {
    title: 'Party Roster', // Renamed
    href: '/party',
    icon: UsersRound,
  },
  {
    title: 'Encounters',
    href: '/encounters',
    icon: ShieldAlert,
    disabled: true,
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
    icon: ListOrdered,
  },
  // Questing was merged into Factions & Quests, no longer needed here
  // {
  //   title: 'Questing',
  //   href: '/quests',
  //   icon: ScrollIconEntry, // Assuming ScrollIconEntry is Scroll, or use a different icon if needed
  //   disabled: true,
  // },
  {
    title: 'Lore & World',
    href: '/lore',
    icon: BookOpenText,
    disabled: true,
  },
];

// Filter out the disabled "Characters" link for actual rendering if it's truly removed
export const getFilteredCampaignNavItems = () => CAMPAIGN_MENU_NAV_ITEMS.filter(item => item.href !== '/characters' || !item.disabled);

