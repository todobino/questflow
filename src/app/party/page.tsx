
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CharacterForm } from '@/components/character-creator/character-form';
import type { Character } from '@/lib/types';
import { useCampaignContext } from '@/contexts/campaign-context';
import { PlusCircle, Users, Zap, Settings2, Edit3, Trash2, Loader2 } from 'lucide-react';
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
  AlertDialogTrigger, // Added AlertDialogTrigger here
} from "@/components/ui/alert-dialog";


interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
}

function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-lg shadow-lg transition-shadow hover:shadow-xl">
      <div className="aspect-square w-full bg-muted">
        <Image
          src={character.imageUrl || `https://placehold.co/300x300.png`}
          alt={character.name}
          width={300}
          height={300}
          className="h-full w-full object-cover"
          data-ai-hint={`${character.race || ''} ${character.class || ''} portrait`}
        />
      </div>
      <CardContent className="flex-grow p-3">
        <CardTitle className="text-lg">{character.name}</CardTitle>
        <CardDescription className="text-xs">
          Lvl {character.level || 1} {character.race || 'N/A'} {character.class || 'N/A'}
          {character.subclass ? ` (${character.subclass})` : ''}
        </CardDescription>
        {character.backstory && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{character.backstory}</p>
        )}
      </CardContent>
      <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onEdit(character)}>
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-7 w-7">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {character.name}?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(character.id)}>Delete</AlertDialogAction>
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


  const { toast } = useToast();

  const partyMembers = characters.filter(char => char.campaignId === activeCampaign?.id);

  const handleAddCharacterClick = () => {
    setEditingCharacter(null);
    setRandomizedData({}); // Clear any previous randomized data
    setIsFormOpen(true);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setRandomizedData({}); // Clear randomized data when editing
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
    setRandomizedData({}); // Clear previous randomized data
    try {
      const result = await generateRandomCharacter();
      // We don't directly set the form's character state here.
      // Instead, we pass this data to the form when it opens or is already open.
      const newCharacterData = {
        name: result.characterClass || result.race || 'Random Hero', // Provide a default name
        race: result.race,
        class: result.characterClass,
        subclass: result.subclass,
        background: result.background,
        backstory: result.backstory,
        imageUrl: result.imageUrl,
        level: 1, // Default level for new random characters
      };
      setRandomizedData(newCharacterData); // Store for the form
      
      // If form is already open for a *new* character, update its values
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {partyMembers.map((character) => (
            <CharacterCard key={character.id} character={character} onEdit={handleEditCharacter} onDelete={handleDeleteCharacter} />
          ))}
          <Card 
            onClick={handleAddCharacterClick}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center shadow-none transition-all hover:border-primary hover:bg-muted min-h-[300px]"
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
          setEditingCharacter(null); // Clear editing state when dialog closes
          setRandomizedData({});
        }
      }}>
        <CharacterForm
          isDialog={true}
          currentCharacter={editingCharacter || randomizedData} // Pass randomized data if available for new char
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
    </>
  );
}
