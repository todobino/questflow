
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, ArrowRight, Play, ShieldAlert, Heart, RotateCcw, Users, Edit3, UserPlus, ShieldPlus, Bot, Dices, ShieldX, Shield as ShieldIcon } from 'lucide-react';
import type { Combatant, Character } from '@/lib/types';
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
  AlertDialogTrigger as ShadAlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

const initialCombatants: Combatant[] = [];

const playerColorClasses = [
  'bg-sky-100 dark:bg-sky-800',
  'bg-emerald-100 dark:bg-emerald-800',
  'bg-rose-100 dark:bg-rose-800',
  'bg-amber-100 dark:bg-amber-800',
  'bg-violet-100 dark:bg-violet-800',
  'bg-pink-100 dark:bg-pink-800',
  'bg-teal-100 dark:bg-teal-800',
  'bg-fuchsia-100 dark:bg-fuchsia-800',
];


export function CombatTrackerTool() {
  const { activeCampaign, characters: partyCharacters } = useCampaignContext();
  const [combatants, setCombatants] = useState<Combatant[]>(initialCombatants);

  const [isAddEnemyDialogOpen, setIsAddEnemyDialogOpen] = useState(false);
  const [enemyName, setEnemyName] = useState('');
  const [enemyHp, setEnemyHp] = useState('');
  const [enemyMaxHp, setEnemyMaxHp] = useState('');
  const [enemyInitiative, setEnemyInitiative] = useState('');

  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedPlayerCharacterId, setSelectedPlayerCharacterId] = useState<string | undefined>(undefined);
  const [playerInitiativeInput, setPlayerInitiativeInput] = useState('');

  const [round, setRound] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [combatStarted, setCombatStarted] = useState(false);

  const { toast } = useToast();

  const sortedCombatants = useMemo(() => {
    // Always sort by initiative if combat has started, otherwise maintain add order
    if (combatStarted) {
      return [...combatants].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
    }
    return combatants; 
  }, [combatants, combatStarted]);

  const currentTurnCombatantId = combatStarted && sortedCombatants.length > 0 ? sortedCombatants[turnIndex]?.id : null;

  const roll1d20 = () => Math.floor(Math.random() * 20) + 1;

  const handleAddEnemy = () => {
    if (!enemyName || !enemyHp || !enemyMaxHp) {
      toast({ title: 'Missing Info', description: 'Enemy Name, HP, and Max HP are required.', variant: 'destructive' });
      return;
    }
    const newEnemy: Combatant = {
      id: String(Date.now() + Math.random()),
      name: enemyName,
      type: 'enemy',
      hp: parseInt(enemyHp),
      maxHp: parseInt(enemyMaxHp),
      initiative: enemyInitiative ? parseInt(enemyInitiative) : undefined,
      conditions: [],
      isPlayerCharacter: false,
    };
    setCombatants(prev => [...prev, newEnemy]);
    setEnemyName(''); setEnemyHp(''); setEnemyMaxHp(''); setEnemyInitiative('');
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

    const initiativeValue = playerInitiativeInput !== '' ? parseInt(playerInitiativeInput, 10) : undefined;
    if (playerInitiativeInput !== '' && isNaN(initiativeValue!)) {
        toast({ title: "Invalid Initiative", description: "Initiative must be a number.", variant: "destructive" });
        return;
    }
    
    const playerIndex = partyCharacters.findIndex(p => p.id === characterToAdd.id);
    const displayColor = playerColorClasses[playerIndex % playerColorClasses.length];

    const newPlayerCombatant: Combatant = {
      id: String(Date.now() + Math.random()),
      name: characterToAdd.name,
      type: 'player',
      hp: characterToAdd.maxHp ?? 10,
      maxHp: characterToAdd.maxHp ?? 10,
      initiative: initiativeValue,
      conditions: [],
      initiativeModifier: characterToAdd.initiativeModifier ?? 0,
      isPlayerCharacter: true,
      originalCharacterId: characterToAdd.id,
      armorClass: characterToAdd.armorClass,
      displayColor: displayColor,
    };
    setCombatants(prev => [...prev, newPlayerCombatant]);
    setSelectedPlayerCharacterId(undefined);
    setPlayerInitiativeInput('');
    setIsAddPlayerDialogOpen(false);
  };

  const handleRollEntirePartyInitiative = () => {
    if (!activeCampaign || !partyCharacters) {
      return;
    }

    let newCombatantsList = [...combatants];
    let changed = false;

    partyCharacters
      .filter(char => char.campaignId === activeCampaign.id)
      .forEach((char, index) => {
        const existingCombatantIndex = newCombatantsList.findIndex(c => c.originalCharacterId === char.id);
        const displayColor = playerColorClasses[index % playerColorClasses.length];

        if (existingCombatantIndex === -1) { // Character not in combat yet
          const initiativeRoll = roll1d20() + (char.initiativeModifier ?? 0);
          newCombatantsList.push({
            id: String(Date.now() + Math.random() + index), // Ensure unique ID
            name: char.name,
            type: 'player',
            hp: char.maxHp ?? 10,
            maxHp: char.maxHp ?? 10,
            initiative: initiativeRoll,
            conditions: [],
            initiativeModifier: char.initiativeModifier ?? 0,
            isPlayerCharacter: true,
            originalCharacterId: char.id,
            armorClass: char.armorClass,
            displayColor: displayColor,
          });
          changed = true;
        } else if (newCombatantsList[existingCombatantIndex].initiative === undefined) { // Character in combat, but no initiative
          newCombatantsList[existingCombatantIndex] = {
            ...newCombatantsList[existingCombatantIndex],
            initiative: roll1d20() + (newCombatantsList[existingCombatantIndex].initiativeModifier ?? 0),
            armorClass: char.armorClass, // ensure AC is up to date
            displayColor: displayColor, // ensure color is assigned
          };
          changed = true;
        } else if (!newCombatantsList[existingCombatantIndex].displayColor) { // Assign color if missing
           newCombatantsList[existingCombatantIndex] = {
            ...newCombatantsList[existingCombatantIndex],
            displayColor: displayColor,
          };
          changed = true;
        }
      });

    if (changed) {
      setCombatants(newCombatantsList);
    }
  };


  const handleRemoveCombatant = (id: string) => {
    setCombatants(prev => prev.filter(c => c.id !== id));
  };

  const handleHpChange = (id: string, newHp: number) => {
    setCombatants(prev => prev.map(c => c.id === id ? { ...c, hp: Math.max(0, Math.min(c.maxHp ?? Infinity, newHp)) } : c));
  };

  const handleInitiativeChange = (id: string, newInitiativeVal: string) => {
     const newInitiative = newInitiativeVal === '' ? undefined : parseInt(newInitiativeVal, 10);
     if (newInitiativeVal !== '' && isNaN(newInitiative!)) {
         toast({ title: "Invalid Initiative", description: "Initiative must be a number.", variant: "destructive" });
         return;
     }
     setCombatants(prev => prev.map(c => c.id === id ? { ...c, initiative: newInitiative } : c));
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
    // Sorting is handled by useMemo when combatStarted becomes true
  };

  const nextTurn = () => {
    if (!combatStarted || sortedCombatants.length === 0) return;
    let newTurnIndex = turnIndex + 1;
    let newRound = round;
    if (newTurnIndex >= sortedCombatants.length) {
      newTurnIndex = 0;
      newRound += 1;
    }
    setTurnIndex(newTurnIndex);
    setRound(newRound);
  };

  const endCombat = () => { 
    setRound(0);
    setTurnIndex(0);
    setCombatStarted(false);
    // Optionally reset HP, conditions, and initiative for all combatants
    // setCombatants(prev => prev.map(c => ({...c, hp: c.maxHp, conditions: [], initiative: undefined })));
  };

  useEffect(() => {
    if (isAddPlayerDialogOpen) {
      setPlayerInitiativeInput('');
    }
  }, [isAddPlayerDialogOpen, selectedPlayerCharacterId]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => {setIsAddPlayerDialogOpen(true); setSelectedPlayerCharacterId(undefined); setPlayerInitiativeInput('');}} variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" /> Add Player
          </Button>
          <Button onClick={() => setIsAddEnemyDialogOpen(true)} variant="outline" size="sm">
            <Bot className="mr-2 h-4 w-4" /> Add Enemy
          </Button>
        </div>
        {!combatStarted && (
          <Button onClick={handleRollEntirePartyInitiative} className="w-full" size="sm" variant="default">
            <Users className="mr-2 h-4 w-4" /> Roll Entire Party Initiative
          </Button>
        )}
      </div>

      <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player Character to Combat</DialogTitle>
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
            <DialogTitle>Add New Enemy</DialogTitle>
            <DialogDescription>Enter the details for the new enemy.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div>
              <Label htmlFor="new-enemy-name" className="text-xs">Name</Label>
              <Input id="new-enemy-name" value={enemyName} onChange={e => setEnemyName(e.target.value)} placeholder="e.g., Goblin Boss" bsSize="sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="new-enemy-hp" className="text-xs">HP</Label>
                <Input id="new-enemy-hp" type="number" value={enemyHp} onChange={e => setEnemyHp(e.target.value)} placeholder="30" bsSize="sm"/>
              </div>
              <div>
                <Label htmlFor="new-enemy-maxHp" className="text-xs">Max HP</Label>
                <Input id="new-enemy-maxHp" type="number" value={enemyMaxHp} onChange={e => setEnemyMaxHp(e.target.value)} placeholder="30" bsSize="sm"/>
              </div>
            </div>
            <div>
              <Label htmlFor="new-enemy-initiative" className="text-xs">Initiative (Optional)</Label>
              <Input id="new-enemy-initiative" type="number" value={enemyInitiative} onChange={e => setEnemyInitiative(e.target.value)} placeholder="12" bsSize="sm"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEnemyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEnemy}>Add Enemy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-grow flex flex-col min-h-0">
        <div className="p-1.5 flex-shrink-0">
          <h3 className="flex items-center text-lg font-semibold">
            <Users className="mr-2 h-5 w-5 text-primary" /> Initiative Order
            {combatStarted && round > 0 && (
              <span className="ml-2 text-sm text-muted-foreground font-medium">
                (Round {round} - {sortedCombatants[turnIndex]?.name}'s turn)
              </span>
            )}
          </h3>
        </div>
        <div className="p-1.5 flex-grow overflow-y-auto">
          {sortedCombatants.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-4">Add combatants to begin.</p>
          ) : (
            <ul className="space-y-2.5">
              {sortedCombatants.map((c) => (
                <li 
                  key={c.id} 
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg border shadow-lg transition-all duration-300',
                    c.id === currentTurnCombatantId ? 'ring-2 ring-primary scale-[1.02]' : 'opacity-90 hover:opacity-100',
                    c.displayColor || 'bg-card' // Fallback to card background
                  )}
                >
                  <div className={cn(
                      "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold",
                      c.type === 'player' ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {c.initiative ?? '-'}
                  </div>

                  <div className="flex-grow space-y-0.5">
                    <h4 className={cn(
                        "font-semibold text-md",
                        c.type === 'player' ? 'text-primary-darker' : 'text-destructive-darker', // Use custom darker shades or adjust theme
                        'dark:text-foreground' // Ensure readability in dark mode
                      )}
                    >
                      {c.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground dark:text-gray-400">
                      <div className="flex items-center">
                        <Heart className="mr-1 h-3.5 w-3.5 text-red-500" />
                        HP:
                        <Input
                          type="number"
                          value={String(c.hp)}
                          onChange={(e) => handleHpChange(c.id, parseInt(e.target.value))}
                          className="w-12 h-6 ml-1 mr-0.5 text-xs p-1 bg-transparent border-slate-400 dark:border-slate-600 focus:ring-primary focus:border-primary"
                          min="0"
                          max={c.maxHp}
                        />
                        / {c.maxHp}
                      </div>
                      <div className="flex items-center">
                        <ShieldIcon className="mr-1 h-3.5 w-3.5 text-sky-600" />
                        AC: {c.armorClass ?? 'N/A'}
                      </div>
                    </div>
                    {c.conditions.length > 0 && (
                      <span className="text-[10px] text-yellow-700 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-700/40 px-1.5 py-0.5 rounded-full block mt-1">
                        {c.conditions.join(', ')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <AlertDialog>
                      <ShadAlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ShadAlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Remove {c.name}?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveCombatant(c.id)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {combatants.length > 0 && (
        <div className="shadow-md mt-2 flex-shrink-0 bg-card border-t">
            <div className="p-2 space-y-2">
                {!combatStarted ? (
                    <Button onClick={startCombat} className="w-full bg-success text-success-foreground hover:bg-success/90" size="sm">
                        <Play className="mr-2 h-4 w-4" /> Start Combat
                    </Button>
                ) : (
                    <Button onClick={nextTurn} className="w-full" size="sm">
                        Next Turn <ArrowRight className="ml-2 h-4 w-4" /> 
                    </Button>
                )}
                  <Button 
                    onClick={endCombat} 
                    variant="outline" 
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive hover:border-destructive" 
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
