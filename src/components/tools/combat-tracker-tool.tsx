
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, ChevronDown, Play, ShieldAlert, HeartCrack, RotateCcw, Users, Edit3, UserPlus, ShieldPlus, Bot } from 'lucide-react';
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
  DialogTrigger,
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
  AlertDialogTrigger as ShadAlertDialogTrigger, // Alias to avoid conflict if used locally
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

const initialCombatants: Combatant[] = [];

export function CombatTrackerTool() {
  const { activeCampaign, characters: partyCharacters } = useCampaignContext();
  const [combatants, setCombatants] = useState<Combatant[]>(initialCombatants);
  
  // State for "Add Enemy" dialog
  const [isAddEnemyDialogOpen, setIsAddEnemyDialogOpen] = useState(false);
  const [enemyName, setEnemyName] = useState('');
  const [enemyHp, setEnemyHp] = useState('');
  const [enemyMaxHp, setEnemyMaxHp] = useState('');
  const [enemyInitiative, setEnemyInitiative] = useState('');

  // State for "Add Player" dialog
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedPlayerCharacterId, setSelectedPlayerCharacterId] = useState<string | undefined>(undefined);

  // State for editing combatant in list (existing logic)
  const [editingCombatantId, setEditingCombatantId] = useState<string | null>(null);
  // Temp state for the inline edit form (if we re-introduce it or use a dialog for edit)
  const [editFormName, setEditFormName] = useState('');
  const [editFormHp, setEditFormHp] = useState('');
  const [editFormMaxHp, setEditFormMaxHp] = useState('');
  const [editFormInitiative, setEditFormInitiative] = useState('');


  const [round, setRound] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [combatStarted, setCombatStarted] = useState(false);

  const { toast } = useToast();

  const sortedCombatants = useMemo(() => {
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
    toast({ title: "Enemy Added", description: `${enemyName} has joined the fray.` });
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

    const newPlayerCombatant: Combatant = {
      id: String(Date.now() + Math.random()),
      name: characterToAdd.name,
      type: 'player',
      hp: characterToAdd.maxHp ?? 10,
      maxHp: characterToAdd.maxHp ?? 10,
      initiative: undefined, // To be rolled
      conditions: [],
      initiativeModifier: characterToAdd.initiativeModifier ?? 0,
      isPlayerCharacter: true,
      originalCharacterId: characterToAdd.id,
    };
    setCombatants(prev => [...prev, newPlayerCombatant]);
    toast({ title: "Player Added", description: `${characterToAdd.name} has joined the combat.` });
    setSelectedPlayerCharacterId(undefined);
    setIsAddPlayerDialogOpen(false);
  };
  
  const handleRollEntirePartyInitiative = () => {
    if (!activeCampaign || !partyCharacters) {
      toast({ title: "No Active Campaign/Party", description: "Cannot roll initiative without an active campaign and party.", variant: "destructive" });
      return;
    }

    let newCombatants = [...combatants];
    let updatedExisting = false;

    // Add party members not yet in combat
    partyCharacters
      .filter(char => char.campaignId === activeCampaign.id)
      .forEach(char => {
        if (!newCombatants.some(c => c.originalCharacterId === char.id)) {
          const initiativeRoll = roll1d20() + (char.initiativeModifier ?? 0);
          newCombatants.push({
            id: String(Date.now() + Math.random()),
            name: char.name,
            type: 'player',
            hp: char.maxHp ?? 10,
            maxHp: char.maxHp ?? 10,
            initiative: initiativeRoll,
            conditions: [],
            initiativeModifier: char.initiativeModifier ?? 0,
            isPlayerCharacter: true,
            originalCharacterId: char.id,
          });
        }
      });

    // Roll for existing player combatants without initiative
    newCombatants = newCombatants.map(c => {
      if (c.isPlayerCharacter && c.initiative === undefined) {
        updatedExisting = true;
        return { ...c, initiative: roll1d20() + (c.initiativeModifier ?? 0) };
      }
      return c;
    });

    setCombatants(newCombatants);
    toast({ title: "Party Initiative Rolled!", description: "Initiative set for all party members." });
  };


  // Edit existing combatant (dialog-based, simplified)
  const openEditDialog = (combatant: Combatant) => {
    setEditingCombatantId(combatant.id);
    setEditFormName(combatant.name);
    setEditFormHp(String(combatant.hp));
    setEditFormMaxHp(String(combatant.maxHp));
    setEditFormInitiative(combatant.initiative !== undefined ? String(combatant.initiative) : '');
    // Consider opening a specific edit dialog here if needed. For now, this pre-fills a hypothetical general edit form.
    // For simplicity, direct list item editing will be kept. This function is a placeholder for dialog-based editing.
    toast({title: "Editing", description: `Prepare to edit ${combatant.name}. Inline editing is active.`})
  };
  
  // This function is now for the *list item* editing primarily, not the top-level form
  const handleUpdateCombatantFromList = (id: string, updates: Partial<Combatant>) => {
    setCombatants(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };


  const handleRemoveCombatant = (id: string) => {
    setCombatants(prev => prev.filter(c => c.id !== id));
    toast({ title: "Combatant Removed", variant: "destructive" });
  };

  const handleHpChange = (id: string, newHp: number) => {
    setCombatants(prev => prev.map(c => c.id === id ? { ...c, hp: Math.max(0, Math.min(c.maxHp, newHp)) } : c));
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
    if (combatants.length < 1) { // Changed to 1, technically can start with 1
      toast({ title: "Not Enough Combatants", description: "Need at least one combatant.", variant: "destructive"});
      return;
    }
    const sorted = [...combatants].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
    setCombatants(sorted); // Set combatants to the sorted list to lock order
    setRound(1);
    setTurnIndex(0);
    setCombatStarted(true);
    toast({ title: "Combat Started!", description: `Round 1, ${sorted[0]?.name}'s turn.`});
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
    toast({ title: "Next Turn", description: `Round ${newRound}, ${sortedCombatants[newTurnIndex]?.name}'s turn.`});
  };
  
  const resetCombat = () => {
    setRound(0);
    setTurnIndex(0);
    setCombatStarted(false);
    // Reset HP and conditions, keep initiative for potential re-use or manual adjustment
    setCombatants(prev => prev.map(c => ({...c, hp: c.maxHp, conditions: []}))); 
    toast({ title: "Combat Reset", description: "Ready for a new encounter."});
  };

  return (
    <div className="space-y-4">
      {/* Add Player/Enemy Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => setIsAddPlayerDialogOpen(true)} variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add Player
        </Button>
        <Button onClick={() => setIsAddEnemyDialogOpen(true)} variant="outline" size="sm">
          <Bot className="mr-2 h-4 w-4" /> Add Enemy
        </Button>
      </div>
      <Button onClick={handleRollEntirePartyInitiative} className="w-full" size="sm" variant="default">
        <Users className="mr-2 h-4 w-4" /> Roll Entire Party Initiative
      </Button>

      {/* Add Player Dialog */}
      <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player Character to Combat</DialogTitle>
            <DialogDescription>Select a player character from your active party.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Select onValueChange={setSelectedPlayerCharacterId} value={selectedPlayerCharacterId}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPlayerCharacter} disabled={!selectedPlayerCharacterId}>Add Selected Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Enemy Dialog */}
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
      
      {/* Combat Controls Card (Start/Next/Reset) */}
      {combatants.length > 0 && (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg">Combat Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {!combatStarted ? (
                    <Button onClick={startCombat} className="w-full bg-success text-success-foreground hover:bg-success/90" size="sm">
                        <Play className="mr-2 h-4 w-4" /> Start Combat
                    </Button>
                ) : (
                    <Button onClick={nextTurn} className="w-full" size="sm">
                        Next Turn <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                )}
                  <Button onClick={resetCombat} variant="outline" className="w-full" size="sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset Combat
                </Button>
            </CardContent>
              {combatStarted && (
                <CardFooter className="text-xs text-muted-foreground pt-2 justify-center">
                    Round: {round}
                </CardFooter>
            )}
        </Card>
      )}

      {/* Initiative Order Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg"><Users className="mr-2 h-5 w-5 text-primary" /> Initiative Order</CardTitle>
          <CardDescription className="text-xs">{combatStarted ? `Round ${round} - ${sortedCombatants[turnIndex]?.name || 'Nobody'}'s turn.` : "Order by initiative once combat starts."}</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCombatants.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-4">Add combatants to begin.</p>
          ) : (
            <ScrollArea className="h-[250px] pr-2">
              <ul className="space-y-2">
                {sortedCombatants.map((c) => (
                  <li key={c.id} className={`rounded-md border p-2.5 text-xs transition-all duration-300 ${c.id === currentTurnCombatantId ? 'ring-2 ring-primary shadow-md scale-[1.01]' : 'opacity-90 hover:opacity-100'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className={`font-semibold ${c.type === 'player' ? 'text-blue-600' : 'text-red-600'}`}>{c.name}</h4>
                      <div className="flex items-center gap-1.5">
                          {!combatStarted && (
                            <Input 
                              type="text" // Allow empty string
                              value={c.initiative === undefined ? '' : String(c.initiative)} 
                              onChange={(e) => handleInitiativeChange(c.id, e.target.value)}
                              placeholder="Init"
                              className="w-12 h-7 text-xs p-1"
                            />
                          )}
                          {combatStarted && <span className="text-xs font-medium text-muted-foreground">Init: {c.initiative ?? 'N/A'}</span>}
                        
                        <AlertDialog>
                          <ShadAlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive h-6 w-6">
                              <Trash2 className="h-3.5 w-3.5" />
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
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                          {c.hp <= 0 ? <HeartCrack className="mr-1 h-3.5 w-3.5 text-destructive" /> : <ShieldAlert className="mr-1 h-3.5 w-3.5 text-green-500" />}
                          HP: 
                          <Input 
                            type="number"
                            value={c.hp}
                            onChange={(e) => handleHpChange(c.id, parseInt(e.target.value))}
                            className="w-12 h-6 ml-1 mr-1 text-xs p-1"
                            min="0"
                            max={c.maxHp}
                          /> / {c.maxHp}
                      </div>
                      {c.conditions.length > 0 && (
                        <span className="text-[10px] text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded-full">{c.conditions.join(', ')}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


