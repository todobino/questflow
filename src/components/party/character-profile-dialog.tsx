
'use client';

import Image from 'next/image';
import type { Character } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Heart, Shield as ShieldIcon, Zap, BookOpen, UserCircle, Palette, Award, Puzzle, FileText, Sparkles, Loader2, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCampaignContext } from '@/contexts/campaign-context';
import { generateCharacterImage } from '@/ai/flows/generate-character-image';

interface CharacterProfileDialogProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onEditCharacter: (character: Character) => void;
}

export function CharacterProfileDialog({ character, isOpen, onClose, onEditCharacter }: CharacterProfileDialogProps) {
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

  const StatDisplay = ({ icon: Icon, label, value, iconClassName }: { icon: React.ElementType, label: string, value: string | number | undefined | null, iconClassName?: string }) => (
    <div className="flex items-center text-sm">
      <Icon className={cn("h-4 w-4 mr-2 text-muted-foreground", iconClassName)} />
      <span className="font-medium text-muted-foreground mr-1">{label}:</span>
      <span className="text-foreground">{value ?? 'N/A'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col"> {/* Increased max-width for two columns */}
        {/* DialogHeader can remain for the main title if desired, or title can be part of the content */}
        <DialogHeader>
          <DialogTitle className="text-2xl text-center md:text-left">{character.name}</DialogTitle>
          {/* DialogDescription can be removed if its content is moved */}
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-2 -mr-2 md:pr-6 md:-mr-6">
          <div className="flex flex-col md:flex-row gap-6 py-4">
            {/* Left Column: Image & New Portrait Button */}
            <div className="w-full md:w-1/3 md:flex-shrink-0 space-y-3">
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
                    key={character.imageUrl} 
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

            {/* Right Column: Level/Race/Class, Stats, Backstory, Details */}
            <div className="flex-grow space-y-4">
              <div>
                <p className="text-lg text-muted-foreground">
                  Lvl {character.level || 1} {character.race || 'N/A'} {character.class || 'N/A'}
                  {character.subclass ? ` (${character.subclass})` : ''}
                  {character.background ? ` - ${character.background}` : ''}
                </p>
              </div>
              
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-3 border rounded-lg shadow-sm bg-background/50">
                <StatDisplay icon={Heart} label="HP" value={`${character.currentHp ?? '?'}/${character.maxHp ?? '?'}`} iconClassName="text-red-500" />
                <StatDisplay icon={ShieldIcon} label="AC" value={character.armorClass} iconClassName="text-sky-600"/>
                <StatDisplay icon={Zap} label="Initiative" value={character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}`: character.initiativeModifier) : 'N/A'} iconClassName="text-yellow-500" />
                <StatDisplay icon={Award} label="Level" value={character.level} iconClassName="text-amber-500"/>
                 <StatDisplay icon={Award} label="Experience" value={`${character.currentExp ?? '0'} / ${character.nextLevelExp ?? '?'}`} iconClassName="text-amber-600"/>

              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold text-md flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" />Backstory</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {character.backstory || 'No backstory provided.'}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <h4 className="font-semibold text-md flex items-center"><Puzzle className="h-5 w-5 mr-2 text-primary" />Further Details</h4>
                <StatDisplay icon={UserCircle} label="Race" value={character.race} />
                <StatDisplay icon={BookOpen} label="Class" value={character.class} />
                {character.subclass && <StatDisplay icon={Palette} label="Subclass" value={character.subclass} />}
                {character.background && <StatDisplay icon={UserCircle} label="Background" value={character.background} />}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onEditCharacter(character)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
