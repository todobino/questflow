
'use client';

import Image from 'next/image';
import type { Character } from '@/lib/types';
import { RACES, CLASSES, SUBCLASSES, BACKGROUNDS, type DndClass } from '@/lib/dnd-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Heart, Shield as ShieldIcon, Zap, Activity, ListChecks, Target, FileText, Edit3, Save, XCircle, VenetianMask, Puzzle, TrendingUp, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useCampaignContext } from '@/contexts/campaign-context';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const characterProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  race: z.string().optional(),
  class: z.string().optional(),
  subclass: z.string().optional(),
  background: z.string().optional(),
  level: z.coerce.number().min(1).max(20).optional().default(1),
  currentHp: z.coerce.number().int().optional().default(10),
  maxHp: z.coerce.number().int().min(1, "Max HP must be at least 1").optional().default(10),
  armorClass: z.coerce.number().int().optional().default(10),
  initiativeModifier: z.coerce.number().int().optional().default(0),
  currentExp: z.coerce.number().int().min(0).optional().default(0),
  nextLevelExp: z.coerce.number().int().min(1, "Next Level EXP must be at least 1").optional().default(1000),
  abilities: z.object({
    strength: z.coerce.number().int().min(1).max(30).optional().default(10),
    dexterity: z.coerce.number().int().min(1).max(30).optional().default(10),
    constitution: z.coerce.number().int().min(1).max(30).optional().default(10),
    intelligence: z.coerce.number().int().min(1).max(30).optional().default(10),
    wisdom: z.coerce.number().int().min(1).max(30).optional().default(10),
    charisma: z.coerce.number().int().min(1).max(30).optional().default(10),
  }).optional(),
  backstory: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).default('https://placehold.co/400x400.png'),
}).refine(data => data.currentHp === undefined || data.maxHp === undefined || data.currentHp <= data.maxHp, {
  message: "Current HP cannot exceed Max HP",
  path: ["currentHp"],
}).refine(data => data.currentExp === undefined || data.nextLevelExp === undefined || data.currentExp <= data.nextLevelExp, {
  message: "Current EXP cannot exceed EXP for Next Level",
  path: ["currentExp"],
});

type CharacterProfileFormData = z.infer<typeof characterProfileSchema>;

interface CharacterProfileDialogProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

const ABILITIES_ORDER: (keyof NonNullable<Character['abilities']>)[] = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
const ABILITY_NAMES: { [key: string]: string } = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

export function CharacterProfileDialog({ character, isOpen, onClose }: CharacterProfileDialogProps) {
  const { updateCharacter } = useCampaignContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [availableSubclasses, setAvailableSubclasses] = useState<readonly string[]>([]);
  
  const currentCharacterRef = useRef(character); 

  const form = useForm<CharacterProfileFormData>({
    resolver: zodResolver(characterProfileSchema),
    defaultValues: character || {
        name: '', race: '', class: '', subclass: '', background: '',
        level: 1, currentHp: 10, maxHp: 10, armorClass: 10, initiativeModifier: 0,
        currentExp: 0, nextLevelExp: 1000,
        abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        backstory: '', imageUrl: 'https://placehold.co/400x400.png'
    },
  });

  const selectedClassWatch = form.watch('class') as DndClass | undefined;

  useEffect(() => {
    if (selectedClassWatch && SUBCLASSES[selectedClassWatch]) {
      setAvailableSubclasses(SUBCLASSES[selectedClassWatch]);
    } else {
      setAvailableSubclasses([]);
    }
  }, [selectedClassWatch]);

  useEffect(() => {
    if (character) {
      currentCharacterRef.current = character;
      form.reset({
        name: character.name || '',
        race: character.race || '',
        class: character.class || '',
        subclass: character.subclass || '',
        background: character.background || '',
        level: character.level || 1,
        currentHp: character.currentHp !== undefined ? character.currentHp : (character.maxHp || 10),
        maxHp: character.maxHp || 10,
        armorClass: character.armorClass || 10,
        initiativeModifier: character.initiativeModifier || 0,
        currentExp: character.currentExp || 0,
        nextLevelExp: character.nextLevelExp || 1000,
        abilities: character.abilities || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        backstory: character.backstory || '',
        imageUrl: character.imageUrl || 'https://placehold.co/400x400.png',
      });
      if (character.class && SUBCLASSES[character.class as DndClass]) {
        setAvailableSubclasses(SUBCLASSES[character.class as DndClass]);
      }
    } else {
         form.reset({
            name: '', race: '', class: '', subclass: '', background: '',
            level: 1, currentHp: 10, maxHp: 10, armorClass: 10, initiativeModifier: 0,
            currentExp: 0, nextLevelExp: 1000,
            abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
            backstory: '', imageUrl: 'https://placehold.co/400x400.png'
        });
    }
  }, [character, form.reset, isEditing, isOpen]);


  const handleSave = (data: CharacterProfileFormData) => {
    if (!character) return;
    updateCharacter({ ...character, ...data });
    setIsEditing(false);
    toast({ title: "Character Updated", description: `${data.name || 'Character'} has been updated.` });
  };

  const handleCancelEdit = () => {
    if (currentCharacterRef.current) form.reset(currentCharacterRef.current);
    setIsEditing(false);
  };

  if (!character && !isEditing) { 
    return null;
  }
  
  const displayCharacter = isEditing ? form.watch() : character;
  if (!displayCharacter) return null;

  const expPercentage = (displayCharacter.nextLevelExp && displayCharacter.nextLevelExp > 0 && displayCharacter.currentExp !== undefined)
    ? (displayCharacter.currentExp / displayCharacter.nextLevelExp) * 100
    : 0;

  const StatDisplay = ({ icon: Icon, label, value, iconClassName, valueClassName }: { icon?: React.ElementType; label: string; value: string | number | undefined | null; iconClassName?: string; valueClassName?: string }) => (
    <div className="flex items-center text-sm">
      {Icon && <Icon className={cn("h-4 w-4 mr-1.5 text-muted-foreground", iconClassName)} />}
      <span className="font-medium text-muted-foreground mr-1">{label}:</span>
      <span className={cn("text-foreground", valueClassName)}>{value ?? 'N/A'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setIsEditing(false); 
            onClose();
        }
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <DialogHeader className="p-4 sm:p-6 border-b">
              <div className="flex items-stretch justify-between gap-x-4"> {/* Main Header Row - items-stretch */}
                {/* Left Group: Image + Primary Info */}
                <div className="flex items-start gap-x-3 sm:gap-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-muted w-24 h-24 relative">
                    <Image
                      src={displayCharacter.imageUrl || 'https://placehold.co/96x96.png'}
                      alt={displayCharacter.name || 'Character'}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                      data-ai-hint={`${displayCharacter.race || ''} ${displayCharacter.class || ''} portrait`}
                      key={displayCharacter.imageUrl}
                    />
                  </div>
                  <div className="flex-1 flex flex-col space-y-0.5 pt-1 min-w-0">
                    {isEditing ? (
                       <FormField control={form.control} name="name" render={({ field }) => ( <FormItem className="mb-1"><FormControl><Input placeholder="Character Name" {...field} className="text-xl sm:text-2xl font-semibold p-1 h-auto border-0 focus-visible:ring-1 focus-visible:ring-ring" /></FormControl><FormMessage className="text-xs" /></FormItem>)} />
                    ) : (
                      <DialogTitle className="text-xl sm:text-2xl text-left">{displayCharacter.name || 'Character Profile'}</DialogTitle>
                    )}
                    
                    {isEditing ? (
                      <div className="space-y-2 text-xs mt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <FormField control={form.control} name="race" render={({ field }) => (<FormItem><FormLabel className="text-xs">Race</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-7 p-1.5 text-xs"><SelectValue placeholder="Race" /></SelectTrigger></FormControl><SelectContent>{RACES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                          <FormField control={form.control} name="class" render={({ field }) => (<FormItem><FormLabel className="text-xs">Class</FormLabel><Select onValueChange={(v)=>{field.onChange(v); form.setValue('subclass', '');}} value={field.value || ''}><FormControl><SelectTrigger className="h-7 p-1.5 text-xs"><SelectValue placeholder="Class" /></SelectTrigger></FormControl><SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField control={form.control} name="subclass" render={({ field }) => (<FormItem><FormLabel className="text-xs">Subclass</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedClassWatch || availableSubclasses.length === 0}><FormControl><SelectTrigger className="h-7 p-1.5 text-xs"><SelectValue placeholder="Subclass" /></SelectTrigger></FormControl><SelectContent>{availableSubclasses.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                          <FormField control={form.control} name="background" render={({ field }) => (<FormItem><FormLabel className="text-xs">Background</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-7 p-1.5 text-xs"><SelectValue placeholder="Background" /></SelectTrigger></FormControl><SelectContent>{BACKGROUNDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-left flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{displayCharacter.race || 'N/A'}</span>
                        <span>{displayCharacter.class || 'N/A'}</span>
                        {displayCharacter.subclass && <span>({displayCharacter.subclass})</span>}
                        {displayCharacter.background && <span className="italic">, {displayCharacter.background}</span>}
                      </p>
                    )}

                    <div className="pt-0.5 text-xs">
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-x-3">
                            <FormField control={form.control} name="currentExp" render={({ field }) => (<FormItem><FormLabel className="text-xs"><strong>XP:</strong> Current</FormLabel><Input type="number" {...field} className="w-full h-6 p-1 text-xs"/> </FormItem> )} />
                            <FormField control={form.control} name="nextLevelExp" render={({ field }) => (<FormItem><FormLabel className="text-xs">Next Lvl XP</FormLabel><Input type="number" {...field} className="w-full h-6 p-1 text-xs"/> </FormItem> )} />
                        </div>
                      ) : (
                        <>
                           <div className="flex justify-between text-xs text-muted-foreground mb-0.5 items-center">
                              <span><strong>XP:</strong> {displayCharacter.currentExp ?? '0'} / {displayCharacter.nextLevelExp ?? '?'}</span>
                          </div>
                          <Progress value={expPercentage} className="h-1.5" />
                          <div className="flex justify-between text-[10px] text-muted-foreground/80">
                              <span>Lvl {displayCharacter.level || 1}</span>
                              <span>Lvl {(displayCharacter.level || 0) + 1}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center Group: Combat Stats (HP, AC, Level, Init) */}
                {!isEditing && character && (
                  <div className="flex-shrink-0 w-44 p-2 border rounded-md bg-muted/30 flex flex-col justify-center space-y-1">
                    <div className="flex justify-between w-full">
                      <StatDisplay icon={Heart} label="HP" value={`${character.currentHp ?? '?'}/${character.maxHp ?? '?'}`} iconClassName="text-red-500" />
                      <StatDisplay icon={ShieldIcon} label="AC" value={character.armorClass} iconClassName="text-sky-600"/>
                    </div>
                    <div className="flex justify-between w-full">
                       <StatDisplay icon={Zap} label="Lvl" value={character.level} />
                       <StatDisplay icon={Activity} label="Init" value={character.initiativeModifier !== undefined ? (character.initiativeModifier >= 0 ? `+${character.initiativeModifier}`: character.initiativeModifier) : 'N/A'} iconClassName="text-yellow-500" />
                    </div>
                  </div>
                )}
                 {isEditing && character && (
                  <div className="flex-shrink-0 w-48 p-3 border rounded-md bg-muted/30 space-y-2">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <FormField control={form.control} name="currentHp" render={({ field }) => (<FormItem><FormLabel className="text-xs">HP</FormLabel><Input type="number" {...field} placeholder="Current HP" className="h-6 p-1 text-xs"/></FormItem> )} />
                      <FormField control={form.control} name="maxHp" render={({ field }) => (<FormItem><FormLabel className="text-xs">Max HP</FormLabel><Input type="number" {...field} placeholder="Max HP" className="h-6 p-1 text-xs"/></FormItem> )} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <FormField control={form.control} name="armorClass" render={({ field }) => (<FormItem><FormLabel className="text-xs">AC</FormLabel><Input type="number" {...field} placeholder="AC" className="h-6 p-1 text-xs"/></FormItem> )} />
                      <FormField control={form.control} name="level" render={({ field }) => (<FormItem><FormLabel className="text-xs">Level</FormLabel><Input type="number" {...field} placeholder="Level" className="h-6 p-1 text-xs"/></FormItem> )} />
                    </div>
                     <FormField control={form.control} name="initiativeModifier" render={({ field }) => (<FormItem><FormLabel className="text-xs">Init. Mod</FormLabel><Input type="number" {...field} placeholder="Init Mod" className="h-6 p-1 text-xs"/></FormItem> )} />
                  </div>
                )}


                {/* Right Group: Edit/Save/Cancel Buttons */}
                <div className="flex-shrink-0 self-start">
                   {!isEditing ? (
                    <Button 
                      type="button"
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                       <Button type="submit" variant="success" size="sm">
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                      <Button type="button" variant="ghost" onClick={handleCancelEdit} size="sm">
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-grow min-h-0">
              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-background/30">
                    <h3 className="text-md font-semibold flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Ability Scores</h3>
                    {isEditing && displayCharacter.abilities ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            {ABILITIES_ORDER.map(abilityKey => (
                                <FormField
                                    control={form.control}
                                    name={`abilities.${abilityKey}`}
                                    key={abilityKey}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-muted-foreground">{ABILITY_NAMES[abilityKey]}</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="h-7 p-1 text-xs"
                                                 onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs"/>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    ) : displayCharacter.abilities ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                            {ABILITIES_ORDER.map(abilityKey => (
                                <div key={abilityKey} className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">{ABILITY_NAMES[abilityKey]}:</span>
                                    <span className="text-foreground">{displayCharacter.abilities![abilityKey]}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No ability scores defined.</p>
                    )}
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
                         {isEditing ? (
                             <FormField
                                control={form.control}
                                name="backstory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                            placeholder="Character's backstory..."
                                            className="resize-y min-h-[100px] text-sm"
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs"/>
                                    </FormItem>
                                )}
                             />
                         ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pr-2">
                            {displayCharacter.backstory || 'No backstory provided.'}
                            </p>
                         )}
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="px-4 py-2 sm:px-6 sm:py-3 border-t">
                 {/* Footer is empty unless in edit mode to simplify; alternative is to show "Close" button */}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

