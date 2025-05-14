
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiceRollerTool } from '@/components/tools/dice-roller-tool';
import { CombatTrackerTool } from '@/components/tools/combat-tracker-tool';
import { PartySheet } from '@/components/party/party-sheet';
import { Dices, Shield, Users } from 'lucide-react';
import type { Campaign } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

const initialCampaignsData: Campaign[] = [
  { id: '1', name: 'The Whispering Peaks', description: 'An adventure into the mysterious mountains where ancient secrets lie.', isActive: true, bannerImageUrl: `https://picsum.photos/seed/peakbanner/400/400` },
  { id: '2', name: 'Curse of the Sunken City: A Tale of Underwater Woe and Barnacles', description: 'Explore the ruins of a city lost beneath the waves.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/sunkenbanner/400/400` },
  { id: '3', name: 'Shadows over Riverwood', description: 'A darkness looms over a quaint village, and heroes must rise.', isActive: false, bannerImageUrl: `https://picsum.photos/seed/riverwoodbanner/400/400` },
];

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaignsData);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const currentActive = initialCampaignsData.find(c => c.isActive) || initialCampaignsData[0] || null;
    setActiveCampaign(currentActive);
    if (currentActive && !initialCampaignsData.find(c => c.id === currentActive.id)) {
       setCampaigns(prev => [currentActive, ...prev.filter(c => c.id !== currentActive.id)]);
    } else {
       setCampaigns(initialCampaignsData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted) {
        const currentActiveCampaign = campaigns.find(c => c.isActive);
        setActiveCampaign(currentActiveCampaign || campaigns[0] || null);
    }
  }, [campaigns, mounted]);

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
    }
  };


  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full bg-background text-foreground">

        {/* Left Sidebar */}
        <SidebarNav 
          campaigns={campaigns}
          activeCampaign={activeCampaign}
          handleSetCampaignActive={handleSetCampaignActive}
        />

        {/* Center Content Column */}
        <div className="w-[calc(100vw-var(--sidebar-width)-25vw)] md:w-[calc(100vw-var(--sidebar-width)-25vw)] flex-shrink-0 flex flex-col overflow-hidden group-data-[state=collapsed]/sidebar-wrapper:w-[calc(100vw-var(--sidebar-width-icon)-25vw)]">
          {/* Mobile Header */}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
            {mounted && activeCampaign && <h1 className="text-lg font-semibold">{activeCampaign?.name || 'QuestFlow'}</h1>}
          </header>
          
          {/* Desktop Breadcrumbs Header */}
          <header className="sticky top-0 z-10 hidden h-12 shrink-0 items-center border-b bg-background/95 px-6 backdrop-blur-sm md:flex">
            {mounted && <Breadcrumbs activeCampaign={activeCampaign} />}
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Right Sidebar Column */}
        <aside className="w-[25vw] flex-shrink-0 border-l border-border bg-card text-card-foreground p-4 hidden md:flex flex-col overflow-hidden">
          <Tabs defaultValue="party" className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 shrink-0">
              <TabsTrigger value="party" className="text-xs px-1 py-1.5 h-auto">
                <Users className="h-4 w-4 mr-1 md:mr-2" />Party
              </TabsTrigger>
              <TabsTrigger value="dice" className="text-xs px-1 py-1.5 h-auto">
                <Dices className="h-4 w-4 mr-1 md:mr-2" />Dice
              </TabsTrigger>
              <TabsTrigger value="combat" className="text-xs px-1 py-1.5 h-auto">
                <Shield className="h-4 w-4 mr-1 md:mr-2" />Combat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="party" className="flex-1 overflow-y-auto mt-3 focus-visible:ring-0 focus-visible:ring-offset-0">
              {mounted && <PartySheet activeCampaignId={activeCampaign?.id} />}
            </TabsContent>
            <TabsContent value="dice" className="flex-1 overflow-y-auto mt-3 focus-visible:ring-0 focus-visible:ring-offset-0">
              <DiceRollerTool />
            </TabsContent>
            <TabsContent value="combat" className="flex-1 overflow-y-auto mt-3 focus-visible:ring-0 focus-visible:ring-offset-0">
              <CombatTrackerTool />
            </TabsContent>
          </Tabs>
        </aside>

      </div>
      <Toaster />
    </SidebarProvider>
  );
}
