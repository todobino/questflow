
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger as RadixTooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Briefcase,
  Settings,
  Search as SearchIcon,
} from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { useState, useEffect } from 'react';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';


interface SidebarNavProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  handleSetCampaignActive: (campaignId: string) => void;
}

export function SidebarNav({ campaigns, activeCampaign, handleSetCampaignActive }: SidebarNavProps) {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const campaignNavItems = getFilteredCampaignNavItems();
  const AppLogoComponent = APP_LOGO_ICON;
  const searchNavItem = SITE_NAV_ITEMS.find(item => item.title === 'Search');


  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-2 px-2">
          <AppLogoComponent className="h-6 w-6 text-primary" />
          {(sidebarState === 'expanded' || isMobile) && (
            <span className="font-extrabold text-lg text-foreground">{APP_NAME}</span>
          )}
        </div>
      </SidebarHeader>
      {/* Removed SidebarSeparator here */}

      <SidebarContent>
        {/* Active Campaign Section */}
        {mounted && (
          <div className="px-2 mb-2"> {/* Added mb-2 for gap */}
              <Link
                  href="/campaigns"
                  className={cn(
                      "block rounded-md p-2 bg-sidebar-accent border border-border shadow-md hover:border-primary transition-colors group", // Changed border-sidebar-border to border-border and added shadow-md
                      (sidebarState !== 'expanded' && !isMobile) && "flex justify-center items-center h-12"
                  )}
                  aria-label={activeCampaign ? `Manage campaigns. Active: ${activeCampaign.name}` : "Manage Campaigns"}
              >
              {(sidebarState === 'expanded' || isMobile) ? (
                <>
                  <p className="text-xs text-muted-foreground mb-0.5 group-hover:text-foreground transition-colors">Campaign:</p> {/* Changed text and removed font-semibold */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 overflow-hidden min-w-0">
                        <span className="line-clamp-2 text-left break-words leading-tight font-extrabold text-foreground"> {/* Changed font-medium to font-extrabold */}
                          {activeCampaign ? activeCampaign.name : 'No Active Campaign'}
                        </span>
                    </span>
                  </div>
                </>
              ) : (
                  <TooltipProvider>
                      <Tooltip>
                          <RadixTooltipTrigger asChild>
                             <Briefcase className="h-5 w-5 text-foreground" />
                          </RadixTooltipTrigger>
                          <TooltipContent side="right" align="center">
                              <p>{activeCampaign ? `Active: ${activeCampaign.name}` : 'No Active Campaign'}</p>
                              <p className="text-xs text-muted-foreground">(Manage Campaigns)</p>
                          </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
              )}
            </Link>
          </div>
        )}


        {/* Campaign Menu Nav */}
        <SidebarMenu className="px-2">
          {campaignNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
               <TooltipProvider>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={item.title}
                    disabled={item.disabled || !activeCampaign}
                    className={cn("text-sm",(item.disabled || !activeCampaign) && "cursor-not-allowed opacity-50")}
                >
                    <Link href={(item.disabled || !activeCampaign) ? '#' : item.href}>
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
