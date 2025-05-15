
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
import { Dices, Swords, Users } from 'lucide-react';
import { useCampaignContext, CampaignProvider } from '@/contexts/campaign-context';
import { CharacterProfileDialog } from '@/components/party/character-profile-dialog';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';


interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const {
    campaigns,
    activeCampaign,
    setCampaignActive: handleSetCampaignActive,
    isLoading,
    selectedCharacterForProfile,
    isProfileOpen,
    closeProfileDialog
  } = useCampaignContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full bg-background text-foreground">

        {mounted && !isLoading && (
          <SidebarNav
            campaigns={campaigns}
            activeCampaign={activeCampaign}
            handleSetCampaignActive={handleSetCampaignActive}
          />
        )}

        <div className="w-[calc(100vw-var(--sidebar-width)-25vw)] md:w-[calc(100vw-var(--sidebar-width)-25vw)] flex-shrink-0 flex flex-col overflow-hidden group-data-[state=collapsed]/sidebar-wrapper:w-[calc(100vw-var(--sidebar-width-icon)-25vw)]">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
            {mounted && activeCampaign && <h1 className="text-lg font-semibold">{activeCampaign?.name || 'QuestFlow'}</h1>}
          </header>

          <header className="sticky top-0 z-10 hidden h-11 shrink-0 items-center border-b bg-background/95 px-6 backdrop-blur-sm md:flex">
            {mounted && activeCampaign && campaigns && (
              <Breadcrumbs 
                activeCampaign={activeCampaign} 
                campaigns={campaigns} 
                setCampaignActive={handleSetCampaignActive} 
              />
            )}
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>

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
                <Swords className="h-4 w-4 mr-1 md:mr-2" />Combat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="party" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
              {mounted && <PartySheet />}
            </TabsContent>
            <TabsContent value="dice" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
              <DiceRollerTool />
            </TabsContent>
            <TabsContent value="combat" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
              <CombatTrackerTool />
            </TabsContent>
          </Tabs>
        </aside>

      </div>
      <Toaster />
      {mounted && selectedCharacterForProfile && (
        <CharacterProfileDialog
          character={selectedCharacterForProfile}
          isOpen={isProfileOpen}
          onClose={closeProfileDialog}
        />
      )}
    </SidebarProvider>
  );
}


export function MainLayout({ children }: MainLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <CampaignProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </CampaignProvider>
  )
}
