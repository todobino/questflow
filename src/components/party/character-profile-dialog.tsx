
'use client';

import Image from 'next/image';
import type { Character } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Heart, Shield as ShieldIcon, Zap, BookOpen, UserCircle, Palette, Award, Puzzle, FileText, Sparkles, Loader2, Edit3, Target, ListChecks, Activity, TrendingUp } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <DialogTitle className="text-2xl sm:text-3xl">{character.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-grow">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Top Row: Image, Name/Level/Class/BG, EXP Bar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              <div className="w-full sm:w-1/3 md:w-1/4 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden shadow-md mx-auto max-w-xs sm:max-w-none">
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
                  size="sm"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGeneratingImage ? 'Generating...' : 'New Portrait'}
                </Button>
              </div>

              <div className="flex-grow space-y-3">
                <div className="space-y-0.5">
                  <p className="text-lg text-muted-foreground">
                    Lvl {character.level || 1} {character.race || 'N/A'} {character.class || 'N/A'}
                    {character.subclass ? ` (${character.subclass})` : ''}
                  </p>
                  {character.background && <p className="text-sm text-muted-foreground">Background: {character.background}</p>}
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-0.5 items-center">
                    <span className="flex items-center">
                      <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      EXP: {character.currentExp ?? '0'} / {character.nextLevelExp ?? '?'}
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

            <Separator />

            {/* Middle/Bottom Section: Stats, Goals/Backstory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Stat Box */}
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

              {/* Right Column: Goals, Backstory */}
              <div className="space-y-4">
                <div className="p-4 border rounded-lg shadow-sm bg-background/30">
                    <h3 className="text-lg font-semibold flex items-center mb-2"><Target className="mr-2 h-5 w-5 text-primary"/>Character Goals</h3>
                    <p className="text-sm text-muted-foreground italic">Goals and milestones tracking coming soon.</p>
                </div>
                
                <div className="p-4 border rounded-lg shadow-sm bg-background/30 flex-grow flex flex-col min-h-[200px]">
                  <h3 className="text-lg font-semibold flex items-center mb-2"><FileText className="h-5 w-5 mr-2 text-primary" />Backstory</h3>
                  <ScrollArea className="flex-1 max-h-48 sm:max-h-64"> {/* Adjusted max-h */}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pr-2">
                      {character.backstory || 'No backstory provided.'}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-auto p-4 sm:p-6 border-t">
          <Button variant="outline" onClick={() => onEditCharacter(character)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

