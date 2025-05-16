
'use client';

import { useState, useEffect } from 'react';
// Removed Image import as PartySheet handles its own images
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Character, InventoryItem } from '@/lib/types';
import { useCampaignContext } from '@/contexts/campaign-context';
import { PlusCircle, Users, Zap, Settings2, Edit3, Trash2, Loader2, Heart, Shield as ShieldIcon, Award, Backpack, ScrollText } from 'lucide-react';
import { PartySheet } from '@/components/party/party-sheet'; // Import PartySheet
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// Removed AlertDialog related imports as CharacterCard with these actions is removed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';

// CharacterCard component is removed as PartySheet will be used directly

export default function PartyManagerPage() {
  const {
    activeCampaign,
    characters, // Still needed for PartySheet indirectly via context
    // deleteCharacter: deleteCharacterFromContext, // No longer directly used on this page
    isLoading: isCampaignLoading,
    // openProfileDialog, // No longer directly used on this page, PartySheet handles it
    openCharacterForm 
  } = useCampaignContext();

  const [linkPartyLevel, setLinkPartyLevel] = useState(true);
  const [partyInventoryItems, setPartyInventoryItems] = useState<InventoryItem[]>([
    { id: 'item1', name: 'Longsword +1', type: 'weapon', quantity: 1, description: 'A finely crafted longsword imbued with minor magic.' },
    { id: 'item2', name: 'Potion of Healing (Greater)', type: 'potion', quantity: 3, description: 'Restores 4d4 + 4 hit points.' },
    { id: 'item3', name: 'Chain Mail', type: 'armor', quantity: 1, description: 'Standard chain mail armor.' },
    { id: 'item4', name: 'Thieves\' Tools', type: 'gear', quantity: 1, description: 'Essential for any rogue.' },
    { id: 'item5', name: 'Ancient Gold Coin', type: 'treasure', quantity: 5, description: 'An old coin from a forgotten kingdom.' },
    { id: 'item6', name: 'Scroll of Fireball', type: 'scroll', quantity: 1, description: 'A scroll containing the Fireball spell.' },
    { id: 'item7', name: 'Dagger of Venom', type: 'weapon', quantity: 1, description: 'A wicked-looking dagger that can be coated with poison.' },
    { id: 'item8', name: 'Potion of Invisibility', type: 'potion', quantity: 1, description: 'Makes the drinker invisible for a short time.' },
    { id: 'item9', name: 'Rope (50 feet, silk)', type: 'gear', quantity: 1, description: 'Strong and light silk rope.' },
  ]);

  const handleAddCharacterClick = () => {
    openCharacterForm(); // Opens the global character form dialog
  };

  const handleLevelUpParty = () => {
    // Placeholder for future functionality
  };

  if (isCampaignLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading party data...</p>
      </div>
    );
  }

  const getItemsByType = (type: InventoryItem['type'] | 'all') => {
    if (type === 'all') return partyInventoryItems;
    return partyInventoryItems.filter(item => item.type === type);
  };

  return (
    <>
      <PageHeader
        title="Party Manager"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleAddCharacterClick} size="sm" variant="default">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Character
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" /> Party Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Party Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent focus:text-foreground">
                  <div className="flex items-center justify-between w-full">
                    <Label htmlFor="link-level-switch-dropdown" className="text-sm font-normal cursor-pointer">
                      Link Party Level
                    </Label>
                    <Switch
                      id="link-level-switch-dropdown"
                      checked={linkPartyLevel}
                      onCheckedChange={setLinkPartyLevel}
                      className="ml-auto"
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button onClick={handleLevelUpParty} variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto font-normal">
                    <Zap className="mr-2 h-4 w-4" /> Level Up Party
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column: Character Roster (now PartySheet) */}
      <div className="lg:col-span-2">
        {!activeCampaign ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Active Campaign</CardTitle>
              <CardDescription>Please select or create an active campaign to manage its party.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          // Render PartySheet directly here
          <PartySheet />
        )}
      </div>

      {/* Right Column: Party Inventory */}
      <div className="lg:col-span-3">
        <Card className="shadow-lg min-h-[calc(100vh-12rem)]"> {/* Adjust min-height as needed */}
          <CardHeader>
            <CardTitle className="flex items-center">
              <Backpack className="mr-2 h-5 w-5 text-primary" />
              Party Inventory
            </CardTitle>
            <CardDescription>Shared items and treasures of the party.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="weapons">Weapons</TabsTrigger>
                <TabsTrigger value="potions">Potions</TabsTrigger>
                {/* Add more tabs like Armor, Gear, Misc etc. */}
              </TabsList>
              <TabsContent value="all">
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <ul className="space-y-2 pr-2">
                    {getItemsByType('all').length > 0 ? getItemsByType('all').map(item => (
                      <li key={item.id} className="p-2 border rounded-md text-sm hover:bg-muted/50">
                        <span className="font-semibold">{item.name}</span> (x{item.quantity})
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </li>
                    )) : (
                      <div className="text-center text-muted-foreground py-8">
                        <ScrollText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p>No items in the party inventory yet.</p>
                      </div>
                    )}
                  </ul>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="weapons">
                 <ScrollArea className="h-[calc(100vh-20rem)]">
                  <ul className="space-y-2 pr-2">
                    {getItemsByType('weapon').length > 0 ? getItemsByType('weapon').map(item => (
                      <li key={item.id} className="p-2 border rounded-md text-sm hover:bg-muted/50">
                        <span className="font-semibold">{item.name}</span> (x{item.quantity})
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </li>
                    )) : (
                      <p className="text-center text-muted-foreground py-8">No weapons in inventory.</p>
                    )}
                  </ul>
                 </ScrollArea>
              </TabsContent>
              <TabsContent value="potions">
                 <ScrollArea className="h-[calc(100vh-20rem)]">
                  <ul className="space-y-2 pr-2">
                    {getItemsByType('potion').length > 0 ? getItemsByType('potion').map(item => (
                      <li key={item.id} className="p-2 border rounded-md text-sm hover:bg-muted/50">
                        <span className="font-semibold">{item.name}</span> (x{item.quantity})
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </li>
                    )) : (
                      <p className="text-center text-muted-foreground py-8">No potions in inventory.</p>
                    )}
                  </ul>
                 </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
