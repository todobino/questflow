
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter as SheetModalFooter,
} from '@/components/ui/sheet';
import { UserPlus, Bot, Dices, ShieldX, Trash2, MinusCircle, History, Users as UsersIcon, ArrowRight, Heart, Shield as ShieldIcon, PlusCircle, Swords, X, PlayCircle, UserRound, Cat, Skull } from 'lucide-react';
import type { Combatant, Character, EncounterLogEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCampaignContext } from '@/contexts/campaign-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogFooter as ShadDialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as ShadAlertDialogContent, 
  AlertDialogDescription as ShadAlertDialogDescription, 
  AlertDialogFooter as ShadAlertDialogFooter, 
  AlertDialogHeader as ShadAlertDialogHeader, 
  AlertDialogTitle as ShadAlertDialogTitle, 
  AlertDialogTrigger as ShadAlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent as ShadTabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

// Consistent background colors for different combatant types
const PLAYER_CHARACTER_COLOR = 'bg-white dark:bg-gray-100'; 
const ALLY_COLOR = 'bg-white dark:bg-gray-100'; 
const ENEMY_COLOR = 'bg-white dark:bg-gray-100'; 

const PLAYER_INITIATIVE_BG = 'bg-success text-success-foreground';
const ALLY_INITIATIVE_BG = 'bg-slate-400 dark:bg-slate-500 text-white dark:text-gray-100';
const ENEMY_INITIATIVE_BG = 'bg-destructive text-destructive-foreground';


export function CombatTrackerTool() {
  const { activeCampaign, characters: partyCharacters } = useCampaignContext();
  const [combatants, setCombatants] = useState<Combatant[]>([]);

  const [isAddCombatantDialogOpen, setIsAddCombatantDialogOpen] = useState(false);
  const [addCombatantDialogTab, setAddCombatantDialogTab] = useState<'enemy' | 'ally' | 'player'>('enemy');


  const [selectedPlayerCharacterId, setSelectedPlayerCharacterId] = useState<string | undefined>(undefined);
  const [playerInitiativeInput, setPlayerInitiativeInput] = useState('');

  const [newCombatantName, setNewCombatantName] = useState('');
  const [newCombatantHp, setNewCombatantHp] = useState('');
  const [newCombatantMaxHp, setNewCombatantMaxHp] = useState('');
  const [newCombatantInitiativeModifier, setNewCombatantInitiativeModifier] = useState('');
  const [newCombatantAC, setNewCombatantAC] = useState('');
  const [newCombatantQuantity, setNewCombatantQuantity] = useState('1');
  const [newCombatantInitiativeRollType, setNewCombatantInitiativeRollType] = useState<'group' | 'individual'>('individual');


  const [round, setRound] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [combatStarted, setCombatStarted] = useState(false);

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [hitHealAmount, setHitHealAmount] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [combatantToDeleteId, setCombatantToDeleteId] = useState<string | null>(null);
  const [roundChangeMessage, setRoundChangeMessage] = useState<string | null>(null);

  const [encounterLog, setEncounterLog] = useState<EncounterLogEntry[]>([]);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);


  const { toast } = useToast();

  const sortedCombatants = useMemo(() => {
    if (combatants.length === 0) return []; 
    if (!combatStarted) return combatants.sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
    return [...combatants].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
  }, [combatants, combatStarted]);

  const currentTurnCombatantId = combatStarted && sortedCombatants.length > 0 ? sortedCombatants[turnIndex]?.id : null;

  const roll1d20 = () => Math.floor(Math.random() * 20) + 1;

  const handleAddAllyOrEnemyFromDialog = () => {
    if (!newCombatantName || !newCombatantHp || !newCombatantInitiativeModifier) {
      toast({ title: 'Missing Info', description: 'Name, Current HP, and Initiative Modifier are required.', variant: 'destructive' });
      return;
    }
  
    let initiativeModifierValue = parseInt(newCombatantInitiativeModifier.trim(), 10);
    if (newCombatantInitiativeModifier.trim() === '' || isNaN(initiativeModifierValue)) {
        initiativeModifierValue = 0; 
    }
      
    const quantityValue = parseInt(newCombatantQuantity, 10);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast({ title: 'Invalid Quantity', description: 'Quantity must be a positive number.', variant: 'destructive' });
      return;
    }
  
    const currentHpValue = parseInt(newCombatantHp, 10);
    if (isNaN(currentHpValue) || currentHpValue < 0) {
      toast({ title: 'Invalid Current HP', description: 'Current HP must be a non-negative number.', variant: 'destructive' });
      return;
    }
  
    const maxHpValue = newCombatantMaxHp.trim() !== '' ? parseInt(newCombatantMaxHp, 10) : currentHpValue;
    if (newCombatantMaxHp.trim() !== '' && (isNaN(maxHpValue) || maxHpValue < 1)) {
      toast({ title: 'Invalid Max HP', description: 'Max HP must be a positive number or empty (will default to Current HP).', variant: 'destructive' });
      return;
    }
    if (maxHpValue > 0 && currentHpValue > maxHpValue) { 
      toast({ title: 'Invalid HP', description: 'Current HP cannot exceed Max HP.', variant: 'destructive' });
      return;
    }
  
    const acValue = newCombatantAC.trim() !== '' ? parseInt(newCombatantAC, 10) : undefined;
    if (newCombatantAC.trim() !== '' && (acValue === undefined || isNaN(acValue) || acValue < 0)) {
      toast({ title: 'Invalid Armor Class', description: 'Armor Class must be a non-negative number or empty.', variant: 'destructive' });
      return;
    }
  
    const newCombatantsBatch: Combatant[] = [];
    let groupInitiativeRoll: number | undefined = undefined;
  
    if (quantityValue > 1 && newCombatantInitiativeRollType === 'group') {
      groupInitiativeRoll = roll1d20() + initiativeModifierValue;
    }
  
    for (let i = 0; i < quantityValue; i++) {
      const combatantName = quantityValue > 1 ? `${newCombatantName} ${i + 1}` : newCombatantName;
  
      let finalInitiative: number;
      if (groupInitiativeRoll !== undefined) {
        finalInitiative = groupInitiativeRoll;
      } else {
        finalInitiative = roll1d20() + initiativeModifierValue;
      }
  
      let displayColor: string;
      let typeForCombatant: 'enemy' | 'player'; 
  
      if (addCombatantDialogTab === 'ally') {
        displayColor = ALLY_COLOR; 
        typeForCombatant = 'player'; 
      } else { // 'enemy'
        displayColor = ENEMY_COLOR;
        typeForCombatant = 'enemy';
      }
  
      const newCombatant: Combatant = {
        id: String(Date.now() + Math.random() + i),
        name: combatantName,
        type: typeForCombatant,
        hp: currentHpValue,
        maxHp: maxHpValue > 0 ? maxHpValue : currentHpValue, 
        armorClass: acValue,
        initiative: finalInitiative,
        conditions: [],
        isPlayerCharacter: false, 
        displayColor: displayColor,
        initiativeModifier: initiativeModifierValue
      };
      newCombatantsBatch.push(newCombatant);
    }
  
    setCombatants(prev => [...prev, ...newCombatantsBatch].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
    setIsAddCombatantDialogOpen(false);
    setNewCombatantName('');
    setNewCombatantHp('');
    setNewCombatantMaxHp('');
    setNewCombatantAC('');
    setNewCombatantInitiativeModifier('');
    setNewCombatantQuantity('1');
    setNewCombatantInitiativeRollType('individual');
  };


  const handleAddPlayerFromDialog = () => {
    if (!selectedPlayerCharacterId) {
        toast({ title: "No Player Selected", description: "Please select a player character.", variant: "destructive"});
        return;
    }
    const characterToAdd = partyCharacters.find(p => p.id === selectedPlayerCharacterId);
    if (!characterToAdd) {
        toast({ title: "Character Not Found", description: "Could not find the selected character.", variant: "destructive"});
        return;
    }

    let initiativeValue;
    if (playerInitiativeInput.trim() === '') {
        initiativeValue = roll1d20() + (characterToAdd.initiativeModifier ?? 0);
    } else {
        initiativeValue = parseInt(playerInitiativeInput, 10);
        if (isNaN(initiativeValue)) {
            toast({ title: "Invalid Initiative", description: "Please enter a valid number for initiative or leave blank to roll.", variant: "destructive"});
            return;
        }
    }
    
    const newPlayerCombatant: Combatant = {
      id: String(Date.now() + Math.random()),
      name: characterToAdd.name,
      type: 'player',
      hp: characterToAdd.currentHp ?? characterToAdd.maxHp ?? 10,
      maxHp: characterToAdd.maxHp ?? 10,
      initiative: initiativeValue, 
      conditions: [],
      initiativeModifier: characterToAdd.initiativeModifier ?? 0,
      isPlayerCharacter: true,
      originalCharacterId: characterToAdd.id,
      armorClass: characterToAdd.armorClass,
      displayColor: PLAYER_CHARACTER_COLOR,
    };
    setCombatants(prev => [...prev, newPlayerCombatant].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
    setIsAddCombatantDialogOpen(false);
    setSelectedPlayerCharacterId(undefined);
    setPlayerInitiativeInput('');
  };

  const handleAddPartyToCombat = () => {
    if (!activeCampaign || !partyCharacters || partyCharacters.length === 0) {
      return;
    }

    let updatedCombatantsList = [...combatants];
    const newPartyCombatants: Combatant[] = [];

    partyCharacters.forEach((char, index) => {
      if (char.campaignId === activeCampaign.id) {
        const newInitiative = roll1d20() + (char.initiativeModifier ?? 0);
        const existingCombatantIndex = updatedCombatantsList.findIndex(c => c.originalCharacterId === char.id);

        if (existingCombatantIndex !== -1) {
          updatedCombatantsList[existingCombatantIndex] = {
            ...updatedCombatantsList[existingCombatantIndex],
            initiative: newInitiative,
            hp: char.currentHp ?? char.maxHp ?? updatedCombatantsList[existingCombatantIndex].hp,
            maxHp: char.maxHp ?? updatedCombatantsList[existingCombatantIndex].maxHp,
            armorClass: char.armorClass,
            initiativeModifier: char.initiativeModifier ?? 0,
            displayColor: PLAYER_CHARACTER_COLOR,
          };
        } else {
          newPartyCombatants.push({
            id: String(Date.now() + Math.random() + updatedCombatantsList.length + newPartyCombatants.length),
            name: char.name,
            type: 'player',
            hp: char.currentHp ?? char.maxHp ?? 10,
            maxHp: char.maxHp ?? 10,
            initiative: newInitiative,
            conditions: [],
            initiativeModifier: char.initiativeModifier ?? 0,
            isPlayerCharacter: true,
            originalCharacterId: char.id,
            armorClass: char.armorClass,
            displayColor: PLAYER_CHARACTER_COLOR,
          });
        }
      }
    });
    
    updatedCombatantsList = [...updatedCombatantsList, ...newPartyCombatants];
    
    if (updatedCombatantsList.length === 0) {
        setCombatants([]);
        return;
    }
    
    const sortedList = updatedCombatantsList.sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
    setCombatants(sortedList);
    
    if (sortedList.length > 0) { 
      setRound(1);
      setTurnIndex(0);
      setCombatStarted(true);
    }
  };


  const confirmDeleteCombatant = () => {
    if (combatantToDeleteId) {
      setCombatants(prev => prev.filter(c => c.id !== combatantToDeleteId));
    }
    setIsDeleteConfirmOpen(false);
    setCombatantToDeleteId(null);
    setOpenPopoverId(null); 
  };


  const handleApplyHitOrHeal = (combatantId: string, type: 'hit' | 'heal') => {
    const amount = parseInt(hitHealAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive"});
      return;
    }

    setCombatants(prev => prev.map(c => {
      if (c.id === combatantId) {
        let newHp;
        if (type === 'hit') {
          newHp = Math.max(0, c.hp - amount);
        } else {
          newHp = Math.min(c.maxHp ?? Infinity, c.hp + amount);
        }
        return { ...c, hp: newHp };
      }
      return c;
    }));
    setOpenPopoverId(null);
    setHitHealAmount('');
  };

  const startCombat = () => {
    if (combatants.length === 0) {
        toast({ title: "No Combatants", description: "Add some combatants to start.", variant: "destructive"});
        return;
    }
    setCombatants(prev => [...prev].sort((a,b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
    setRound(1);
    setTurnIndex(0);
    setCombatStarted(true);
};

  const nextTurn = () => {
    if (!combatStarted || sortedCombatants.length === 0) return;
    let newTurnIndex = turnIndex + 1;
    let newRound = round;
    if (newTurnIndex >= sortedCombatants.length) {
      newTurnIndex = 0;
      newRound += 1;
      setRoundChangeMessage(`Round ${newRound}`);
    }
    setTurnIndex(newTurnIndex);
    setRound(newRound);
  };

  const endCombat = () => {
    if (activeCampaign) {
        const newLogEntry: EncounterLogEntry = {
        id: String(Date.now()),
        timestamp: new Date().toISOString(),
        campaignId: activeCampaign.id,
        roundsFought: round,
        survivingPlayerCharacters: combatants
            .filter(c => c.isPlayerCharacter && c.hp > 0)
            .map(c => ({ name: c.name, currentHp: c.hp, maxHp: c.maxHp ?? c.hp })),
        defeatedCombatants: combatants
            .filter(c => c.hp <= 0)
            .map(c => ({ name: c.name, type: c.type })),
        };
        setEncounterLog(prevLog => [newLogEntry, ...prevLog]);
    }

    setRound(0);
    setTurnIndex(0);
    setCombatStarted(false);
    setCombatants([]); 
  };

  useEffect(() => {
    if (isAddCombatantDialogOpen && addCombatantDialogTab === 'player') {
      setPlayerInitiativeInput('');
    }
  }, [isAddCombatantDialogOpen, addCombatantDialogTab]);


  useEffect(() => {
    if (roundChangeMessage) {
      const timer = setTimeout(() => setRoundChangeMessage(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [roundChangeMessage]);

  const availablePlayerCharacters = useMemo(() => {
    if (!activeCampaign || !partyCharacters) return [];
    const combatantPlayerIds = combatants
      .filter(c => c.isPlayerCharacter && c.originalCharacterId)
      .map(c => c.originalCharacterId);
    return partyCharacters.filter(p => p.campaignId === activeCampaign.id && !combatantPlayerIds.includes(p.id));
  }, [activeCampaign, partyCharacters, combatants]);


  const handleRollPlayerDialogInitiative = () => {
      if (!selectedPlayerCharacterId) {
          toast({ title: "No Player Selected", description: "Select a player to roll initiative for.", variant: "destructive"});
          return;
      }
      const character = partyCharacters.find(p => p.id === selectedPlayerCharacterId);
      if (!character) {
          toast({ title: "Character Not Found", description: "Could not find selected character.", variant: "destructive"});
          return;
      }
      const initiativeRoll = roll1d20() + (character.initiativeModifier ?? 0);
      setPlayerInitiativeInput(String(initiativeRoll));
  };


  return (
    <div className="flex flex-col h-full">
      {roundChangeMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <span className={`text-5xl sm:text-6xl md:text-7xl font-extrabold animate-explode-text text-foreground drop-shadow-lg`}>
            {roundChangeMessage}
          </span>
        </div>
      )}
    
    <Card className="shadow-md flex-grow flex flex-col min-h-0">
      <CardHeader className="px-2.5 py-2 flex flex-row items-center justify-between border-b">
          <h3 className="flex items-center text-lg font-semibold">
              <Swords className="mr-2 h-5 w-5 text-primary" />
              Combat Order
              {combatStarted && round > 0 && (
              <span className="ml-2 text-sm text-muted-foreground font-medium">
                  (Round {round})
              </span>
              )}
          </h3>
          <Button variant="ghost" size="icon-sm" onClick={() => setIsHistorySheetOpen(true)} className="h-7 w-7">
              <History className="h-4 w-4" />
              <span className="sr-only">Encounter History</span>
          </Button>
      </CardHeader>
      
      <CardContent className="px-2.5 py-2 flex-grow overflow-y-auto">
        {combatants.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">Add combatants to begin.</p>
        ) : (
          <ul className="space-y-2.5">
            {sortedCombatants.map((c) => {
              const hpPercentage = c.maxHp > 0 ? (c.hp / c.maxHp) * 100 : 0;
              
              let hpBarColorClass: string;
                if (hpPercentage <= 20) hpBarColorClass = '[&>div]:bg-destructive';
                else if (hpPercentage <= 50) hpBarColorClass = '[&>div]:bg-yellow-500';
                else hpBarColorClass = '[&>div]:bg-primary dark:[&>div]:bg-foreground';


              const isCurrentTurn = c.id === currentTurnCombatantId;
              
              let initiativeBgColorClass: string;
              let turnBorderClass = 'ring-primary dark:ring-foreground';

              if (c.isPlayerCharacter && c.type === 'player') {
                  initiativeBgColorClass = PLAYER_INITIATIVE_BG;
                  if(isCurrentTurn) turnBorderClass = 'ring-success';
              } else if (c.type === 'enemy') {
                  initiativeBgColorClass = ENEMY_INITIATIVE_BG;
                    if(isCurrentTurn) turnBorderClass = 'ring-destructive';
              } else if (c.type === 'player' && !c.isPlayerCharacter) { 
                  initiativeBgColorClass = ALLY_INITIATIVE_BG;
                  if(isCurrentTurn) turnBorderClass = 'ring-gray-500 dark:ring-gray-400';
              } else {
                  initiativeBgColorClass = 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800';
              }

              return (
                <Popover key={c.id} open={openPopoverId === c.id} onOpenChange={(isOpen) => {
                  if (!isOpen) setOpenPopoverId(null);
                }}>
                  <PopoverTrigger asChild>
                    <li
                      className={cn(
                        'relative flex items-center gap-3 p-2.5 rounded-lg border shadow-lg transition-all duration-300 cursor-pointer',
                        isCurrentTurn ? `ring-2 ${turnBorderClass} scale-[1.02]` : 'opacity-90 hover:opacity-100',
                        c.hp <= 0 ? 'opacity-50 grayscale' : '',
                          c.displayColor
                      )}
                      onClick={() => { setOpenPopoverId(c.id); setHitHealAmount(''); }}
                    >
                       <div className={cn(
                          "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold",
                           initiativeBgColorClass
                        )}
                        >
                           {c.hp <= 0 ? <Skull className="h-6 w-6" /> : c.initiative ?? '-'}
                        </div>

                      <div className="flex-grow flex flex-col min-w-0">
                          <h4 className={cn(
                          "font-semibold text-md truncate",
                            c.type === 'player' && c.isPlayerCharacter ? 'text-gray-800 dark:text-gray-100' 
                            : c.type === 'player' && !c.isPlayerCharacter ? 'text-gray-800 dark:text-gray-100' 
                            : 'text-gray-800 dark:text-gray-100' 
                        )}
                        >
                          {c.name}
                        </h4>
                        {c.conditions && c.conditions.length > 0 && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">
                                {c.conditions.join(', ')}
                            </p>
                        )}
                         <div className="flex justify-between items-center text-xs mt-1">
                            <div className="flex items-center text-muted-foreground dark:text-gray-400">
                                <ShieldIcon className="mr-1 h-3.5 w-3.5 text-sky-600" /> {c.armorClass ?? 'N/A'}
                            </div>
                            <div className="flex items-center text-muted-foreground dark:text-gray-400">
                                <Heart className="mr-1 h-3.5 w-3.5 text-red-500" /> {c.hp} / {c.maxHp}
                            </div>
                        </div>
                        <div className="w-full mt-1.5">
                            <Progress
                            value={hpPercentage}
                            className={cn("h-1.5 w-full", hpBarColorClass)}
                            />
                        </div>
                      </div>
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                        <AlertDialog>
                            <ShadAlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon-sm" 
                                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive h-7 w-7 p-0"
                                    onClick={(e) => { e.stopPropagation(); }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </ShadAlertDialogTrigger>
                            <ShadAlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <ShadAlertDialogHeader>
                                    <ShadAlertDialogTitle>Delete {c.name}?</ShadAlertDialogTitle>
                                    <ShadAlertDialogDescription>This action cannot be undone.</ShadAlertDialogDescription>
                                </ShadAlertDialogHeader>
                                <ShadAlertDialogFooter>
                                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); setCombatantToDeleteId(c.id); setIsDeleteConfirmOpen(true); setOpenPopoverId(null); }}>Delete</AlertDialogAction>
                                </ShadAlertDialogFooter>
                            </ShadAlertDialogContent>
                        </AlertDialog>
                       </div>
                    </li>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" side="bottom" align="end" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor={`hit-heal-${c.id}`} className="text-xs">Amount</Label>
                        <Input
                          id={`hit-heal-${c.id}`}
                          type="number"
                          value={hitHealAmount}
                          onChange={(e) => setHitHealAmount(e.target.value)}
                          placeholder="e.g., 10"
                          bsSize="sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleApplyHitOrHeal(c.id, 'hit')}
                        >
                          <MinusCircle className="mr-2 h-4 w-4" /> Hit
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleApplyHitOrHeal(c.id, 'heal')}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Heal
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )
            })}
          </ul>
        )}
      </CardContent>
       <div className="p-2 border-t"> {/* Add Combatant button section */}
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full hover:bg-background hover:border-primary hover:text-primary"
                onClick={() => {
                    setAddCombatantDialogTab('enemy'); 
                    setIsAddCombatantDialogOpen(true);
                }}
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Combatant
            </Button>
        </div>
        <CardFooter className="p-2 border-t">
          <div className="flex items-center gap-2 w-full">
              {!combatStarted ? (
                  <Button onClick={handleAddPartyToCombat} className="flex-1 bg-success text-success-foreground hover:bg-success/90" size="sm">
                      <PlayCircle className="mr-2 h-4 w-4" /> Roll Party
                  </Button>
              ) : (
                  <Button onClick={nextTurn} className="flex-1" size="sm">
                  <ArrowRight className="mr-2 h-4 w-4" /> Next Turn 
                  </Button>
              )}
              <Button
                  onClick={endCombat}
                  variant="outline"
                  size="sm"
                  className="bg-muted border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              >
                  <ShieldX className="mr-2 h-4 w-4" /> End Combat
              </Button>
          </div>
        </CardFooter>
    </Card>

    <Dialog open={isAddCombatantDialogOpen} onOpenChange={(isOpen) => {
          setIsAddCombatantDialogOpen(isOpen);
          if (!isOpen) { 
              setNewCombatantName('');
              setNewCombatantHp('');
              setNewCombatantMaxHp('');
              setNewCombatantAC('');
              setNewCombatantInitiativeModifier('');
              setNewCombatantQuantity('1');
              setNewCombatantInitiativeRollType('individual');
              setSelectedPlayerCharacterId(undefined);
              setPlayerInitiativeInput('');
          }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Combatant</DialogTitle>
            <DialogClose onClick={() => setIsAddCombatantDialogOpen(false)} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <Tabs value={addCombatantDialogTab} onValueChange={(value) => setAddCombatantDialogTab(value as 'enemy' | 'ally' | 'player')} className="w-full pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="enemy"><Cat className="mr-2 h-4 w-4" />Enemy</TabsTrigger>
              <TabsTrigger value="ally"><ShieldPlus className="mr-2 h-4 w-4" />Ally</TabsTrigger>
            </TabsList>
            <ShadTabsContent value="enemy" className="py-4 space-y-3">
              <div>
                <Label htmlFor="new-combatant-name-enemy" className="text-xs">Name</Label>
                <Input id="new-combatant-name-enemy" value={newCombatantName} onChange={e => setNewCombatantName(e.target.value)} placeholder="e.g., Goblin Boss" bsSize="sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-combatant-hp-enemy" className="text-xs">Current HP</Label>
                  <Input id="new-combatant-hp-enemy" type="number" value={newCombatantHp} onChange={e => setNewCombatantHp(e.target.value)} placeholder="30" bsSize="sm" />
                </div>
                <div>
                  <Label htmlFor="new-combatant-maxHp-enemy" className="text-xs">Max HP (Optional)</Label>
                  <Input id="new-combatant-maxHp-enemy" type="number" value={newCombatantMaxHp} onChange={e => setNewCombatantMaxHp(e.target.value)} placeholder="30" bsSize="sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <Label htmlFor="new-combatant-ac-enemy" className="text-xs">Armor Class (Optional)</Label>
                   <Input id="new-combatant-ac-enemy" type="number" value={newCombatantAC} onChange={e => setNewCombatantAC(e.target.value)} placeholder="15" bsSize="sm" />
                 </div>
                 <div>
                   <Label htmlFor="new-combatant-initiative-modifier-enemy" className="text-xs">Initiative Modifier</Label>
                   <Input id="new-combatant-initiative-modifier-enemy" type="number" value={newCombatantInitiativeModifier} onChange={e => setNewCombatantInitiativeModifier(e.target.value)} placeholder="e.g., 2 or -1" bsSize="sm" />
                 </div>
              </div>
              <div>
                <Label htmlFor="new-combatant-quantity-enemy" className="text-xs">Quantity</Label>
                <Input id="new-combatant-quantity-enemy" type="number" value={newCombatantQuantity} onChange={e => setNewCombatantQuantity(e.target.value)} placeholder="1" bsSize="sm" min="1" />
              </div>
              {parseInt(newCombatantQuantity, 10) > 1 && (
                <div className="space-y-2">
                  <Label className="text-xs">Initiative Rolling</Label>
                  <RadioGroup
                    value={newCombatantInitiativeRollType}
                    onValueChange={(value: 'group' | 'individual') => setNewCombatantInitiativeRollType(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="group" id="roll-group-enemy" />
                      <Label htmlFor="roll-group-enemy" className="text-xs font-normal">Roll as Group</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="roll-individual-enemy" />
                      <Label htmlFor="roll-individual-enemy" className="text-xs font-normal">Roll Individually</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              <ShadDialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsAddCombatantDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddAllyOrEnemyFromDialog}>
                  Add {parseInt(newCombatantQuantity, 10) > 1 && addCombatantDialogTab === 'enemy' 
                    ? 'Enemies' 
                    : addCombatantDialogTab.charAt(0).toUpperCase() + addCombatantDialogTab.slice(1)}
                </Button>
              </ShadDialogFooter>
            </ShadTabsContent>
            <ShadTabsContent value="ally" className="py-4 space-y-3">
               <div>
                <Label htmlFor="new-combatant-name-ally" className="text-xs">Name</Label>
                <Input id="new-combatant-name-ally" value={newCombatantName} onChange={e => setNewCombatantName(e.target.value)} placeholder="e.g., Town Guard Captain" bsSize="sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-combatant-hp-ally" className="text-xs">Current HP</Label>
                  <Input id="new-combatant-hp-ally" type="number" value={newCombatantHp} onChange={e => setNewCombatantHp(e.target.value)} placeholder="25" bsSize="sm" />
                </div>
                <div>
                  <Label htmlFor="new-combatant-maxHp-ally" className="text-xs">Max HP (Optional)</Label>
                  <Input id="new-combatant-maxHp-ally" type="number" value={newCombatantMaxHp} onChange={e => setNewCombatantMaxHp(e.target.value)} placeholder="25" bsSize="sm" />
                </div>
              </div>
               <div className="grid grid-cols-2 gap-3">
                   <div>
                       <Label htmlFor="new-combatant-ac-ally" className="text-xs">Armor Class (Optional)</Label>
                       <Input id="new-combatant-ac-ally" type="number" value={newCombatantAC} onChange={e => setNewCombatantAC(e.target.value)} placeholder="16" bsSize="sm" />
                   </div>
                   <div>
                       <Label htmlFor="new-combatant-initiative-modifier-ally" className="text-xs">Initiative Modifier</Label>
                       <Input id="new-combatant-initiative-modifier-ally" type="number" value={newCombatantInitiativeModifier} onChange={e => setNewCombatantInitiativeModifier(e.target.value)} placeholder="e.g., 1 or 0" bsSize="sm" />
                   </div>
               </div>
              <div>
                <Label htmlFor="new-combatant-quantity-ally" className="text-xs">Quantity</Label>
                <Input id="new-combatant-quantity-ally" type="number" value={newCombatantQuantity} onChange={e => setNewCombatantQuantity(e.target.value)} placeholder="1" bsSize="sm" min="1" />
              </div>
               {parseInt(newCombatantQuantity, 10) > 1 && (
                <div className="space-y-2">
                  <Label className="text-xs">Initiative Rolling</Label>
                  <RadioGroup
                    value={newCombatantInitiativeRollType}
                    onValueChange={(value: 'group' | 'individual') => setNewCombatantInitiativeRollType(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="group" id="roll-group-ally" />
                      <Label htmlFor="roll-group-ally" className="text-xs font-normal">Roll as Group</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="roll-individual-ally" />
                      <Label htmlFor="roll-individual-ally" className="text-xs font-normal">Roll Individually</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              <ShadDialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsAddCombatantDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddAllyOrEnemyFromDialog}>
                   Add {parseInt(newCombatantQuantity, 10) > 1 && addCombatantDialogTab === 'ally' 
                       ? 'Allies' 
                       : addCombatantDialogTab.charAt(0).toUpperCase() + addCombatantDialogTab.slice(1)}
                </Button>
              </ShadDialogFooter>
            </ShadTabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>


      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={(open) => {
        setIsDeleteConfirmOpen(open);
        if (!open) setCombatantToDeleteId(null);
      }}>
        <ShadAlertDialogContent>
          <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>Delete {combatants.find(cb => cb.id === combatantToDeleteId)?.name || 'Combatant'}?</ShadAlertDialogTitle>
            <ShadAlertDialogDescription>
              This action cannot be undone.
            </ShadAlertDialogDescription>
          </ShadAlertDialogHeader>
          <ShadAlertDialogFooter>
            <AlertDialogCancel onClick={(e) => { e.stopPropagation(); setIsDeleteConfirmOpen(false); setCombatantToDeleteId(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.stopPropagation(); confirmDeleteCombatant(); }}>Delete</AlertDialogAction>
          </ShadAlertDialogFooter>
        </ShadAlertDialogContent>
      </AlertDialog>

      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Encounter History</SheetTitle>
            <SheetDescription>
              A log of your past combat encounters for the active campaign.
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-120px)]"> 
            <ScrollArea className="h-full"> 
              <div className="p-4 space-y-4">
                {encounterLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No encounters logged yet.</p>
                ) : (
                  encounterLog.map(log => (
                    <div key={log.id} className="p-3 border rounded-lg bg-card shadow">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(log.timestamp).toLocaleString()} - {log.roundsFought} Rounds
                      </p>
                      {log.survivingPlayerCharacters.length > 0 && (
                        <div className="mb-2">
                          <h5 className="font-semibold text-sm">Survivors:</h5>
                          <ul className="list-disc list-inside text-xs">
                            {log.survivingPlayerCharacters.map(pc => (
                              <li key={pc.name}>{pc.name} ({pc.currentHp}/{pc.maxHp} HP)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {log.defeatedCombatants.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-sm">Vanquished:</h5>
                          <ul className="list-disc list-inside text-xs">
                            {log.defeatedCombatants.map(dc => (
                              <li key={dc.name}>{dc.name} ({dc.type})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          <SheetModalFooter className="p-4 border-t">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetModalFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

