
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent as CharacterFormDialogContent } from '@/components/ui/dialog'; // Renamed to avoid conflict
import { CharacterForm } from '@/components/character-creator/character-form';
import { CharacterProfileDialog } from '@/components/party/character-profile-dialog'; // New component
import type { Character } from '@/lib/types';
import { useCampaignContext } from '@/contexts/campaign-context';
import { PlusCircle, Users, Zap, Settings2, Edit3, Trash2, Loader2, Heart, Shield as ShieldIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateRandomCharacter } from '@/ai/flows/generate-random-character';
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


interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
  onViewProfile: (character: Character) => void;
}

function CharacterCard({ character, onEdit, onDelete, onViewProfile }: CharacterCardProps) {
  return (
    <Card 
      className="group relative flex flex-row overflow-hidden rounded-lg shadow-lg transition-shadow hover:shadow-xl h-auto min-h-[144px] cursor-pointer"
      onClick={() => onViewProfile(character)}
    >
      {/* Image on the left */}
      <div className="w-32 flex-shrink-0 h-full bg-muted relative">
        <Image
          src={character.imageUrl || `https://placehold.co/128x160.png`} // Adjusted placeholder size for potentially taller card
          alt={character.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={`${character.race || ''} ${character.class || ''} portrait`}
        />
      </div>
      {/* Content on the right */}
      <div className="flex-grow flex flex-col p-3 overflow-hidden">
        <CardTitle className="text-lg mb-0.5 truncate">{character.name}</CardTitle>
        <CardDescription className="text-xs mb-1 truncate">
          Lvl {character.level || 1} {character.race || 'N/A'} {character.class || 'N/A'}
          {character.subclass ? ` (${character.subclass})` : ''}
        </CardDescription>
        
        <div className="mt-1.5 space-y-1 text-xs">
          <div className="flex items-center">
            <Heart className="h-3.5 w-3.5 mr-1.5 text-red-500 flex-shrink-0" />
            <span>HP: {character.currentHp ?? 'N/A'} / {character.maxHp ?? 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <ShieldIcon className="h-3.5 w-3.5 mr-1.5 text-sky-600 flex-shrink-0" />
            <span>AC: {character.armorClass ?? 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Zap className="h-3.5 w-3.5 mr-1.5 text-yellow-500 flex-shrink-0" />
            <span>Init: {character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}`: character.initiativeModifier) : 'N/A'}</span>
          </div>
        </div>

        {character.backstory && (
          <p className="line-clamp-2 text-xs text-muted-foreground mt-2 flex-grow">{character.backstory}</p>
        )}
      </div>
      {/* Edit/Delete buttons remain absolutely positioned relative to the card */}
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
  const { activeCampaign, characters, addCharacter, updateCharacter, deleteCharacter: deleteCharacterFromContext, isLoading: isCampaignLoading } = useCampaignContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Partial<Character> | null>(null);
  const [linkPartyLevel, setLinkPartyLevel] = useState(true);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizedData, setRandomizedData] = useState<Partial<Character>>({});
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCharacterForProfile, setSelectedCharacterForProfile] = useState<Character | null>(null);


  const { toast } = useToast();

  const partyMembers = characters.filter(char => char.campaignId === activeCampaign?.id);

  const handleAddCharacterClick = () => {
    setEditingCharacter(null);
    setRandomizedData({}); 
    setIsFormOpen(true);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setRandomizedData({}); 
    setIsFormOpen(true);
  };

  const handleDeleteCharacter = (characterId: string) => {
    deleteCharacterFromContext(characterId);
  };
  
  const handleSaveCharacter = (characterData: Omit<Character, 'id' | 'campaignId'>) => {
    if (editingCharacter && editingCharacter.id) {
      updateCharacter({ ...characterData, id: editingCharacter.id, campaignId: activeCampaign!.id });
    } else {
      addCharacter(characterData);
    }
    setIsFormOpen(false);
    setEditingCharacter(null);
    setRandomizedData({});
  };

  const handleRandomizeCharacter = async () => {
    setIsRandomizing(true);
    setRandomizedData({}); 
    try {
      const result = await generateRandomCharacter();
      const newCharacterData: Partial<Character> = {
        name: result.characterClass || result.race || 'Random Hero', 
        race: result.race,
        class: result.characterClass,
        subclass: result.subclass,
        background: result.background,
        backstory: result.backstory,
        imageUrl: result.imageUrl,
        level: 1, 
        currentHp: 10, // Default for random
        maxHp: 10,     // Default for random
        armorClass: 10, // Default for random
        initiativeModifier: 0, // Default for random
      };
      setRandomizedData(newCharacterData); 
      
      if (isFormOpen && !editingCharacter?.id) {
         setEditingCharacter(prev => ({ ...prev, ...newCharacterData }));
      }

      toast({ title: 'Character Randomized!', description: `A new ${result.race} ${result.characterClass} has been conceptualized.` });
    } catch (error) {
      console.error('Error randomizing character:', error);
      toast({ title: 'Randomization Failed', description: (error as Error).message || 'Could not randomize character.', variant: 'destructive' });
    }
    setIsRandomizing(false);
  };
  
  const handleLevelUpParty = () => {
    // Placeholder functionality
    toast({ title: 'Level Up!', description: 'Party level up functionality coming soon!' });
  };

  const handleViewProfile = (character: Character) => {
    setSelectedCharacterForProfile(character);
    setIsProfileOpen(true);
  };

  if (isCampaignLoading) {
    return (
      <PageHeader title="Party Manager">
        <div className="text-center py-12">Loading party data...</div>
      </PageHeader>
    );
  }

  if (!activeCampaign) {
    return (
      <PageHeader title="Party Manager">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Active Campaign</CardTitle>
            <CardDescription>Please select or create an active campaign to manage its party.</CardDescription>
          </CardHeader>
        </Card>
      </PageHeader>
    );
  }
  

  return (
    <>
      <PageHeader
        title="Party Manager"
        description={`Manage the heroes of "${activeCampaign?.name || 'your campaign'}"`}
        actions={
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="link-level-switch"
                checked={linkPartyLevel}
                onCheckedChange={setLinkPartyLevel}
              />
              <Label htmlFor="link-level-switch" className="text-sm">Link Party Level</Label>
            </div>
            <Button onClick={handleLevelUpParty} variant="outline" size="sm">
              <Zap className="mr-2 h-4 w-4" /> Level Up Party
            </Button>
          </div>
        }
      />

      {partyMembers.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2"> 
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
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center shadow-none transition-all hover:border-primary hover:bg-muted min-h-[144px] cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCharacterClick()}
          >
            <PlusCircle className="mb-2 h-10 w-10 text-muted-foreground group-hover:text-primary" />
            <p className="font-semibold text-muted-foreground group-hover:text-primary">Add New Character</p>
          </Card>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingCharacter(null); 
          setRandomizedData({});
        }
      }}>
        {/* DialogContent for CharacterForm is now part of CharacterForm component itself */}
        <CharacterForm
          isDialog={true}
          currentCharacter={editingCharacter || randomizedData} 
          onSave={handleSaveCharacter}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCharacter(null);
            setRandomizedData({});
          }}
          onRandomize={handleRandomizeCharacter}
          isRandomizing={isRandomizing}
        />
      </Dialog>

      {selectedCharacterForProfile && (
        <CharacterProfileDialog
          character={selectedCharacterForProfile}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}

