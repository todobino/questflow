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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger as RadixTooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, BookOpen, User, Shield, ScrollText, Users as UsersIcon, ChevronDown, Check, Briefcase, Search } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react'; 
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


// Mock data, similar to campaigns page
const initialCampaignsData: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true, bannerImageUrl: `https://picsum.photos/seed/peakbanner/400/400` },
  { id: '2', name: 'Curse of the Sunken City: A Tale of Underwater Woe and Barnacles', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/sunkenbanner/400/400` },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/riverwoodbanner/400/400` },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaignsData);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(() => initialCampaignsData.find(c => c.isActive) || initialCampaignsData[0] || null);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Update activeCampaign if campaigns list changes or active status changes
    const currentActive = campaigns.find(c => c.isActive);
    setActiveCampaign(currentActive || campaigns[0] || null);
  }, [campaigns]);

  const handleSetCampaignActive = (campaignId: string) => {
    const selectedCampaign = campaigns.find(c => c.id === campaignId);
    if (selectedCampaign) {
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(c => ({ ...c, isActive: c.id === campaignId }))
      );
      toast({
        title: "Active Campaign Changed",
        description: `"${selectedCampaign.name}" is now the active campaign.`,
      });
      setIsCampaignDialogOpen(false); // Close dialog on selection
    }
  };

  const filteredCampaigns = useMemo(() => {
    // Simulate "most recent" by keeping the order of initialCampaignsData and filtering
    // In a real app, sort by a date field. New items in mock data are often added to end or start.
    // Here, we just filter. Sorting for "most recent" would require a creation date.
    // For now, let's keep original order if no search, or filter then keep that sub-order.
    // Or, if "most recent" means "last added to initialCampaignsData", then reverse.
    // Let's assume initialCampaignsData is "oldest to newest", so reverse for "newest first"
    let sorted = [...campaigns].reverse(); 
    if (campaignSearchTerm) {
        sorted = sorted.filter(campaign =>
          campaign.name.toLowerCase().includes(campaignSearchTerm.toLowerCase())
        );
    }
    return sorted;
  }, [campaigns, campaignSearchTerm]);


  return (
    <Sidebar>
      <SidebarHeader>
        {/* Display campaign banner if sidebar is expanded (on desktop) or on mobile, and an active campaign exists */}
        {mounted && (isMobile || sidebarState === 'expanded') && activeCampaign && (
          <div className="p-2"> 
            <div className={`aspect-square rounded-lg overflow-hidden relative ${!activeCampaign.bannerImageUrl ? 'bg-muted flex items-center justify-center text-sm text-muted-foreground' : ''}`}>
              {activeCampaign.bannerImageUrl ? (
                <Image
                  src={activeCampaign.bannerImageUrl}
                  alt={`${activeCampaign.name} banner`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg" // Ensure image itself is also rounded if needed, parent div handles overflow
                  data-ai-hint="campaign art" // Updated hint
                  priority 
                />
              ) : (
                <span>No Banner</span>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {/* Campaign Switcher */}
        <div className="px-2 mb-2"> {/* px-2 to match SidebarMenu */}
          <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
            {mounted ? (
                <DialogTrigger asChild>
                {(sidebarState === 'expanded' || isMobile) ? (
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground h-auto py-2.5 items-start text-sm"
                    >
                      <span className="flex items-center gap-2 overflow-hidden min-w-0">
                          <span className="line-clamp-2 text-left break-words leading-tight">
                            {activeCampaign ? activeCampaign.name : 'No Active Campaign'}
                          </span>
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0 mt-0.5" />
                    </Button>
                ) : ( 
                    <TooltipProvider>
                        <Tooltip>
                            <RadixTooltipTrigger asChild>
                               <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground">
                                    <Briefcase className="h-4 w-4" />
                                </Button>
                               </DialogTrigger>
                            </RadixTooltipTrigger>
                            <TooltipContent side="right" align="center">
                                <p>{activeCampaign ? `Active: ${activeCampaign.name}` : 'Switch Campaign'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                </DialogTrigger>
            ) : (
                 <Button variant="outline" className="w-full justify-between opacity-70 h-auto py-2.5 items-start text-sm" disabled>
                    <span className="flex items-center gap-2 overflow-hidden min-w-0">
                        <span className="line-clamp-2 text-left break-words leading-tight">
                            {activeCampaign ? activeCampaign.name : 'Select Campaign'}
                        </span>
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0 mt-0.5" />
                </Button>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Switch Active Campaign</DialogTitle>
                  <DialogDescription>Select a campaign to make it active. Search by name.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search campaigns..."
                      value={campaignSearchTerm}
                      onChange={(e) => setCampaignSearchTerm(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1 max-h-[300px] overflow-y-auto pr-1 -mr-2 pl-1"> {/* Adjust padding for scrollbar */}
                  {filteredCampaigns.length > 0 ? filteredCampaigns.map(campaign => (
                    <Button
                      key={campaign.id}
                      variant="ghost"
                      className={`w-full justify-start text-sm h-auto py-2 ${campaign.id === activeCampaign?.id ? 'bg-accent text-accent-foreground' : ''}`}
                      onClick={() => {
                        handleSetCampaignActive(campaign.id);
                      }}
                    >
                      {campaign.id === activeCampaign?.id && <Check className="mr-2 h-4 w-4" />}
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
                      <PlusCircle className="mr-2 h-4 w-4" /> Manage Campaigns
                    </Link>
                  </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <SidebarMenu className="px-2"> 
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
               <TooltipProvider>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={item.title}
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

