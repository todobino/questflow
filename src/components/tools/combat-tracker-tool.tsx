
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, UserPlus, Bot, Dices, ShieldX, Shield as ShieldIcon, Trash2, MinusCircle, History, Users as UsersIcon, ArrowRight, Heart, ShieldPlus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';

const initialCombatants: Combatant[] = [];

const PLAYER_CHARACTER_COLOR = 'bg-emerald-100 dark:bg-emerald-800/70';
const ALLY_COLOR = 'bg-slate-200 dark:bg-slate-700/70';
const ENEMY_COLOR = 'bg-red-100 dark:bg-red-800/70';


export function CombatTrackerTool() {
  const { activeCampaign, characters: partyCharacters } = useCampaignContext();
  const [combatants, setCombatants] = useState<Combatant[]>(initialCombatants);

  const [isAddEnemyDialogOpen, setIsAddEnemyDialogOpen] = useState(false);
  const [newCombatantTypeForDialog, setNewCombatantTypeForDialog] = useState<'enemy' | 'ally'>('enemy');
  const [enemyName, setEnemyName] = useState('');
  const [enemyHp, setEnemyHp] = useState('');
  const [enemyMaxHp, setEnemyMaxHp] = useState('');
  const [enemyInitiative, setEnemyInitiative] = useState(''); // Stores modifier
  const [enemyAC, setEnemyAC] = useState('');
  const [enemyQuantity, setEnemyQuantity] = useState('1');
  const [initiativeRollType, setInitiativeRollType] = useState<'group' | 'individual'>('individual');


  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedPlayerCharacterId, setSelectedPlayerCharacterId] = useState<string | undefined>(undefined);
  const [playerInitiativeInput, setPlayerInitiativeInput] = useState('');

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
      return [...combatants].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
  }, [combatants]);

  const currentTurnCombatantId = combatStarted && sortedCombatants.length > 0 ? sortedCombatants[turnIndex]?.id : null;

  const roll1d20 = () => Math.floor(Math.random() * 20) + 1;

  const handleAddEnemyOrAlly = () => {
    if (!enemyName || !enemyHp) {
      toast({ title: 'Missing Info', description: 'Name and Current HP are required.', variant: 'destructive' });
      return;
    }
    const quantity = parseInt(enemyQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Invalid Quantity', description: 'Quantity must be a positive number.', variant: 'destructive' });
      return;
    }

    const currentHpValue = parseInt(enemyHp, 10);
    if (isNaN(currentHpValue)) {
        toast({ title: 'Invalid Current HP', description: 'Current HP must be a number.', variant: 'destructive' });
        return;
    }
    
    let initiativeModifierValue = parseInt(enemyInitiative.trim(), 10);
    if (isNaN(initiativeModifierValue)) { 
        initiativeModifierValue = 0;
    }


    const maxHpValue = enemyMaxHp.trim() !== '' ? parseInt(enemyMaxHp, 10) : currentHpValue;
    if (enemyMaxHp.trim() !== '' && isNaN(maxHpValue)) {
        toast({ title: 'Invalid Max HP', description: 'Max HP must be a number or empty (will default to Current HP).', variant: 'destructive' });
        return;
    }
    if (currentHpValue > maxHpValue) {
        toast({ title: 'Invalid HP', description: 'Current HP cannot exceed Max HP.', variant: 'destructive' });
        return;
    }

    const acValue = enemyAC.trim() !== '' ? parseInt(enemyAC, 10) : undefined;
    if (enemyAC.trim() !== '' && (acValue === undefined || isNaN(acValue) || acValue < 0) ) {
        toast({ title: 'Invalid AC', description: 'Armor Class must be a non-negative number or empty.', variant: 'destructive' });
        return;
    }


    const newCombatantsBatch: Combatant[] = [];
    let groupInitiativeRoll: number | undefined = undefined;

    if (quantity > 1 && initiativeRollType === 'group') {
        groupInitiativeRoll = roll1d20() + initiativeModifierValue;
    }

    for (let i = 0; i < quantity; i++) {
      const combatantName = quantity > 1 ? `${enemyName} ${i + 1}` : enemyName;
      
      let finalInitiative: number;
      if (groupInitiativeRoll !== undefined) {
          finalInitiative = groupInitiativeRoll;
      } else {
          finalInitiative = roll1d20() + initiativeModifierValue;
      }
      
      const combatantType = newCombatantTypeForDialog;
      let displayColor = ENEMY_COLOR;

      if (combatantType === 'ally') {
        displayColor = ALLY_COLOR;
      }


      const newCombatant: Combatant = {
        id: String(Date.now() + Math.random() + i),
        name: combatantName,
        type: combatantType, 
        hp: currentHpValue,
        maxHp: maxHpValue,
        armorClass: acValue,
        initiative: finalInitiative,
        conditions: [],
        isPlayerCharacter: false,
        displayColor: displayColor,
      };
      newCombatantsBatch.push(newCombatant);
    }
    
    setCombatants(prev => [...prev, ...newCombatantsBatch].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
    setEnemyName(''); setEnemyHp(''); setEnemyMaxHp(''); setEnemyAC(''); setEnemyInitiative(''); setEnemyQuantity('1'); setInitiativeRollType('individual');
    setIsAddEnemyDialogOpen(false);
  };

  const availablePlayerCharacters = useMemo(() => {
    if (!activeCampaign || !partyCharacters) return [];
    const combatantPlayerIds = combatants
      .filter(c => c.isPlayerCharacter && c.originalCharacterId)
      .map(c => c.originalCharacterId);
    return partyCharacters.filter(p => p.campaignId === activeCampaign.id && !combatantPlayerIds.includes(p.id));
  }, [activeCampaign, partyCharacters, combatants]);

  const handleRollPlayerDialogInitiative = () => {
    if (!selectedPlayerCharacterId) {
      toast({ title: 'No Player Selected', description: 'Please select a player to roll initiative for.', variant: 'destructive' });
      return;
    }
    const character = partyCharacters.find(p => p.id === selectedPlayerCharacterId);
    if (!character) {
      toast({ title: 'Character Not Found', variant: 'destructive' });
      return;
    }
    const roll = roll1d20();
    const finalInitiative = roll + (character.initiativeModifier || 0);
    setPlayerInitiativeInput(String(finalInitiative));
  };

  const handleAddPlayerCharacter = () => {
    if (!selectedPlayerCharacterId) {
      toast({ title: 'No Player Selected', description: 'Please select a player character.', variant: 'destructive' });
      return;
    }
    const characterToAdd = partyCharacters.find(p => p.id === selectedPlayerCharacterId);
    if (!characterToAdd) {
      toast({ title: 'Character Not Found', variant: 'destructive' });
      return;
    }

    const initiativeValue = playerInitiativeInput.trim() !== '' ? parseInt(playerInitiativeInput, 10) : undefined;
    if (playerInitiativeInput.trim() !== '' && (initiativeValue === undefined || isNaN(initiativeValue))) {
        toast({ title: "Invalid Initiative", description: "Initiative must be a number.", variant: "destructive" });
        return;
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
    setSelectedPlayerCharacterId(undefined);
    setPlayerInitiativeInput('');
    setIsAddPlayerDialogOpen(false);
  };

 const handleAddPartyToCombat = () => {
    if (!activeCampaign || !partyCharacters) {
      toast({ title: "No Active Campaign", description: "Please select an active campaign with party members.", variant: "destructive" });
      return;
    }

    let updatedCombatantsList = [...combatants];

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
          updatedCombatantsList.push({
            id: String(Date.now() + Math.random() + index), 
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
    updatedCombatantsList.sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
    setCombatants(updatedCombatantsList);
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
      toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive" });
      return;
    }

    setCombatants(prev => prev.map(c => {
      if (c.id === combatantId) {
        let newHp;
        if (type === 'hit') {
          newHp = Math.max(0, c.hp - amount);
        } else { 
          newHp = Math.min(c.maxHp, c.hp + amount);
        }
        return { ...c, hp: newHp };
      }
      return c;
    }));
    setOpenPopoverId(null); 
    setHitHealAmount('');
  };

  const startCombat = () => {
    if (combatants.some(c => c.initiative === undefined)) {
      toast({ title: "Missing Initiative", description: "All combatants need an initiative score to start combat.", variant: "destructive"});
      return;
    }
    if (combatants.length < 1) {
      toast({ title: "Not Enough Combatants", description: "Need at least one combatant.", variant: "destructive"});
      return;
    }
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
     const newLogEntry: EncounterLogEntry = {
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
      campaignId: activeCampaign?.id,
      roundsFought: round,
      survivingPlayerCharacters: combatants
        .filter(c => c.isPlayerCharacter && c.hp > 0)
        .map(c => ({ name: c.name, currentHp: c.hp, maxHp: c.maxHp })),
      defeatedCombatants: combatants
        .filter(c => c.hp <= 0)
        .map(c => ({ name: c.name, type: c.type })),
    };
    setEncounterLog(prevLog => [newLogEntry, ...prevLog]);

    setRound(0);
    setTurnIndex(0);
    setCombatStarted(false);
    setCombatants([]); 
  };

  useEffect(() => {
    if (isAddPlayerDialogOpen) {
      setPlayerInitiativeInput('');
    }
  }, [isAddPlayerDialogOpen, selectedPlayerCharacterId]);

  useEffect(() => {
    if (roundChangeMessage) {
      const timer = setTimeout(() => setRoundChangeMessage(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [roundChangeMessage]);


  return (
    <div className="flex flex-col h-full">
      {roundChangeMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <span className={`text-5xl sm:text-6xl md:text-7xl font-extrabold animate-explode-text text-foreground drop-shadow-lg`}>
            {roundChangeMessage}
          </span>
        </div>
      )}
      <div className="flex-shrink-0 mb-2">
         <div className="grid grid-cols-2 gap-2">
           <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full hover:bg-background hover:border-primary hover:text-primary"
                    >
                        Add Combatant 
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem onClick={() => {setIsAddPlayerDialogOpen(true); setSelectedPlayerCharacterId(undefined); setPlayerInitiativeInput('');}}>
                    <UserPlus className="mr-2 h-4 w-4" /> Player
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setNewCombatantTypeForDialog('ally'); setIsAddEnemyDialogOpen(true); }}>
                    <ShieldPlus className="mr-2 h-4 w-4" /> Ally
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setNewCombatantTypeForDialog('enemy'); setIsAddEnemyDialogOpen(true); }}>
                    <Bot className="mr-2 h-4 w-4" /> Enemy
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleAddPartyToCombat} className="w-full" size="sm" variant="default" disabled={combatStarted}>
                <UsersIcon className="mr-2 h-4 w-4" /> Add Party
            </Button>
        </div>
      </div>

      <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to Combat</DialogTitle>
            <DialogDescription>Select a player character from your active party.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Select
              onValueChange={(value) => {
                setSelectedPlayerCharacterId(value);
                setPlayerInitiativeInput('');
              }}
              value={selectedPlayerCharacterId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player character" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayerCharacters.length > 0 ? (
                  availablePlayerCharacters.map(char => (
                    <SelectItem key={char.id} value={char.id}>{char.name} (Lvl {char.level})</SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No available players.</div>
                )}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                id="player-initiative"
                type="number"
                value={playerInitiativeInput}
                onChange={e => setPlayerInitiativeInput(e.target.value)}
                placeholder="Initiative"
                bsSize="sm"
                className="flex-grow"
              />
              <Button onClick={handleRollPlayerDialogInitiative} variant="outline" size="sm" disabled={!selectedPlayerCharacterId}>
                <Dices className="mr-2 h-4 w-4" /> Roll d20
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPlayerCharacter} disabled={!selectedPlayerCharacterId}>Add Selected Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddEnemyDialogOpen} onOpenChange={setIsAddEnemyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {newCombatantTypeForDialog.charAt(0).toUpperCase() + newCombatantTypeForDialog.slice(1)}</DialogTitle>
            <DialogDescription>Enter the details for the new {newCombatantTypeForDialog}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div>
              <Label htmlFor="new-combatant-name" className="text-xs">Name</Label>
              <Input id="new-combatant-name" value={enemyName} onChange={e => setEnemyName(e.target.value)} placeholder={newCombatantTypeForDialog === 'ally' ? "e.g., Town Guard Captain" : "e.g., Goblin Boss"} bsSize="sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-combatant-hp" className="text-xs">Current HP</Label>
                <Input id="new-combatant-hp" type="number" value={enemyHp} onChange={e => setEnemyHp(e.target.value)} placeholder="30" bsSize="sm"/>
              </div>
              <div>
                <Label htmlFor="new-combatant-maxHp" className="text-xs">Max HP (Optional)</Label>
                <Input id="new-combatant-maxHp" type="number" value={enemyMaxHp} onChange={e => setEnemyMaxHp(e.target.value)} placeholder="30" bsSize="sm"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="new-combatant-ac" className="text-xs">Armor Class (Optional)</Label>
                    <Input id="new-combatant-ac" type="number" value={enemyAC} onChange={e => setEnemyAC(e.target.value)} placeholder="15" bsSize="sm"/>
                </div>
                <div>
                    <Label htmlFor="new-combatant-initiative-modifier" className="text-xs">Initiative Modifier</Label>
                    <Input id="new-combatant-initiative-modifier" type="number" value={enemyInitiative} onChange={e => setEnemyInitiative(e.target.value)} placeholder="e.g., 2 or -1" bsSize="sm"/>
                </div>
            </div>
            <div>
                <Label htmlFor="new-combatant-quantity" className="text-xs">Quantity</Label>
                <Input id="new-combatant-quantity" type="number" value={enemyQuantity} onChange={e => setEnemyQuantity(e.target.value)} placeholder="1" bsSize="sm" min="1"/>
            </div>
            {parseInt(enemyQuantity, 10) > 1 && (
                <div className="space-y-2">
                    <Label className="text-xs">Initiative Rolling</Label>
                    <RadioGroup
                        value={initiativeRollType}
                        onValueChange={(value: 'group' | 'individual') => setInitiativeRollType(value)}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="group" id="roll-group" />
                        <Label htmlFor="roll-group" className="text-xs font-normal">Roll as Group</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="roll-individual" />
                        <Label htmlFor="roll-individual" className="text-xs font-normal">Roll Individually</Label>
                        </div>
                    </RadioGroup>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEnemyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEnemyOrAlly}>Add {parseInt(enemyQuantity) > 1 && newCombatantTypeForDialog === 'enemy' ? 'Enemies' : newCombatantTypeForDialog.charAt(0).toUpperCase() + newCombatantTypeForDialog.slice(1)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-grow flex flex-col min-h-0">
        <div className="p-1.5 flex-shrink-0 flex items-center justify-between">
          <h3 className="flex items-center text-lg font-semibold">
            <UsersIcon className="mr-2 h-5 w-5 text-primary" /> Initiative Order
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
        </div>
        <div className="px-2 py-1.5 flex-grow overflow-y-auto">
          {sortedCombatants.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-4">Add combatants to begin.</p>
          ) : (
            <ul className="space-y-2.5">
              {sortedCombatants.map((c) => {
                const hpPercentage = c.maxHp > 0 ? (c.hp / c.maxHp) * 100 : 0;
                const isHpLow = hpPercentage < 20;
                return (
                <Popover key={c.id} open={openPopoverId === c.id} onOpenChange={(isOpen) => {
                    if (!isOpen) setOpenPopoverId(null);
                    else { setOpenPopoverId(c.id); setHitHealAmount(''); }
                }}>
                    <PopoverTrigger asChild>
                        <li
                        className={cn(
                            'relative flex items-center gap-3 p-2.5 rounded-lg border shadow-lg transition-all duration-300 cursor-pointer',
                            c.id === currentTurnCombatantId ? 'ring-2 ring-primary scale-[1.02]' : 'opacity-90 hover:opacity-100',
                            c.hp <= 0 ? 'opacity-50 grayscale' : '',
                            c.displayColor || (c.type === 'enemy' ? ENEMY_COLOR : ALLY_COLOR) 
                        )}
                        >
                        <div className={cn(
                            "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold",
                            c.type === 'player' && c.isPlayerCharacter ? "bg-primary/90 text-primary-foreground dark:bg-primary-foreground dark:text-primary" : "bg-slate-600/90 text-slate-50 dark:bg-slate-300 dark:text-slate-800"
                            )}
                        >
                            {c.initiative ?? '-'}
                        </div>

                        <div className="flex-grow flex flex-col min-w-0">
                            <h4 className={cn(
                                "font-semibold text-md truncate",
                                c.type === 'player' && c.isPlayerCharacter ? 'text-primary-darker dark:text-foreground' : 'text-foreground'
                            )}
                            >
                            {c.name}
                            </h4>
                                                      
                            {c.conditions.length > 0 && (
                            <span className="text-[10px] text-yellow-700 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-700/40 px-1.5 py-0.5 rounded-full block mt-0.5 text-left truncate">
                                {c.conditions.join(', ')}
                            </span>
                            )}
                            
                             <div className="w-full mt-1">
                                <div className="flex items-center justify-between text-xs mb-0.5">
                                    <span className="flex items-center text-muted-foreground">
                                      <Heart className="mr-1 h-3 w-3 text-red-500" /> 
                                      {c.hp} / {c.maxHp}
                                    </span>
                                    <span className="text-muted-foreground">{Math.round(hpPercentage)}%</span>
                                </div>
                                <Progress 
                                    value={hpPercentage} 
                                    className={cn(
                                    "h-1.5 w-full",
                                     isHpLow ? '[&>div]:bg-destructive' : (c.displayColor === PLAYER_CHARACTER_COLOR ? '[&>div]:bg-primary dark:[&>div]:bg-foreground' : '[&>div]:bg-slate-600 dark:[&>div]:bg-slate-400')
                                    )} 
                                />
                            </div>
                        </div>
                        
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                            {c.armorClass !== undefined && (
                                <div className="flex items-center text-xs bg-background/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm">
                                <ShieldIcon className="mr-1 h-3.5 w-3.5 text-sky-600" />
                                <span className="font-semibold">{c.armorClass}</span>
                                </div>
                            )}
                             <Button 
                                variant="ghost" 
                                size="icon-sm" 
                                className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCombatantToDeleteId(c.id);
                                    setIsDeleteConfirmOpen(true);
                                    setOpenPopoverId(null); // Close popover when opening delete dialog
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete {c.name}</span>
                            </Button>
                        </div>
                        </li>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" side="bottom" align="end">
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
              )})}
            </ul>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {combatants.find(cb => cb.id === combatantToDeleteId)?.name || 'Combatant'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCombatantToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCombatant}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Encounter History</SheetTitle>
            <SheetDescription>
              A log of your past combat encounters for the active campaign.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]"> 
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
           <SheetFooter className="p-4 border-t">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>


      {combatants.length > 0 && (
         <div className="shadow-md flex-shrink-0 bg-card border-t p-2 mt-auto">
            <div className="flex items-center gap-2">
                {!combatStarted ? (
                    <Button onClick={startCombat} className="flex-1 bg-success text-success-foreground hover:bg-success/90" size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Start Combat
                    </Button>
                ) : (
                    <Button onClick={nextTurn} className="flex-1" size="sm">
                        Next Turn <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                  <Button
                    onClick={endCombat}
                    variant="outline"
                    className="bg-muted border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    size="sm"
                  >
                    <ShieldX className="mr-2 h-4 w-4" /> End Combat
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}

