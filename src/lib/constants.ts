
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Search as SearchIcon, // Renamed to avoid conflict if 'Search' component is used
  Users,
  ListOrdered,
  Shield,
  Map as MapIcon,
  Scroll,
  ScrollText,
  Brain,
  Swords, 
  Settings, 
  UsersRound, 
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
  // { // Removed "Campaigns" from here as it's accessed via the switcher
  //   title: 'Campaigns',
  //   href: '/campaigns',
  //   icon: BookOpen,
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
  {
    title: 'Tables',
    href: '/tables',
    icon: ListOrdered,
    disabled: true, 
  },
  {
    title: 'Encounters',
    href: '/encounters',
    icon: Shield, 
    disabled: true, 
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
    disabled: true, 
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
    disabled: true, 
  },
];

// Filter out the disabled "Characters" link for actual rendering if it's truly removed
export const getFilteredCampaignNavItems = () => CAMPAIGN_MENU_NAV_ITEMS.filter(item => item.href !== '/characters' || !item.disabled);

