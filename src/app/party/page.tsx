
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Character, InventoryItem } from '@/lib/types';
import { useCampaignContext } from '@/contexts/campaign-context';
import { PlusCircle, Users, Zap, Settings2, Edit3, Trash2, Loader2, Heart, Shield as ShieldIcon, Award, Backpack, ScrollText } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
  onViewProfile: (character: Character) => void;
}

function CharacterCard({ character, onEdit, onDelete, onViewProfile }: CharacterCardProps) {
  return (
    <Card
      className="group relative flex flex-row overflow-hidden rounded-lg shadow-lg transition-colors hover:border-primary cursor-pointer h-32"
      onClick={() => onViewProfile(character)}
    >
      <div className="w-32 h-32 flex-shrink-0 bg-muted relative"> {/* Square image container */}
        <Image
          src={character.imageUrl || `https://placehold.co/128x128.png`}
          alt={character.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={`${character.race || ''} ${character.class || ''} portrait`}
        />
      </div>
      <div className="flex-grow flex flex-col p-3 overflow-hidden">
        <CardTitle className="text-lg mb-0.5 truncate">{character.name}</CardTitle>
        <CardDescription className="text-xs mb-1 truncate">
          Lvl {character.level || 1} {character.race || 'N/A'} {character.class || 'N/A'}
          {character.subclass ? ` (${character.subclass})` : ''}
        </CardDescription>

        <div className="mt-1.5 grid grid-cols-2 gap-x-2 text-xs flex-grow">
          {/* Left Column */}
          <div className="space-y-1">
            <div className="flex items-center"> {/* AC */}
              <ShieldIcon className="h-3.5 w-3.5 mr-1.5 text-sky-600 flex-shrink-0" />
              <span>AC: {character.armorClass ?? 'N/A'}</span>
            </div>
             <div className="flex items-center"> {/* Init */}
              <Zap className="h-3.5 w-3.5 mr-1.5 text-yellow-500 flex-shrink-0" />
              <span>Init: {character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}`: character.initiativeModifier) : 'N/A'}</span>
            </div>
          </div>
          {/* Right Column */}
          <div className="space-y-1">
            <div className="flex items-center"> {/* HP */}
              <Heart className="h-3.5 w-3.5 mr-1.5 text-red-500 flex-shrink-0" />
              <span>HP: {character.currentHp ?? 'N/A'} / {character.maxHp ?? 'N/A'}</span>
            </div>
            <div className="flex items-center"> {/* EXP */}
              <Award className="h-3.5 w-3.5 mr-1.5 text-amber-500 flex-shrink-0" />
              <span>EXP: {character.currentExp ?? 'N/A'} / {character.nextLevelExp ?? 'N/A'}</span>
            </div>
          </div>
        </div>

      </div>
      <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(character); }}>
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {character.name}?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(character.id);}}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}


export default function PartyManagerPage() {
  const {
    activeCampaign,
    characters,
    deleteCharacter: deleteCharacterFromContext,
    isLoading: isCampaignLoading,
    openProfileDialog,
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


  const partyMembers = characters.filter(char => char.campaignId === activeCampaign?.id);

  const handleAddCharacterClick = () => {
    openCharacterForm();
  };

  const handleEditCharacter = (character: Character) => {
    openCharacterForm(character);
  };

  const handleDeleteCharacter = (characterId: string) => {
    deleteCharacterFromContext(characterId);
  };

  const handleLevelUpParty = () => {
    // Placeholder for future functionality
  };

  const handleViewProfile = (character: Character) => {
    openProfileDialog(character);
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
        }
      />
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column: Character Roster */}
      <div className="lg:col-span-2">
        {!activeCampaign ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Active Campaign</CardTitle>
              <CardDescription>Please select or create an active campaign to manage its party.</CardDescription>
            </CardHeader>
          </Card>
        ) : partyMembers.length === 0 ? (
          <Card className="text-center py-12 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>Party is Empty</CardTitle>
              <CardDescription className="mb-4">No characters in this party yet. Add your first hero!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAddCharacterClick} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Add First Character
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {partyMembers.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={handleEditCharacter}
                onDelete={handleDeleteCharacter}
                onViewProfile={handleViewProfile}
              />
            ))}
            <Card
              onClick={handleAddCharacterClick}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center shadow-none transition-all hover:border-primary hover:bg-muted h-32 cursor-pointer group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCharacterClick()}
            >
              <PlusCircle className="mb-2 h-10 w-10 text-muted-foreground group-hover:text-primary" />
              <p className="font-semibold text-muted-foreground group-hover:text-primary">Add New Character</p>
            </Card>
          </div>
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
