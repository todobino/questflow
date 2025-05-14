
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
  Swords, 
  Settings, // Added Settings
  UsersRound, // Added for Party
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
    title: 'Party', // New Party Item
    href: '/party',
    icon: UsersRound, 
  },
  {
    title: 'Characters', // Will be removed as per new flow
    href: '/characters',
    icon: Users,
    disabled: true, // Marking as disabled as it's being replaced by Party page
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

// Filter out the disabled "Characters" link for actual rendering if it's truly removed
export const getFilteredCampaignNavItems = () => CAMPAIGN_MENU_NAV_ITEMS.filter(item => item.href !== '/characters' || !item.disabled);
