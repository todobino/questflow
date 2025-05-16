
'use client';

import Image from 'next/image';
import type { Character } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Heart, Shield as ShieldIcon, Zap, Puzzle, FileText, Sparkles, Loader2, Edit3, Target, ListChecks, Activity, Swords, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCampaignContext } from '@/contexts/campaign-context';
import { generateCharacterImage } from '@/ai/flows/generate-character-image';
import { cn } from '@/lib/utils';

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

  const StatDisplay = ({ icon: Icon, label, value, iconClassName, valueClassName }: { icon?: React.ElementType; label: string; value: string | number | undefined | null; iconClassName?: string; valueClassName?: string }) => (
    <div className="flex items-center text-sm">
      {Icon && <Icon className={cn("h-4 w-4 mr-1.5 text-muted-foreground", iconClassName)} />}
      <span className="font-medium text-muted-foreground mr-1">{label}:</span>
      <span className={cn("text-foreground", valueClassName)}>{value ?? 'N/A'}</span>
    </div>
  );
  
  const expPercentage = (character.nextLevelExp && character.nextLevelExp > 0 && character.currentExp !== undefined)
  ? (character.currentExp / character.nextLevelExp) * 100
  : 0;

  const imageSizeClasses = "w-28 h-28"; 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            {/* Left Group: Image + Info */}
            <div className="flex items-start gap-4 sm:gap-6 flex-1">
              <div className={cn("flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-muted", imageSizeClasses)}>
                {isGeneratingImage && !character.imageUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : (
                  <Image
                    src={character.imageUrl || 'https://placehold.co/128x128.png'}
                    alt={character.name}
                    width={112} 
                    height={112} 
                    className="object-cover w-full h-full"
                    data-ai-hint={`${character.race || ''} ${character.class || ''} portrait`}
                    key={character.imageUrl} 
                  />
                )}
              </div>

              <div className="flex-1 flex flex-col space-y-1">
                <DialogTitle className="text-2xl sm:text-3xl text-left">{character.name}</DialogTitle>
                <div className="text-md text-muted-foreground text-left flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="inline-flex items-center">
                        <Swords className="mr-1.5 h-4 w-4 text-muted-foreground" />
                        Lvl {character.level || 1} {character.race || 'N/A'} {character.class || 'N/A'}
                        {character.subclass ? ` (${character.subclass})` : ''}
                    </span>
                    {character.background && (
                        <span className="inline-flex items-center">
                            <Puzzle className="mr-1.5 h-4 w-4 text-muted-foreground" />
                            {character.background}
                        </span>
                    )}
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-0.5 items-center">
                    <span className="flex items-center">
                      <strong className="mr-1">XP:</strong> 
                      <span className="text-foreground">{character.currentExp ?? '0'} / {character.nextLevelExp ?? '?'}</span>
                    </span>
                    {character.nextLevelExp && character.nextLevelExp > 0 && character.currentExp !== undefined && (
                        <span>{Math.round(expPercentage)}%</span>
                    )}
                  </div>
                  {character.nextLevelExp && character.nextLevelExp > 0 && character.currentExp !== undefined && (
                      <Progress value={expPercentage} className="h-2" />
                  )}
                </div>
              </div>
            </div>

            {/* Right Element: New Portrait Button */}
            <div className="flex-shrink-0">
              <Button 
                onClick={handleGenerateNewPortrait} 
                disabled={isGeneratingImage}
                variant="outline"
                size="sm"
              >
                {isGeneratingImage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                New Portrait
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow min-h-0">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-background/30">
                <h3 className="text-lg font-semibold flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Combat Stats</h3>
                <div className="space-y-1.5">
                  <StatDisplay icon={Heart} label="HP" value={`${character.currentHp ?? '?'}/${character.maxHp ?? '?'}`} iconClassName="text-red-500" />
                  <StatDisplay icon={ShieldIcon} label="AC" value={character.armorClass} iconClassName="text-sky-600"/>
                  <StatDisplay icon={Zap} label="Initiative" value={character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}`: character.initiativeModifier) : 'N/A'} iconClassName="text-yellow-500" />
                </div>
                <Separator />
                 <h3 className="text-md font-semibold flex items-center mt-3"><Puzzle className="mr-2 h-5 w-5 text-primary"/>Ability Scores</h3>
                 <p className="text-sm text-muted-foreground italic">Ability scores display coming soon.</p>
                <Separator />
                 <h3 className="text-md font-semibold flex items-center mt-3"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Feats & Features</h3>
                 <p className="text-sm text-muted-foreground italic">Feats and features tracking coming soon.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg shadow-sm bg-background/30">
                    <h3 className="text-lg font-semibold flex items-center mb-2"><Target className="mr-2 h-5 w-5 text-primary"/>Character Goals</h3>
                    <p className="text-sm text-muted-foreground italic">Goals and milestones tracking coming soon.</p>
                </div>
                
                <div className="p-4 border rounded-lg shadow-sm bg-background/30 flex-grow flex flex-col min-h-[200px]">
                  <h3 className="text-lg font-semibold flex items-center mb-2"><FileText className="h-5 w-5 mr-2 text-primary" />Backstory</h3>
                  <ScrollArea className="flex-1 max-h-48 sm:max-h-64 min-h-0"> 
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pr-2">
                      {character.backstory || 'No backstory provided.'}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-auto px-4 py-2 sm:px-6 sm:py-3 border-t">
          <Button variant="outline" onClick={() => onEditCharacter(character)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

