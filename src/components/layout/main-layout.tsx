
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartySheet } from '@/components/party/party-sheet';
import { DiceRollerTool } from '@/components/tools/dice-roller-tool';
import { CombatTrackerTool } from '@/components/tools/combat-tracker-tool';
import { ReferenceTool } from '@/components/tools/reference-tool'; 
import { Dice2, Swords, Info, UserRound } from 'lucide-react'; 
import { useCampaignContext, CampaignProvider } from '@/contexts/campaign-context';
import { CharacterProfileDialog } from '@/components/party/character-profile-dialog';
import { CampaignSwitcher } from '@/components/shared/campaign-switcher';
import { SessionTools } from '@/components/shared/session-tools';
import { SwitchCampaignDialog } from '@/components/shared/switch-campaign-dialog';
import { CharacterForm } from '@/components/character-creator/character-form';
import type { Character } from '@/lib/types';
import { RACES, CLASSES, SUBCLASSES, BACKGROUNDS } from '@/lib/dnd-data';
import { DND_NAMES } from '@/lib/dnd-names';
import { Dialog } from '@/components/ui/dialog'; 
import { cn } from '@/lib/utils';


interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const {
    activeCampaign,
    campaigns,
    setCampaignActive,
    selectedCharacterForProfile,
    isProfileOpen,
    closeProfileDialog,
    isSwitchCampaignDialogVisible,
    pauseCurrentSession,
    endCurrentSession,
    confirmSwitchCampaign,
    cancelSwitchCampaign,
    editingCharacterForForm,
    isCharacterFormOpen,
    openCharacterForm,
    closeCharacterForm,
    addCharacter,
    updateCharacter,
    isCombatActive,
  } = useCampaignContext();
  const [mounted, setMounted] = useState(false);
  const [isRandomizingCharacterInDialog, setIsRandomizingCharacterInDialog] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveCharacterInDialog = (characterData: Omit<Character, 'id' | 'campaignId'> & { id?: string }) => {
    if (editingCharacterForForm?.id && activeCampaign) {
      updateCharacter({ ...characterData, id: editingCharacterForForm.id, campaignId: activeCampaign.id });
    } else if (activeCampaign) { // Ensure activeCampaign exists for new characters
      addCharacter(characterData);
    }
    closeCharacterForm();
  };

  const handleRandomizeInDialog = () => {
    setIsRandomizingCharacterInDialog(true);
    const randomRace = RACES[Math.floor(Math.random() * RACES.length)];
    const randomClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
    const subclassesForClass = SUBCLASSES[randomClass] || [];
    const randomSubclass = subclassesForClass.length > 0 ? subclassesForClass[Math.floor(Math.random() * subclassesForClass.length)] : '';
    const randomBackground = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    
    const namesForRace = DND_NAMES[randomRace] || DND_NAMES.Human; 
    const randomFirstName = namesForRace.firstNames[Math.floor(Math.random() * namesForRace.firstNames.length)];
    const randomLastName = namesForRace.lastNames[Math.floor(Math.random() * namesForRace.lastNames.length)];
    const characterName = `${randomFirstName} ${randomLastName}`;

    const randomizedData: Partial<Character> = {
      name: characterName,
      race: randomRace,
      class: randomClass,
      subclass: randomSubclass,
      background: randomBackground,
      backstory: '', // AI no longer generates this part for this button
      imageUrl: `https://placehold.co/400x400.png`, // Default placeholder
      level: 1,
      currentHp: 10,
      maxHp: 10,
      armorClass: 10,
      initiativeModifier: 0,
      currentExp: 0,
      nextLevelExp: 1000,
      abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    };
    // Directly pass to openCharacterForm to pre-fill
    openCharacterForm(randomizedData as Character); 
    setIsRandomizingCharacterInDialog(false);
  };


  if (!mounted) {
    return null; 
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="group/sidebar-wrapper flex h-screen w-full overflow-hidden has-[[data-variant=inset]]:bg-sidebar">

        {mounted && <SidebarNav />}

        <div className="w-[calc(100vw-var(--sidebar-width)-25vw)] md:w-[calc(100vw-var(--sidebar-width)-25vw)] flex-shrink-0 flex flex-col overflow-hidden group-data-[state=collapsed]/sidebar-wrapper:w-[calc(100vw-var(--sidebar-width-icon)-25vw)]">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
            {mounted && activeCampaign && <h1 className="text-lg font-semibold">{activeCampaign.name}</h1>}
          </header>
          
          <header className="sticky top-0 z-10 hidden h-14 items-center justify-between border-b bg-background/95 px-6 py-2 backdrop-blur-sm md:flex">
             {mounted && <CampaignSwitcher />}
             {mounted && <SessionTools />}
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        <aside className="w-[25vw] flex-shrink-0 border-l border-border bg-card text-card-foreground px-4 pt-2 pb-4 hidden md:flex flex-col overflow-hidden">
          <Tabs defaultValue="dice" className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 shrink-0">
              <TabsTrigger value="dice" className="text-xs px-1 py-1.5 h-auto font-bold">
                <Dice2 className="h-4 w-4 mr-1 md:mr-2" />Dice 
              </TabsTrigger>
              <TabsTrigger 
                value="combat" 
                className={cn(
                  "text-xs px-1 py-1.5 h-auto font-bold",
                  isCombatActive && 'text-alert data-[state=active]:text-alert data-[state=inactive]:hover:text-alert'
                )}
              >
                <Swords className="h-4 w-4 mr-1 md:mr-2" />Combat
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs px-1 py-1.5 h-auto font-bold">
                <Info className="h-4 w-4 mr-1 md:mr-2" />Info
              </TabsTrigger>
            </TabsList>
            <TabsContent forceMount value="dice" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 pt-3">
              <DiceRollerTool />
            </TabsContent>
            <TabsContent
              forceMount
              value="combat"
              className={cn( // This TabsContent now just handles overflow and basic flex properties
                "flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 pt-3"
              )}
            >
              <CombatTrackerTool />
            </TabsContent>
            <TabsContent forceMount value="info" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 pt-3">
              <ReferenceTool />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      <Toaster />
      {mounted && selectedCharacterForProfile && (
        <Dialog open={isProfileOpen} onOpenChange={(open) => !open && closeProfileDialog()}>
            <CharacterProfileDialog
                character={selectedCharacterForProfile}
                isOpen={isProfileOpen}
                onClose={closeProfileDialog}
            />
        </Dialog>
      )}
       {mounted && isCharacterFormOpen && (
          <Dialog open={isCharacterFormOpen} onOpenChange={(open) => !open && closeCharacterForm()}>
            <CharacterForm
              isDialog
              currentCharacter={editingCharacterForForm}
              onSave={handleSaveCharacterInDialog}
              onClose={closeCharacterForm}
              onRandomize={handleRandomizeInDialog}
              isRandomizing={isRandomizingCharacterInDialog}
            />
          </Dialog>
        )}
      {mounted && (
        <SwitchCampaignDialog
          isOpen={isSwitchCampaignDialogVisible}
          onClose={cancelSwitchCampaign}
          onPauseAndSwitch={() => {
            pauseCurrentSession();
            confirmSwitchCampaign();
          }}
          onEndAndSwitch={() => {
            endCurrentSession();
            confirmSwitchCampaign();
          }}
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
