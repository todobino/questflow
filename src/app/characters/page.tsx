'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CharacterForm } from '@/components/character-creator/character-form';
import type { Character } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Brain, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCharacterName, GenerateCharacterNameInput } from '@/ai/flows/generate-character-name';
import { generateCharacterBackstory, GenerateCharacterBackstoryInput } from '@/ai/flows/generate-character-backstory';
import Image from 'next/image'; // For placeholder

export default function CharacterCreatorPage() {
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingBackstory, setIsGeneratingBackstory] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();

  const handleSaveCharacter = (data: Character) => {
    // Simulate saving character data
    console.log('Saving character:', data);
    setCharacter(data); // Update local state for display, real app would save to DB
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
        gender: 'Any', // Placeholder, could be part of form
        setting: 'Fantasy', // Placeholder
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
        setting: 'High Fantasy', // Placeholder
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
    // Placeholder for AI image generation logic
    // In a real app, this would call an AI service and set character.imageUrl
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    const placeholderImageUrl = `https://picsum.photos/seed/${character.name || 'char'}/400/400`;
    setCharacter(prev => ({ ...prev, imageUrl: placeholderImageUrl }));
    toast({ title: 'Image Generated!', description: 'A placeholder image has been assigned.' });
    setIsGeneratingImage(false);
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
              <Button onClick={handleGenerateName} disabled={isGeneratingName} className="w-full">
                <Wand2 className="mr-2 h-4 w-4" /> {isGeneratingName ? 'Generating...' : 'Generate Name'}
              </Button>
              <Button onClick={handleGenerateBackstory} disabled={isGeneratingBackstory || !character.name} className="w-full">
                <Brain className="mr-2 h-4 w-4" /> {isGeneratingBackstory ? 'Generating...' : 'Generate Backstory'}
              </Button>
              <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full">
                <ImageIcon className="mr-2 h-4 w-4" /> {isGeneratingImage ? 'Generating...' : 'Generate Image (Placeholder)'}
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
                  className="mx-auto mb-4 rounded-lg object-cover shadow-md"
                  data-ai-hint="character portrait"
                />
              ) : (
                <div className="mx-auto mb-4 flex h-[300px] w-[300px] items-center justify-center rounded-lg border-2 border-dashed bg-muted text-muted-foreground">
                  No Image
                </div>
              )}
              <h3 className="text-xl font-semibold">{character.name || 'Unnamed Character'}</h3>
              <p className="text-sm text-muted-foreground">{character.race || 'Race'} - {character.class || 'Class'}</p>
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
