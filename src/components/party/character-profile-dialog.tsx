
'use client';

import Image from 'next/image';
import type { Character } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Heart, Shield as ShieldIcon, Zap, BookOpen, UserCircle, Palette, Award, Puzzle, FileText, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCampaignContext } from '@/contexts/campaign-context';
import { generateCharacterImage } from '@/ai/flows/generate-character-image';

interface CharacterProfileDialogProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterProfileDialog({ character, isOpen, onClose }: CharacterProfileDialogProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();
  const { updateCharacter } = useCampaignContext();

  if (!character) {
    return null;
  }

  const handleGenerateNewPortrait = async () => {
    if (!character) return;
    setIsGeneratingImage(true);
    try {
      const result = await generateCharacterImage({
        name: character.name,
        race: character.race,
        characterClass: character.class,
        subclass: character.subclass,
        background: character.background,
        backstory: character.backstory,
      });
      
      // Update the character in the context with the new image URL
      const updatedChar = { ...character, imageUrl: result.imageUrl };
      updateCharacter(updatedChar);

      toast({
        title: 'Portrait Generated!',
        description: 'The new character portrait has been generated and saved.',
      });
    } catch (error) {
      console.error('Error generating portrait:', error);
      toast({
        title: 'Portrait Generation Failed',
        description: (error as Error).message || 'Could not generate a new portrait. Please try again.',
        variant: 'destructive',
      });
    }
    setIsGeneratingImage(false);
  };


  const StatDisplay = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined | null }) => (
    <div className="flex items-center text-sm">
      <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
      <span className="font-medium text-muted-foreground mr-1">{label}:</span>
      <span className="text-foreground">{value ?? 'N/A'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{character.name}</DialogTitle>
          <DialogDescription>
            Lvl {character.level || 1} {character.race || 'N/A'} {character.class || 'N/A'}
            {character.subclass ? ` (${character.subclass})` : ''}
            {character.background ? ` - ${character.background}` : ''}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="md:col-span-1 space-y-3">
              <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden shadow-md mx-auto md:mx-0 max-w-xs">
                {isGeneratingImage && !character.imageUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : (
                  <Image
                    src={character.imageUrl || 'https://placehold.co/400x400.png'}
                    alt={character.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={`${character.race || ''} ${character.class || ''} portrait`}
                    key={character.imageUrl} // Add key to force re-render on image change
                  />
                )}
              </div>
              <Button 
                onClick={handleGenerateNewPortrait} 
                disabled={isGeneratingImage}
                className="w-full"
                variant="outline"
              >
                {isGeneratingImage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGeneratingImage ? 'Generating...' : 'New Portrait'}
              </Button>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 border rounded-lg shadow-sm">
                <StatDisplay icon={Heart} label="HP" value={`${character.currentHp ?? '?'}/${character.maxHp ?? '?'}`} />
                <StatDisplay icon={ShieldIcon} label="AC" value={character.armorClass} />
                <StatDisplay icon={Zap} label="Initiative" value={character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}`: character.initiativeModifier) : 'N/A'} />
                <StatDisplay icon={Award} label="Level" value={character.level} />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-semibold text-md flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" />Backstory</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {character.backstory || 'No backstory provided.'}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <h4 className="font-semibold text-md flex items-center"><Puzzle className="h-5 w-5 mr-2 text-primary" />Details</h4>
                  <StatDisplay icon={UserCircle} label="Race" value={character.race} />
                  <StatDisplay icon={BookOpen} label="Class" value={character.class} />
                  {character.subclass && <StatDisplay icon={Palette} label="Subclass" value={character.subclass} />}
                  {character.background && <StatDisplay icon={Puzzle} label="Background" value={character.background} />}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
