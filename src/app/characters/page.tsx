
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CharacterForm } from '@/components/character-creator/character-form';
import type { Character } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';
import { generateRandomCharacter } from '@/ai/flows/generate-random-character'; 
import Image from 'next/image';

export default function CharacterCreatorPage() {
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false); 
  const { toast } = useToast();

  const handleSaveCharacter = (data: Character) => {
    console.log('Saving character:', data);
    setCharacter(data); 
    toast({
      title: 'Character Saved',
      description: `${data.name} has been saved.`,
    });
  };

  const handleRandomizeCharacter = async () => {
    setIsGeneratingRandom(true);
    try {
      const result = await generateRandomCharacter();
      setCharacter({
        // Preserve existing name if user typed one, otherwise use class or race
        name: character.name || result.characterClass || result.race,
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
        description="Craft your unique characters. Use AI tools to spark inspiration."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CharacterForm 
            currentCharacter={character} 
            onSave={handleSaveCharacter}
            onRandomize={handleRandomizeCharacter}
            isRandomizing={isGeneratingRandom}
          />
        </div>
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Character Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {isGeneratingRandom && !character.imageUrl ? (
                <div className="mx-auto mb-4 flex h-[300px] w-[300px] items-center justify-center rounded-lg border-2 border-dashed bg-muted text-muted-foreground aspect-square">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   <p className="ml-2">Generating...</p>
                </div>
              ) : character.imageUrl ? (
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
