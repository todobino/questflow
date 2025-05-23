
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Heart, Shield as ShieldIcon, Zap, Activity, ListChecks, Target, FileText, Edit3, Save, XCircle, UserCircle, VenetianMask, Puzzle, TrendingUp, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  imageUrl: z.string().url().optional().or(z.literal('')).default('https://placehold.co/96x96.png'),
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

const StatDisplay = ({ icon: Icon, label, value, iconClassName, valueClassName }: { icon?: React.ElementType; label: string; value: string | number | undefined | null; iconClassName?: string; valueClassName?: string }) => (
  <div className="flex items-center text-sm">
    {Icon && <Icon className={cn("h-4 w-4 mr-1.5 text-muted-foreground", iconClassName)} />}
    <span className="font-medium text-muted-foreground mr-1">{label}:</span>
    <span className={cn("text-foreground", valueClassName)}>{value ?? 'N/A'}</span>
  </div>
);


export function CharacterProfileDialog({ character, isOpen, onClose }: CharacterProfileDialogProps) {
  const { updateCharacter } = useCampaignContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [availableSubclasses, setAvailableSubclasses] = useState<readonly string[]>([]);
  
  const currentCharacterRef = useRef(character); 

  const form = useForm<CharacterProfileFormData>({
    resolver: zodResolver(characterProfileSchema),
  });

  const selectedClass = form.watch('class') as DndClass | undefined;

  useEffect(() => {
    if (selectedClass && SUBCLASSES[selectedClass]) {
      setAvailableSubclasses(SUBCLASSES[selectedClass]);
       if (isEditing && form.formState.isDirty) { 
        const currentSubclass = form.getValues('subclass');
        if (currentSubclass && !SUBCLASSES[selectedClass].includes(currentSubclass)) {
          form.setValue('subclass', '');
        }
      }
    } else {
      setAvailableSubclasses([]);
      if (isEditing) {
        form.setValue('subclass', '');
      }
    }
  }, [selectedClass, form, isEditing]);

  useEffect(() => {
    if (isOpen && character) { 
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
        imageUrl: character.imageUrl || 'https://placehold.co/96x96.png',
      });
       if (character.class && SUBCLASSES[character.class as DndClass]) {
        setAvailableSubclasses(SUBCLASSES[character.class as DndClass]);
      }
    } else if (!isOpen) {
      setIsEditing(false); 
    }
  }, [character, form, isOpen]);

  const handleSave = (data: CharacterProfileFormData) => {
    if (!character) return;
    const updatedCharacterData: Character = { 
        ...character, 
        ...data, 
        abilities: data.abilities || character.abilities, 
        level: Number(data.level),
        currentHp: Number(data.currentHp),
        maxHp: Number(data.maxHp),
        armorClass: Number(data.armorClass),
        initiativeModifier: Number(data.initiativeModifier),
        currentExp: Number(data.currentExp),
        nextLevelExp: Number(data.nextLevelExp),
    };
    updateCharacter(updatedCharacterData); 
    setIsEditing(false);
    toast({ title: "Character Updated", description: `${data.name || 'Character'} has been updated.` });
  };

  const handleCancelEdit = () => {
    if (currentCharacterRef.current) { 
        form.reset({
            name: currentCharacterRef.current.name || '',
            race: currentCharacterRef.current.race || '',
            class: currentCharacterRef.current.class || '',
            subclass: currentCharacterRef.current.subclass || '',
            background: currentCharacterRef.current.background || '',
            level: currentCharacterRef.current.level || 1,
            currentHp: currentCharacterRef.current.currentHp !== undefined ? currentCharacterRef.current.currentHp : (currentCharacterRef.current.maxHp || 10),
            maxHp: currentCharacterRef.current.maxHp || 10,
            armorClass: currentCharacterRef.current.armorClass || 10,
            initiativeModifier: currentCharacterRef.current.initiativeModifier || 0,
            currentExp: currentCharacterRef.current.currentExp || 0,
            nextLevelExp: currentCharacterRef.current.nextLevelExp || 1000,
            abilities: currentCharacterRef.current.abilities || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
            backstory: currentCharacterRef.current.backstory || '',
            imageUrl: currentCharacterRef.current.imageUrl || 'https://placehold.co/96x96.png',
        });
         if (currentCharacterRef.current.class && SUBCLASSES[currentCharacterRef.current.class as DndClass]) {
            setAvailableSubclasses(SUBCLASSES[currentCharacterRef.current.class as DndClass]);
        }
    }
    setIsEditing(false);
  };
  
  const displayCharacter = isEditing ? form.watch() : character; 
  
  if (!character && !displayCharacter) return null; 
  if (!displayCharacter) return null; 

  const expPercentage = (displayCharacter.nextLevelExp && displayCharacter.nextLevelExp > 0 && displayCharacter.currentExp !== undefined)
    ? (displayCharacter.currentExp / displayCharacter.nextLevelExp) * 100
    : 0;

  const renderFormField = (fieldName: keyof CharacterProfileFormData, label: string, placeholder: string, type: string = "text", options?: readonly string[], disabled?: boolean) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          {type === "select" && options ? (
            <Select onValueChange={field.onChange} value={field.value as string || ''} disabled={disabled || fieldName === 'subclass' && (!selectedClass || availableSubclasses.length === 0)}>
              <FormControl>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : type === "textarea" ? (
             <FormControl>
                <Textarea placeholder={placeholder} {...field} className="text-xs min-h-[100px] resize-y" value={field.value as string || ''} />
            </FormControl>
          ) : (
            <FormControl>
              <Input type={type} placeholder={placeholder} {...field} className="h-8 text-xs" value={field.value as string | number || ''} 
               onChange={e => field.onChange(type === "number" ? parseInt(e.target.value, 10) || 0 : e.target.value)}
              />
            </FormControl>
          )}
          <FormMessage className="text-xs"/>
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            if (isEditing) handleCancelEdit(); 
            onClose();
        }
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="flex flex-col flex-1 min-h-0">
            <DialogHeader className="p-4 sm:p-6 border-b flex-shrink-0">
               <div className="flex items-stretch justify-between gap-x-3 sm:gap-x-4">
                {/* Container for the two 50% columns */}
                <div className="flex flex-1 min-w-0 items-stretch gap-x-3 sm:gap-x-4">
                    {/* Left 50% Column: Image + Primary Info */}
                    <div className="w-1/2 flex items-start gap-x-3 sm:gap-x-4 min-w-0">
                        <div className="flex-shrink-0 relative w-24 h-24">
                            <Image
                                src={isEditing ? form.getValues('imageUrl') || 'https://placehold.co/96x96.png' : displayCharacter.imageUrl || 'https://placehold.co/96x96.png'}
                                alt={displayCharacter.name || 'Character'}
                                width={96}
                                height={96}
                                className="object-cover w-full h-full rounded-lg shadow-md bg-muted"
                                data-ai-hint={`${displayCharacter.race || ''} ${displayCharacter.class || ''} portrait`}
                                key={isEditing ? form.getValues('imageUrl') : displayCharacter.imageUrl} 
                            />
                        </div>
                        <div className="flex-1 flex flex-col space-y-0.5 min-w-0">
                            {isEditing ? (
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><Input {...field} placeholder="Character Name" className="text-xl sm:text-2xl font-bold h-auto p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0" /></FormItem>)} />
                            ) : (
                                <DialogTitle className="text-xl sm:text-2xl text-left truncate">{displayCharacter.name || 'Character Profile'}</DialogTitle>
                            )}
                            
                            {isEditing ? (
                                <div className="space-y-1 text-xs mt-1">
                                    <FormField control={form.control} name="level" render={({ field }) => (<FormItem className="flex items-center gap-1"><FormLabel>Lvl</FormLabel><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} className="h-6 p-1 w-12 text-xs" /></FormItem>)} />
                                    <FormField control={form.control} name="race" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Race" /></SelectTrigger></FormControl><SelectContent>{RACES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                    <FormField control={form.control} name="class" render={({ field }) => (<FormItem><Select onValueChange={(v) => { field.onChange(v); form.setValue('subclass', '');}} value={field.value || ''}><FormControl><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Class" /></SelectTrigger></FormControl><SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                    <FormField control={form.control} name="subclass" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedClass || availableSubclasses.length === 0}><FormControl><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Subclass" /></SelectTrigger></FormControl><SelectContent>{availableSubclasses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                    <FormField control={form.control} name="background" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Background" /></SelectTrigger></FormControl><SelectContent>{BACKGROUNDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-1.5">
                                    <span>Lvl {displayCharacter.level || 1}</span>
                                    {displayCharacter.race && <span>{displayCharacter.race}</span>}
                                    {displayCharacter.class && <span>{displayCharacter.class}</span>}
                                    {displayCharacter.subclass && <span>({displayCharacter.subclass})</span>}
                                    {displayCharacter.background && <span className="flex items-center"><Puzzle className="mr-1 h-3 w-3 text-muted-foreground" />{displayCharacter.background}</span>}
                                </p>
                            )}

                            <div className="pt-0.5 text-xs">
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-2">
                                    <FormField control={form.control} name="currentExp" render={({ field }) => (<FormItem><FormLabel>Current XP</FormLabel><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} className="h-6 p-1 w-full text-xs" /></FormItem>)} />
                                    <FormField control={form.control} name="nextLevelExp" render={({ field }) => (<FormItem><FormLabel>Next Lvl XP</FormLabel><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} className="h-6 p-1 w-full text-xs" /></FormItem>)} />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-xs text-muted-foreground mb-0.5 items-center">
                                            <strong className="text-foreground font-bold">XP:</strong> 
                                            <span>{displayCharacter.currentExp ?? '0'} / {displayCharacter.nextLevelExp ?? '?'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Lvl {displayCharacter.level || 1}</span>
                                            <Progress value={expPercentage} className="h-1.5 flex-1" />
                                            <span>Lvl {(displayCharacter.level || 0) + 1}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right 50% Column: Combat Stats Box */}
                    <div className="w-1/2 p-3 border rounded-md bg-muted/30 flex flex-col justify-center space-y-1 items-start">
                        {isEditing ? (
                            <>
                            <FormField control={form.control} name="currentHp" render={({ field }) => (<FormItem className="w-full"><Label className="text-xs">HP</Label><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} placeholder="Current HP" className="h-6 p-1 w-full text-xs"/></FormItem> )} />
                            <FormField control={form.control} name="maxHp" render={({ field }) => (<FormItem className="w-full"><Label className="text-xs">Max HP</Label><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} placeholder="Max HP" className="h-6 p-1 w-full text-xs"/></FormItem> )} />
                            <FormField control={form.control} name="armorClass" render={({ field }) => (<FormItem className="w-full"><Label className="text-xs">AC</Label><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} placeholder="AC" className="h-6 p-1 w-full text-xs"/></FormItem> )} />
                            {/* Level is edited in the left column already */}
                            <FormField control={form.control} name="initiativeModifier" render={({ field }) => (<FormItem className="w-full"><Label className="text-xs">Init. Mod</Label><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} placeholder="Init Mod" className="h-6 p-1 w-full text-xs"/></FormItem> )} />
                            </>
                        ) : (
                        <>
                            <div className="flex justify-between w-full">
                                <StatDisplay icon={Heart} label="HP" value={`${displayCharacter.currentHp ?? '?'}/${displayCharacter.maxHp ?? '?'}`} iconClassName="text-red-500" />
                                <StatDisplay icon={ShieldIcon} label="AC" value={displayCharacter.armorClass} iconClassName="text-sky-600"/>
                            </div>
                            <div className="flex justify-between w-full">
                                {/* Level is displayed with Race/Class */}
                                <StatDisplay icon={UserCircle} label="Lvl" value={displayCharacter.level || 1} />
                                <StatDisplay icon={Zap} label="Init" value={displayCharacter.initiativeModifier !== undefined ? (displayCharacter.initiativeModifier >= 0 ? `+${displayCharacter.initiativeModifier}`: displayCharacter.initiativeModifier) : 'N/A'} iconClassName="text-yellow-500" />
                            </div>
                        </>
                        )}
                    </div>
                </div>

                {/* Edit/Save/Cancel Button Container */}
                <div className="flex-shrink-0 self-start">
                  {/* Button is now in footer */}
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-grow min-h-0">
              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-background/30">
                    <h3 className="text-md font-semibold flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Ability Scores</h3>
                    {isEditing ? (
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
                            {ABILITIES_ORDER.map(abilityKey => (
                                <FormField
                                    control={form.control}
                                    name={`abilities.${abilityKey}`}
                                    key={abilityKey}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium">{ABILITY_NAMES[abilityKey]}</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="h-7 p-1 text-xs w-full"
                                                 onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}
                                                 value={field.value || ''}
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

                    <div className="p-4 border rounded-lg shadow-sm bg-background/30 flex-grow flex flex-col min-h-[150px] sm:min-h-[200px]">
                      <h3 className="text-lg font-semibold flex items-center mb-2"><FileText className="h-5 w-5 mr-2 text-primary" />Backstory</h3>
                      {isEditing ? (
                           renderFormField('backstory', 'Backstory', "Character's backstory...", 'textarea')
                       ) : (
                          <ScrollArea className="flex-1 max-h-48 sm:max-h-64 min-h-0">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pr-2">
                            {displayCharacter.backstory || 'No backstory provided.'}
                            </p>
                          </ScrollArea>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="px-4 py-2 sm:px-6 sm:py-3 border-t bg-muted/50 flex-shrink-0">
                 {isEditing ? (
                    <>
                      <Button type="button" variant="ghost" onClick={handleCancelEdit} size="sm">
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                      <Button type="submit" variant="success" size="sm">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </Button>
                    </>
                  ) : (
                     <Button 
                        type="button"
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                      >
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                      </Button>
                  )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

