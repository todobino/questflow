
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
  Scroll as ScrollIconEntry // Explicitly alias Scroll
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
  // {
  //   title: 'Campaigns', // This is now handled by the campaign switcher block
  //   href: '/campaigns',
  //   icon: Briefcase,
  // },
  {
    title: 'Search',
    href: '/search',
    icon: SearchIcon,
    disabled: true,
  },
];

export const CAMPAIGN_MENU_NAV_ITEMS: NavItem[] = [
  {
    title: 'Party',
    href: '/party',
    icon: UsersRound,
  },
  // Characters link removed as it's integrated into Party Manager
  // {
  //   title: 'Characters',
  //   href: '/characters',
  //   icon: Users,
  //   disabled: true, 
  // },
  {
    title: 'Encounters',
    href: '/encounters',
    icon: ShieldAlert,
    disabled: true,
  },
  {
    title: 'Maps',
    href: '/maps',
    icon: MapIcon,
  },
  {
    title: 'Tables',
    href: '/tables',
    icon: ListOrdered,
  },
  {
    title: 'Quests',
    href: '/quests',
    icon: ScrollIconEntry, // Use the alias
    disabled: true,
  },
  {
    title: 'Journal',
    href: '/journal',
    icon: BookMarked,
  },
  {
    title: 'Lore',
    href: '/lore',
    icon: BookOpenText,
    disabled: true,
  },
];

// Filter out the disabled "Characters" link for actual rendering if it's truly removed
export const getFilteredCampaignNavItems = () => CAMPAIGN_MENU_NAV_ITEMS.filter(item => item.href !== '/characters' || !item.disabled);

