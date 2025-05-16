
'use client';

import Image from 'next/image';
import type { Character } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Heart, Shield as ShieldIcon, Zap, Puzzle, FileText, Sparkles, Loader2, Edit3, Target, ListChecks, Activity, Swords, VenetianMask, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCampaignContext } from '@/contexts/campaign-context';
// import { generateCharacterImage } from '@/ai/flows/generate-character-image'; // Commented out as New Portrait button was removed
import { cn } from '@/lib/utils';

interface CharacterProfileDialogProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onEditCharacter: (character: Character) => void;
}

export function CharacterProfileDialog({ character, isOpen, onClose, onEditCharacter }: CharacterProfileDialogProps) {
  // const [isGeneratingImage, setIsGeneratingImage] = useState(false); // State for New Portrait button
  // const { toast } = useToast(); // For New Portrait button
  // const { updateCharacter } = useCampaignContext(); // For New Portrait button

  if (!character) {
    return null;
  }

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

  const imageSizeClasses = "w-24 h-24";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            {/* Left Group: Image + Primary Info */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={cn("flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-muted", imageSizeClasses)}>
                  <Image
                    src={character.imageUrl || 'https://placehold.co/96x96.png'}
                    alt={character.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    data-ai-hint={`${character.race || ''} ${character.class || ''} portrait`}
                    key={character.imageUrl} 
                  />
              </div>

              <div className="flex-1 flex flex-col space-y-0.5 pt-1">
                <DialogTitle className="text-xl sm:text-2xl text-left">{character.name}</DialogTitle>
                <div className="text-xs text-muted-foreground text-left flex flex-wrap items-center gap-x-3 gap-y-0.5">
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
                <div className="pt-0.5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-0.5 items-center">
                    <span className="flex items-center">
                      <strong className="mr-1 text-sm">XP:</strong> 
                      <span className="text-foreground text-sm">{character.currentExp ?? '0'} / {character.nextLevelExp ?? '?'}</span>
                    </span>
                    {character.nextLevelExp && character.nextLevelExp > 0 && character.currentExp !== undefined && (
                        <span className="text-sm">{Math.round(expPercentage)}%</span>
                    )}
                  </div>
                  {character.nextLevelExp && character.nextLevelExp > 0 && character.currentExp !== undefined && (
                      <Progress value={expPercentage} className="h-1.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: HP, AC, Initiative */}
            <div className="flex-shrink-0 flex flex-col space-y-1.5 items-start sm:items-end pt-1 pr-2">
                 <StatDisplay icon={Heart} label="HP" value={`${character.currentHp ?? '?'}/${character.maxHp ?? '?'}`} iconClassName="text-red-500" />
                 <StatDisplay icon={ShieldIcon} label="AC" value={character.armorClass} iconClassName="text-sky-600"/>
                 <StatDisplay icon={Zap} label="Init" value={character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}`: character.initiativeModifier) : 'N/A'} iconClassName="text-yellow-500" />
            </div>


            {/* Right Element: Edit Button */}
            <div className="flex-shrink-0">
               <Button 
                onClick={() => onEditCharacter(character)}
                variant="outline"
                size="sm"
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow min-h-0">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column in Scroll Area: Ability Scores, Feats */}
              <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-background/30">
                 <h3 className="text-md font-semibold flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Ability Scores</h3>
                 <p className="text-sm text-muted-foreground italic">Ability scores display coming soon.</p>
                <Separator />
                 <h3 className="text-md font-semibold flex items-center mt-3"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Feats & Features</h3>
                 <p className="text-sm text-muted-foreground italic">Feats and features tracking coming soon.</p>
              </div>

              {/* Right Column in Scroll Area: Goals, Backstory */}
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
        
      </DialogContent>
    </Dialog>
  );
}
