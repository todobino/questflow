'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CharacterForm } from '@/components/character-creator/character-form';
import type { Character } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Brain, ImageIcon, Shuffle, Loader2 } from 'lucide-react'; // Added Shuffle, Loader2
import { useToast } from '@/hooks/use-toast';
import { generateCharacterName, GenerateCharacterNameInput } from '@/ai/flows/generate-character-name';
import { generateCharacterBackstory, GenerateCharacterBackstoryInput } from '@/ai/flows/generate-character-backstory';
import { generateRandomCharacter } from '@/ai/flows/generate-random-character'; // Added
import Image from 'next/image';

export default function CharacterCreatorPage() {
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingBackstory, setIsGeneratingBackstory] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false); // Added
  const { toast } = useToast();

  const handleSaveCharacter = (data: Character) => {
    console.log('Saving character:', data);
    setCharacter(data); 
    toast({
      title: 'Character Saved',
      description: `${data.name} has been saved.`,
    });
  };

  const handleGenerateName = async () => {
    setIsGeneratingName(true);
    try {
      const input: GenerateCharacterNameInput = {
        race: character.race || 'Human',
        gender: 'Any', 
        setting: 'Fantasy',
      };
      const result = await generateCharacterName(input);
      setCharacter(prev => ({ ...prev, name: result.name }));
      toast({ title: 'Name Generated!', description: `Suggested name: ${result.name}` });
    } catch (error) {
      console.error('Error generating name:', error);
      toast({ title: 'Error', description: 'Could not generate name.', variant: 'destructive' });
    }
    setIsGeneratingName(false);
  };

  const handleGenerateBackstory = async () => {
    if (!character.name) {
      toast({ title: 'Missing Name', description: 'Please provide a character name first.', variant: 'destructive'});
      return;
    }
    setIsGeneratingBackstory(true);
    try {
      const input: GenerateCharacterBackstoryInput = {
        characterName: character.name || 'Unnamed Hero',
        characterRace: character.race || 'Human',
        characterClass: character.class || 'Adventurer',
        setting: 'High Fantasy',
      };
      const result = await generateCharacterBackstory(input);
      setCharacter(prev => ({ ...prev, backstory: result.backstory }));
      toast({ title: 'Backstory Generated!', description: 'A new backstory has been created.' });
    } catch (error) {
      console.error('Error generating backstory:', error);
      toast({ title: 'Error', description: 'Could not generate backstory.', variant: 'destructive' });
    }
    setIsGeneratingBackstory(false);
  };
  
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    const imageName = character.name || character.race || 'character';
    const placeholderImageUrl = `https://placehold.co/400x400.png?text=${encodeURIComponent(imageName)}`;
    setCharacter(prev => ({ ...prev, imageUrl: placeholderImageUrl }));
    toast({ title: 'Image Generated!', description: 'A placeholder image has been assigned.' });
    setIsGeneratingImage(false);
  };

  const handleRandomizeCharacter = async () => {
    setIsGeneratingRandom(true);
    try {
      const result = await generateRandomCharacter();
      setCharacter({
        name: result.characterClass, // Default name to class if none exists, can be refined
        race: result.race,
        class: result.characterClass,
        subclass: result.subclass,
        background: result.background,
        backstory: result.backstory,
        imageUrl: result.imageUrl,
      });
      toast({ title: 'Character Randomized!', description: `A new ${result.race} ${result.characterClass} has been conceptualized.` });
    } catch (error) {
      console.error('Error randomizing character:', error);
      toast({ title: 'Randomization Failed', description: (error as Error).message || 'Could not randomize character.', variant: 'destructive' });
    }
    setIsGeneratingRandom(false);
  };

  return (
    <>
      <PageHeader
        title="Character Creator"
        description="Craft your unique characters. Use AI tools to spark inspiration for names, backstories, and visuals."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CharacterForm currentCharacter={character} onSave={handleSaveCharacter} />
        </div>
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Enhance your character with AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button onClick={handleRandomizeCharacter} disabled={isGeneratingRandom} className="w-full">
                {isGeneratingRandom ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
                {isGeneratingRandom ? 'Randomizing...' : 'Randomize Character'}
              </Button>
              <Button onClick={handleGenerateName} disabled={isGeneratingName} className="w-full">
                 {isGeneratingName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                 {isGeneratingName ? 'Generating...' : 'Generate Name'}
              </Button>
              <Button onClick={handleGenerateBackstory} disabled={isGeneratingBackstory || !character.name} className="w-full">
                {isGeneratingBackstory ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                {isGeneratingBackstory ? 'Generating...' : 'Generate Backstory'}
              </Button>
              <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full">
                {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                {isGeneratingImage ? 'Generating...' : 'Generate Image (Placeholder)'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Character Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {character.imageUrl ? (
                <Image 
                  src={character.imageUrl} 
                  alt={character.name || 'Character image'} 
                  width={300} 
                  height={300} 
                  className="mx-auto mb-4 rounded-lg object-cover shadow-md aspect-square"
                  data-ai-hint="character portrait"
                />
              ) : (
                <div className="mx-auto mb-4 flex h-[300px] w-[300px] items-center justify-center rounded-lg border-2 border-dashed bg-muted text-muted-foreground aspect-square">
                  No Image
                </div>
              )}
              <h3 className="text-xl font-semibold">{character.name || 'Unnamed Character'}</h3>
              <p className="text-sm text-muted-foreground">
                {character.race || 'Race'} - {character.class || 'Class'} {character.subclass ? `(${character.subclass})` : ''}
              </p>
              {character.background && <p className="text-xs text-muted-foreground">Background: {character.background}</p>}
              {character.backstory && (
                <div className="mt-4 max-h-40 overflow-y-auto rounded border p-2 text-xs">
                  <h4 className="font-medium mb-1">Backstory:</h4>
                  <p className="whitespace-pre-wrap">{character.backstory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
