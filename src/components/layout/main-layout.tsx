
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiceRollerTool } from '@/components/tools/dice-roller-tool';
import { CombatTrackerTool } from '@/components/tools/combat-tracker-tool';
import { Dices, Swords, Users, FileText } from 'lucide-react';
import { useCampaignContext, CampaignProvider } from '@/contexts/campaign-context';
import { CharacterProfileDialog } from '@/components/party/character-profile-dialog';
import { CampaignSwitcher } from '@/components/shared/campaign-switcher';
import { SessionTools } from '@/components/shared/session-tools';
import { SwitchCampaignDialog } from '@/components/shared/switch-campaign-dialog';
import { CharacterForm } from '@/components/character-creator/character-form';
import type { Character } from '@/lib/types';
import { RACES, CLASSES, SUBCLASSES, BACKGROUNDS } from '@/lib/dnd-data';
import { DND_NAMES } from '@/lib/dnd-names';
import Link from 'next/link';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const {
    activeCampaign,
    campaigns,
    isLoading,
    selectedCharacterForProfile,
    isProfileOpen,
    closeProfileDialog,
    isSwitchCampaignDialogVisible,
    pauseCurrentSession,
    endCurrentSession,
    confirmSwitchCampaign,
    cancelSwitchCampaign,
    setCampaignActive,
    editingCharacterForForm,
    isCharacterFormOpen,
    openCharacterForm,
    closeCharacterForm,
    addCharacter,
    updateCharacter,
  } = useCampaignContext();
  const [mounted, setMounted] = useState(false);
  const [isRandomizingCharacterInDialog, setIsRandomizingCharacterInDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveCharacterInDialog = (characterData: Omit<Character, 'id' | 'campaignId'> & { id?: string }) => {
    if (editingCharacterForForm?.id) {
      updateCharacter({ ...characterData, id: editingCharacterForForm.id, campaignId: activeCampaign!.id });
    } else {
      addCharacter(characterData);
    }
    closeCharacterForm();
  };

  const handleRandomizeInDialog = () => {
    setIsRandomizingCharacterInDialog(true);
    // This logic assumes local randomization, adjust if using AI flow for dialog
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
      backstory: '', // AI backstory not generated here
      imageUrl: `https://placehold.co/400x400.png`, // Default placeholder
      level: 1,
      currentHp: 10,
      maxHp: 10,
      armorClass: 10,
      initiativeModifier: 0,
      currentExp: 0,
      nextLevelExp: 1000,
    };
    openCharacterForm(randomizedData as Character); // Open form with randomized data
    setIsRandomizingCharacterInDialog(false);
  };


  if (!mounted) {
    return null; 
  }

  return (
    <SidebarProvider defaultOpen>
      <div
        className="group/sidebar-wrapper flex h-screen w-full overflow-hidden has-[[data-variant=inset]]:bg-sidebar"
      >
        {mounted && <SidebarNav />}

        <div className="w-[calc(100vw-var(--sidebar-width)-25vw)] md:w-[calc(100vw-var(--sidebar-width)-25vw)] flex-shrink-0 flex flex-col overflow-hidden group-data-[state=collapsed]/sidebar-wrapper:w-[calc(100vw-var(--sidebar-width-icon)-25vw)]">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 py-2 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
            {mounted && activeCampaign && <h1 className="text-lg font-semibold">{activeCampaign.name}</h1>}
          </header>
          
          <header className="sticky top-0 z-10 hidden h-14 shrink-0 items-center justify-between border-b bg-background/95 px-6 py-2 backdrop-blur-sm md:flex">
            {mounted && <CampaignSwitcher />}
            {mounted && <SessionTools />}
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        <aside className="w-[25vw] flex-shrink-0 border-l border-border bg-card text-card-foreground px-4 pt-2 pb-4 hidden md:flex flex-col overflow-hidden">
          <Tabs defaultValue="dice" className="w-full flex-1 flex flex-col min-h-0"> {/* Default to dice */}
            <TabsList className="grid w-full grid-cols-2 shrink-0 border border-neutral-500 dark:border-background"> {/* Changed to grid-cols-2 */}
              <TabsTrigger value="dice" className="text-xs px-1 py-1.5 h-auto font-bold data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground">
                <Dices className="h-4 w-4 mr-1 md:mr-2" />Dice
              </TabsTrigger>
              <TabsTrigger value="combat" className="text-xs px-1 py-1.5 h-auto font-bold data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground">
                <Swords className="h-4 w-4 mr-1 md:mr-2" />Combat
              </TabsTrigger>
            </TabsList>
            {/* Removed Party Tab Content */}
            <TabsContent forceMount value="dice" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
              <DiceRollerTool />
            </TabsContent>
            <TabsContent forceMount value="combat" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
              <CombatTrackerTool />
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
                onEditCharacter={() => openCharacterForm(selectedCharacterForProfile)}
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
  return (
    <CampaignProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </CampaignProvider>
  )
}
