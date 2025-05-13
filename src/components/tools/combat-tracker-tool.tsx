
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, ChevronDown, Play, ShieldAlert, HeartCrack, RotateCcw, Users, Edit3 } from 'lucide-react';
import type { Combatant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';


const initialCombatants: Combatant[] = [];

export function CombatTrackerTool() {
  const [combatants, setCombatants] = useState<Combatant[]>(initialCombatants);
  const [name, setName] = useState('');
  const [hp, setHp] = useState('');
  const [maxHp, setMaxHp] = useState('');
  const [initiative, setInitiative] = useState('');
  const [type, setType] = useState<'player' | 'enemy'>('enemy');
  const [editingCombatantId, setEditingCombatantId] = useState<string | null>(null);

  const [round, setRound] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [combatStarted, setCombatStarted] = useState(false);

  const { toast } = useToast();

  const sortedCombatants = combatStarted 
    ? [...combatants].sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))
    : combatants;
  
  const currentTurnCombatantId = combatStarted && sortedCombatants.length > 0 ? sortedCombatants[turnIndex]?.id : null;

  const handleAddCombatant = () => {
    if (!name || !hp || !maxHp) {
      toast({ title: 'Missing Info', description: 'Name, HP, and Max HP are required.', variant: 'destructive' });
      return;
    }
    const newCombatant: Combatant = {
      id: editingCombatantId || String(Date.now()),
      name,
      type,
      hp: parseInt(hp),
      maxHp: parseInt(maxHp),
      initiative: initiative ? parseInt(initiative) : undefined,
      conditions: editingCombatantId ? combatants.find(c => c.id === editingCombatantId)?.conditions || [] : [],
    };

    if (editingCombatantId) {
        setCombatants(prev => prev.map(c => c.id === editingCombatantId ? newCombatant : c));
        toast({ title: "Combatant Updated", description: `${name} has been updated.` });
        setEditingCombatantId(null);
    } else {
        setCombatants(prev => [...prev, newCombatant]);
        toast({ title: "Combatant Added", description: `${name} has joined the fray.` });
    }
    
    setName(''); setHp(''); setMaxHp(''); setInitiative(''); setType('enemy');
  };

  const handleEditCombatant = (combatant: Combatant) => {
    setEditingCombatantId(combatant.id);
    setName(combatant.name);
    setHp(String(combatant.hp));
    setMaxHp(String(combatant.maxHp));
    setInitiative(combatant.initiative !== undefined ? String(combatant.initiative) : '');
    setType(combatant.type);
  };

  const handleRemoveCombatant = (id: string) => {
    setCombatants(prev => prev.filter(c => c.id !== id));
    toast({ title: "Combatant Removed", variant: "destructive" });
  };

  const handleHpChange = (id: string, newHp: number) => {
    setCombatants(prev => prev.map(c => c.id === id ? { ...c, hp: Math.max(0, Math.min(c.maxHp, newHp)) } : c));
  };
  
  const handleInitiativeChange = (id: string, newInitiative: number | undefined) => {
     setCombatants(prev => prev.map(c => c.id === id ? { ...c, initiative: newInitiative } : c));
  };

  const startCombat = () => {
    if (combatants.some(c => c.initiative === undefined)) {
      toast({ title: "Missing Initiative", description: "All combatants need an initiative score to start combat.", variant: "destructive"});
      return;
    }
    if (combatants.length < 2) {
      toast({ title: "Not Enough Combatants", description: "Need at least two combatants.", variant: "destructive"});
      return;
    }
    setRound(1);
    setTurnIndex(0);
    setCombatStarted(true);
    toast({ title: "Combat Started!", description: `Round ${round+1}, ${sortedCombatants[0]?.name}'s turn.`});
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
    setCombatants(prev => prev.map(c => ({...c, hp: c.maxHp, conditions: []}))); 
    toast({ title: "Combat Reset", description: "Ready for a new encounter."});
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{editingCombatantId ? "Edit Combatant" : "Add Combatant"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="combatant-name" className="text-xs">Name</Label>
            <Input id="combatant-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Orc" bsSize="sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="combatant-hp" className="text-xs">HP</Label>
              <Input id="combatant-hp" type="number" value={hp} onChange={e => setHp(e.target.value)} placeholder="25" bsSize="sm"/>
            </div>
            <div>
              <Label htmlFor="combatant-maxHp" className="text-xs">Max HP</Label>
              <Input id="combatant-maxHp" type="number" value={maxHp} onChange={e => setMaxHp(e.target.value)} placeholder="25" bsSize="sm"/>
            </div>
          </div>
          <div>
            <Label htmlFor="combatant-initiative" className="text-xs">Initiative</Label>
            <Input id="combatant-initiative" type="number" value={initiative} onChange={e => setInitiative(e.target.value)} placeholder="15" bsSize="sm"/>
          </div>
          <div>
            <Label htmlFor="combatant-type" className="text-xs">Type</Label>
            <Select value={type} onValueChange={(value: 'player' | 'enemy') => setType(value)}>
              <SelectTrigger id="combatant-type" className="h-9 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player" className="text-xs">Player</SelectItem>
                <SelectItem value="enemy" className="text-xs">Enemy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddCombatant} className="w-full" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> {editingCombatantId ? "Update" : "Add"}
          </Button>
        </CardFooter>
      </Card>
      
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
                <CardFooter className="text-xs text-muted-foreground pt-2">
                    Round: {round}
                </CardFooter>
            )}
        </Card>
      )}

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
                              type="number" 
                              value={c.initiative ?? ''} 
                              onChange={(e) => handleInitiativeChange(c.id, e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="Init"
                              className="w-12 h-7 text-xs p-1"
                            />
                          )}
                          {combatStarted && <span className="text-xs font-medium text-muted-foreground">Init: {c.initiative}</span>}
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEditCombatant(c)} className="h-6 w-6">
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive h-6 w-6">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
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
