'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, ChevronUp, ChevronDown, Play, ShieldAlert, HeartCrack, RotateCcw, Users, Edit3 } from 'lucide-react';
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

const initialCombatants: Combatant[] = [
  // { id: 'p1', name: 'Elara', type: 'player', hp: 25, maxHp: 25, initiative: 18, conditions: [] },
  // { id: 'e1', name: 'Goblin Archer', type: 'enemy', hp: 12, maxHp: 12, initiative: 15, conditions: [] },
  // { id: 'p2', name: 'Grom', type: 'player', hp: 32, maxHp: 32, initiative: 10, conditions: ['poisoned'] },
  // { id: 'e2', name: 'Goblin Boss', type: 'enemy', hp: 27, maxHp: 27, initiative: 12, conditions: [] },
];


export default function CombatTrackerPage() {
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
    setCombatants(prev => prev.map(c => ({...c, hp: c.maxHp, conditions: []}))); // Heal all and clear conditions
    toast({ title: "Combat Reset", description: "Ready for a new encounter."});
  };

  return (
    <>
      <PageHeader
        title="Combat Tracker"
        description="Manage initiative, track turns, damage, and status effects for thrilling encounters."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{editingCombatantId ? "Edit Combatant" : "Add Combatant"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Orc Warrior" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hp">Current HP</Label>
                  <Input id="hp" type="number" value={hp} onChange={e => setHp(e.target.value)} placeholder="25" />
                </div>
                <div>
                  <Label htmlFor="maxHp">Max HP</Label>
                  <Input id="maxHp" type="number" value={maxHp} onChange={e => setMaxHp(e.target.value)} placeholder="25" />
                </div>
              </div>
              <div>
                <Label htmlFor="initiative">Initiative (Optional for pre-combat)</Label>
                <Input id="initiative" type="number" value={initiative} onChange={e => setInitiative(e.target.value)} placeholder="15" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(value: 'player' | 'enemy') => setType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="enemy">Enemy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddCombatant} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> {editingCombatantId ? "Update Combatant" : "Add to Combat"}
              </Button>
            </CardFooter>
          </Card>
          
          {combatants.length > 0 && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Combat Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {!combatStarted ? (
                        <Button onClick={startCombat} className="w-full bg-success text-success-foreground hover:bg-success/90">
                            <Play className="mr-2 h-4 w-4" /> Start Combat
                        </Button>
                    ) : (
                        <Button onClick={nextTurn} className="w-full">
                            Next Turn <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                     <Button onClick={resetCombat} variant="outline" className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Combat
                    </Button>
                </CardContent>
                 {combatStarted && (
                    <CardFooter className="text-sm text-muted-foreground">
                        Round: {round}
                    </CardFooter>
                )}
            </Card>
          )}

        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg min-h-[400px]">
            <CardHeader>
              <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Initiative Order</CardTitle>
              <CardDescription>{combatStarted ? `Round ${round} - ${sortedCombatants[turnIndex]?.name || 'Nobody'}'s turn.` : "Combatants will be ordered by initiative once combat starts."}</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedCombatants.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Add combatants to begin.</p>
              ) : (
                <ul className="space-y-3">
                  {sortedCombatants.map((c) => (
                    <li key={c.id} className={`rounded-md border p-3 transition-all duration-300 ${c.id === currentTurnCombatantId ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold text-lg ${c.type === 'player' ? 'text-blue-600' : 'text-red-600'}`}>{c.name}</h4>
                        <div className="flex items-center gap-2">
                           {!combatStarted && (
                             <Input 
                                type="number" 
                                value={c.initiative ?? ''} 
                                onChange={(e) => handleInitiativeChange(c.id, e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Init"
                                className="w-16 h-8 text-sm"
                             />
                           )}
                           {combatStarted && <span className="text-sm font-medium text-muted-foreground">Init: {c.initiative}</span>}
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEditCombatant(c)} className="h-7 w-7">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive h-7 w-7">
                                <Trash2 className="h-4 w-4" />
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
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                           {c.hp <= 0 ? <HeartCrack className="mr-1 h-4 w-4 text-destructive" /> : <ShieldAlert className="mr-1 h-4 w-4 text-green-500" />}
                           HP: 
                           <Input 
                             type="number"
                             value={c.hp}
                             onChange={(e) => handleHpChange(c.id, parseInt(e.target.value))}
                             className="w-16 h-7 ml-1 mr-1 text-xs p-1"
                           /> / {c.maxHp}
                        </div>
                        {c.conditions.length > 0 && (
                          <span className="text-xs text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-full">{c.conditions.join(', ')}</span>
                        )}
                      </div>
                      {/* TODO: Add condition management */}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
