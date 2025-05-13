// This is an auto-generated file from Firebase Studio.
'use client';

import Link from 'next/link';
import Image from 'next/image'; // Added import
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/constants';
import { NAV_ITEMS } from '@/lib/constants';
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
// AppLogo removed as it's no longer used directly here
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger as RadixTooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, BookOpen, User, Shield, ScrollText, Users as UsersIcon, ChevronDown, Check, Briefcase } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { useState, useEffect } from 'react'; // Ensure useEffect and useState are imported
import { useToast } from '@/hooks/use-toast';


// Mock data, similar to campaigns page
const initialCampaignsData: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true, bannerImageUrl: `https://picsum.photos/seed/peakbanner/800/200` },
  { id: '2', name: 'Curse of the Sunken City', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/sunkenbanner/800/200` },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/riverwoodbanner/800/200` },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaignsData);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(() => initialCampaignsData.find(c => c.isActive) || initialCampaignsData[0] || null);
  const [isCampaignPopoverOpen, setIsCampaignPopoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Update activeCampaign if campaigns list changes or active status changes
    // This effect runs after initial mount and when campaigns change.
    const currentActive = campaigns.find(c => c.isActive);
    setActiveCampaign(currentActive || campaigns[0] || null);
  }, [campaigns]);

  const handleSetCampaignActive = (campaignId: string) => {
    const selectedCampaign = campaigns.find(c => c.id === campaignId);
    if (selectedCampaign) {
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(c => ({ ...c, isActive: c.id === campaignId }))
      );
      // setActiveCampaign(selectedCampaign); // This will be handled by the useEffect above
      toast({
        title: "Active Campaign Changed",
        description: `"${selectedCampaign.name}" is now the active campaign.`,
      });
      setIsCampaignPopoverOpen(false); // Close popover on selection
    }
  };


  return (
    <Sidebar>
      <SidebarHeader>
        {/* Display campaign banner if sidebar is expanded (on desktop) or on mobile, and an active campaign exists */}
        {mounted && (isMobile || sidebarState === 'expanded') && activeCampaign && activeCampaign.bannerImageUrl && (
          <div className="w-full aspect-[4/1] relative overflow-hidden">
            <Image
              src={activeCampaign.bannerImageUrl}
              alt={`${activeCampaign.name} banner`}
              layout="fill"
              objectFit="cover"
              data-ai-hint="campaign banner fantasy"
              priority 
            />
          </div>
        )}
         {mounted && (isMobile || sidebarState === 'expanded') && activeCampaign && !activeCampaign.bannerImageUrl && (
            <div className="w-full aspect-[4/1] relative overflow-hidden bg-muted flex items-center justify-center text-sm text-muted-foreground">
                No Banner
            </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {/* Campaign Switcher */}
        <div className="p-2 mb-2">
          <Popover open={isCampaignPopoverOpen} onOpenChange={setIsCampaignPopoverOpen}>
            {mounted ? (
                <PopoverTrigger asChild>
                {(sidebarState === 'expanded' || isMobile) ? (
                    <Button
                    variant="outline"
                    className="w-full justify-between bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    >
                    <span className="flex items-center gap-2 truncate">
                        <span className="truncate">{activeCampaign ? activeCampaign.name : 'No Active Campaign'}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                ) : ( // Collapsed sidebar on desktop after mount
                    <TooltipProvider>
                        <Tooltip>
                            <RadixTooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground">
                                    <Briefcase className="h-4 w-4" />
                                </Button>
                            </RadixTooltipTrigger>
                            <TooltipContent side="right" align="center">
                                <p>{activeCampaign ? `Active: ${activeCampaign.name}` : 'Switch Campaign'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                </PopoverTrigger>
            ) : (
                 <Button variant="outline" className="w-full justify-between opacity-70" disabled>
                    <span className="flex items-center gap-2 truncate">
                        <span className="truncate">{activeCampaign ? activeCampaign.name : 'Select Campaign'}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
            )}
            <PopoverContent 
              side="bottom" 
              align="start" 
              className="w-[var(--radix-popover-trigger-width)] p-1 bg-popover text-popover-foreground"
            >
              <div className="flex flex-col space-y-1">
                {campaigns.length > 0 ? campaigns.map(campaign => (
                  <Button
                    key={campaign.id}
                    variant="ghost"
                    className="w-full justify-start text-sm h-auto py-2"
                    onClick={() => handleSetCampaignActive(campaign.id)}
                    disabled={campaign.id === activeCampaign?.id}
                  >
                    {/* Removed icon from active campaign: campaign.id === activeCampaign?.id && <Check className="mr-2 h-4 w-4" /> */}
                    {campaign.name}
                  </Button>
                )) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No campaigns available.</div>
                )}
                <Separator className="my-1"/>
                 <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/campaigns">
                      <PlusCircle className="mr-2 h-4 w-4" /> Manage Campaigns
                    </Link>
                  </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <SidebarMenu className="px-2"> 
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
               <TooltipProvider>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={item.title}
                    className="mx-0" 
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
               </TooltipProvider>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
         <div className="p-2">
            <Popover>
                {mounted ? (
                    <PopoverTrigger asChild>
                    {(sidebarState === 'expanded' || isMobile) ? (
                        <Button variant="outline" className="w-full justify-start">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Make New
                        </Button>
                        ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <RadixTooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="w-full">
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                                </RadixTooltipTrigger>
                                <TooltipContent side="right" align="center">
                                <p>Make New</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        )}
                    </PopoverTrigger>
                ) : (
                    <Button variant="outline" className="w-full justify-start opacity-70" disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Make New
                    </Button>
                )}
              <PopoverContent
                side="top"
                align={(mounted && (sidebarState === 'expanded' || isMobile)) ? "start" : "center"}
                className="w-[var(--radix-popover-trigger-width)] p-1"
              >
                <div className="flex flex-col space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/campaigns">
                      <BookOpen className="mr-2 h-4 w-4" /> New Campaign
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/creator/characters">
                      <User className="mr-2 h-4 w-4" /> New Character
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild disabled>
                    <Link href="/creator/encounters">
                      <Shield className="mr-2 h-4 w-4" /> New Encounter
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/journal">
                      <ScrollText className="mr-2 h-4 w-4" /> New Journal Entry
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" asChild>
                    <Link href="/creator/characters"> 
                      <UsersIcon className="mr-2 h-4 w-4" /> New NPC
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
