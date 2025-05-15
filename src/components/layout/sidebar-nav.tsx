
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/constants';
import { SITE_NAV_ITEMS, getFilteredCampaignNavItems, APP_LOGO_ICON, APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarSeparator, // Ensure SidebarSeparator is imported
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger as RadixTooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Briefcase,
  Settings,
  Search as SearchIcon,
  ChevronDown,
} from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { useState, useEffect } from 'react';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";


interface SidebarNavProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  handleSetCampaignActive: (campaignId: string) => void;
}

export function SidebarNav({ campaigns, activeCampaign, handleSetCampaignActive }: SidebarNavProps) {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [campaignSwitcherOpen, setCampaignSwitcherOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const campaignNavItems = getFilteredCampaignNavItems();
  const AppLogoComponent = APP_LOGO_ICON;
  const searchNavItem = SITE_NAV_ITEMS.find(item => item.title === 'Search');

  const handleCampaignSelect = (campaignId: string) => {
    handleSetCampaignActive(campaignId);
    setCampaignSwitcherOpen(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <Link href="/campaigns" className="flex items-center gap-2 px-2 text-foreground hover:text-foreground">
          <AppLogoComponent className="h-6 w-6 text-primary" />
          {(sidebarState === 'expanded' || isMobile) && (
            <span className="font-extrabold text-lg">{APP_NAME}</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Campaign Menu Nav */}
        <SidebarMenu className="px-2 pt-2"> {/* Added pt-2 here */}
          {campaignNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
               <TooltipProvider>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={item.title}
                    disabled={item.disabled || (!activeCampaign && item.href !== '/campaigns')} // Allow campaigns link even if no active campaign
                    className={cn("text-sm", (item.disabled || (!activeCampaign && item.href !== '/campaigns')) && "cursor-not-allowed opacity-50")}
                >
                    <Link href={(item.disabled || (!activeCampaign && item.href !== '/campaigns')) ? '#' : item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
               </TooltipProvider>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto p-2 border-t border-sidebar-border">
        <SidebarMenu className="px-0">
          {searchNavItem && (
            <SidebarMenuItem>
              <TooltipProvider>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === searchNavItem.href}
                  tooltip={searchNavItem.title}
                  disabled={searchNavItem.disabled}
                  className="text-sm"
                >
                  <Link href={searchNavItem.disabled ? '#' : searchNavItem.href}>
                    <searchNavItem.icon />
                    <span>{searchNavItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </TooltipProvider>
            </SidebarMenuItem>
          )}
           <ThemeToggleButton />
            <SidebarMenuItem>
                <TooltipProvider>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/settings'}
                        tooltip="Settings"
                        className="text-sm"
                    >
                        <Link href="/settings">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </TooltipProvider>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
