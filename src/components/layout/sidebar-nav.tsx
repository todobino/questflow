
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/constants';
import { SITE_NAV_ITEMS, CAMPAIGN_MENU_NAV_ITEMS, APP_LOGO_ICON, APP_NAME } from '@/lib/constants';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger as RadixTooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  ChevronDown,
  Check,
  Briefcase,
  Search as SearchIcon,
  Settings,
} from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';

interface SidebarNavProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  handleSetCampaignActive: (campaignId: string) => void;
}

export function SidebarNav({ campaigns, activeCampaign, handleSetCampaignActive }: SidebarNavProps) {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar();

  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const filteredCampaigns = useMemo(() => {
    let sorted = [...campaigns].sort((a,b) => (b.isActive ? 1 : 0) - (a.isActive ? 1: 0) || campaigns.indexOf(a) - campaigns.indexOf(b) );
    if (campaignSearchTerm) {
        sorted = sorted.filter(campaign =>
          campaign.name.toLowerCase().includes(campaignSearchTerm.toLowerCase())
        );
    }
    return sorted;
  }, [campaigns, campaignSearchTerm]);

  const AppLogoComponent = APP_LOGO_ICON;

  const onCampaignSelect = (campaignId: string) => {
    handleSetCampaignActive(campaignId);
    setIsCampaignDialogOpen(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-2">
        {(sidebarState === 'expanded' || isMobile) ? (
          <div className="flex items-center gap-2 px-2">
            <AppLogoComponent className="h-6 w-6 text-primary" />
            <span className="font-extrabold text-lg text-foreground">{APP_NAME}</span>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <RadixTooltipTrigger asChild>
                <div className="flex justify-center items-center h-10"> {/* Consistent height */}
                  <AppLogoComponent className="h-6 w-6 text-primary" />
                </div>
              </RadixTooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{APP_NAME}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Site Nav Menu */}
        <SidebarMenu className="px-2 pt-2">
          {SITE_NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
               <TooltipProvider>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={item.title}
                    disabled={item.disabled}
                    className={cn("text-sm", item.disabled && "cursor-not-allowed opacity-50")}
                >
                    <Link href={item.disabled ? '#' : item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
               </TooltipProvider>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-2"/>

        {/* Active Campaign Section */}
        <div className="px-3 mb-1">
          {(sidebarState === 'expanded' || isMobile) && (
            <p className="text-xs font-semibold text-muted-foreground mb-1 px-1">ACTIVE CAMPAIGN</p>
          )}
          <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
            {mounted ? (
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "group w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-auto py-1.5 px-2 items-center text-sm",
                      (sidebarState !== 'expanded' && !isMobile) && "justify-center"
                    )}
                  >
                    {(sidebarState === 'expanded' || isMobile) ? (
                      <>
                        <span className="flex items-center gap-2 overflow-hidden min-w-0">
                            <span className="line-clamp-2 text-left break-words leading-tight font-medium">
                              {activeCampaign ? activeCampaign.name : 'No Active Campaign'}
                            </span>
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                      </>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <RadixTooltipTrigger asChild>
                                   <Briefcase className="h-5 w-5" />
                                </RadixTooltipTrigger>
                                <TooltipContent side="right" align="center">
                                    <p>{activeCampaign ? `Active: ${activeCampaign.name}` : 'Switch Campaign'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                  </Button>
                </DialogTrigger>
            ) : (
                 <Button variant="ghost" className={cn("w-full justify-between opacity-70 h-auto py-1.5 px-2 items-center text-sm", (sidebarState !== 'expanded' && !isMobile) && "justify-center")} disabled>
                     {(sidebarState === 'expanded' || isMobile) ? (
                        <>
                        <span className="flex items-center gap-2 overflow-hidden min-w-0">
                            <span className="line-clamp-2 text-left break-words leading-tight font-medium">
                                {activeCampaign ? activeCampaign.name : 'Select Campaign'}
                            </span>
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 ml-auto flex-shrink-0" />
                        </>
                     ) : (
                        <Briefcase className="h-5 w-5" />
                     )}
                </Button>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Switch Active Campaign</DialogTitle>
                  <DialogDescription>Select a campaign to make it active. Search by name.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search campaigns..."
                      value={campaignSearchTerm}
                      onChange={(e) => setCampaignSearchTerm(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1 max-h-[300px] overflow-y-auto pr-1 -mr-2 pl-1">
                  {filteredCampaigns.length > 0 ? filteredCampaigns.map(campaign => (
                    <Button
                      key={campaign.id}
                      variant="ghost"
                      className={`w-full justify-start text-sm h-auto py-2 ${campaign.id === activeCampaign?.id ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}`}
                      onClick={() => onCampaignSelect(campaign.id)}
                    >
                      {campaign.id === activeCampaign?.id && <Check className="mr-2 h-4 w-4 flex-shrink-0" />}
                      <span className="truncate">{campaign.name}</span>
                    </Button>
                  )) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {campaignSearchTerm ? "No campaigns match your search." : "No campaigns available."}
                    </div>
                  )}
                </div>
                 <DialogFooter className="mt-4 pt-4 border-t">
                   <Button variant="outline" className="w-full justify-center text-sm h-auto py-2" asChild onClick={() => setIsCampaignDialogOpen(false)}>
                    <Link href="/campaigns">
                      <Briefcase className="mr-2 h-4 w-4" /> Manage Campaigns
                    </Link>
                  </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaign Menu Nav */}
        <SidebarMenu className="px-2">
          {CAMPAIGN_MENU_NAV_ITEMS.map((item) => (
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

