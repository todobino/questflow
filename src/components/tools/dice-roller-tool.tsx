
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dices, Plus, Minus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
type AdvantageStateType = 'advantage' | 'disadvantage' | null;

interface DiceChainEntry {
  die: DiceType;
  count: number;
}

interface RollResultDetails {
  total: number;
  breakdown: string; // e.g., "d4:[1,3] d6:[5] Mod:+2 = 11"
  isCritical?: 'success' | 'failure';
}

type HistoryEntry = {
  id: string;
  timestamp: Date;
} & (
  | { type: 'coin'; result: 'Heads' | 'Tails' }
  | {
      type: 'complex';
      formula: string;
      result: RollResultDetails;
    }
);

interface CriticalMessage {
  text: string;
  colorClass: string;
}

const DICE_CONFIG: { type: DiceType; sides: number }[] = [
  { type: 'd4', sides: 4 },
  { type: 'd6', sides: 6 },
  { type: 'd8', sides: 8 },
  { type: 'd10', sides: 10 },
  { type: 'd12', sides: 12 },
  { type: 'd20', sides: 20 },
  { type: 'd100', sides: 100 },
];

export function DiceRollerTool() {
  const [diceChain, setDiceChain] = useState<DiceChainEntry[]>([]);
  const [modifier, setModifier] = useState(0);
  const [advantageState, setAdvantageState] = useState<AdvantageStateType>(null);
  
  const [activeRollFormulaDisplay, setActiveRollFormulaDisplay] = useState<React.ReactNode>(null);
  const [lastRollOutput, setLastRollOutput] = useState<RollResultDetails | null>(null);
  
  const [rollHistory, setRollHistory] = useState<HistoryEntry[]>([]);
  const [isRolling, setIsRolling] = useState(false); // For "Roll Dice" button
  const [isEditingModifier, setIsEditingModifier] = useState(false);
  const [modifierInput, setModifierInput] = useState('0');
  const [criticalMessage, setCriticalMessage] = useState<CriticalMessage | null>(null);
  const [mounted, setMounted] = useState(false);

  const { toast } = useToast();
  const modifierInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (isEditingModifier && modifierInputRef.current) {
      modifierInputRef.current.select();
    }
  }, [isEditingModifier]);

  useEffect(() => {
    if (criticalMessage) {
      const timer = setTimeout(() => setCriticalMessage(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [criticalMessage]);

  // Update activeRollFormulaDisplay when diceChain or modifier changes
  useEffect(() => {
    if (diceChain.length === 0 && modifier === 0) {
      setActiveRollFormulaDisplay(<span className="text-muted-foreground">Build your roll</span>);
      return;
    }

    const parts: React.ReactNode[] = [];
    diceChain.forEach((item, index) => {
      parts.push(
        <Button
          key={`${item.die}-${index}`}
          variant="ghost"
          size="sm"
          className="h-auto px-1 py-0.5 text-primary hover:bg-primary/10"
          onClick={() => handleRemoveChainPart({ type: 'die', die: item.die })}
        >
          {item.count > 1 ? `${item.count}${item.die}` : item.die}
        </Button>
      );
      if (index < diceChain.length - 1 || modifier !== 0) {
        parts.push(<span key={`plus-${index}`} className="mx-1 text-muted-foreground">+</span>);
      }
    });

    if (modifier !== 0) {
      parts.push(
        <Button
          key="modifier"
          variant="ghost"
          size="sm"
          className="h-auto px-1 py-0.5 text-primary hover:bg-primary/10"
          onClick={() => handleRemoveChainPart({ type: 'modifier' })}
        >
          {modifier > 0 ? modifier : `(${modifier})`}
        </Button>
      );
    }
    
    setActiveRollFormulaDisplay(<div className="flex flex-wrap items-center justify-center gap-x-0.5">{parts}</div>);
  }, [diceChain, modifier]);


  const handleModifierValueChange = (delta: number) => {
    setModifier(prev => prev + delta);
    setLastRollOutput(null); // Clear previous roll result when formula changes
  };

  const handleModifierInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModifierInput(e.target.value);
  };

  const handleModifierInputBlur = () => {
    const newModifier = parseInt(modifierInput, 10);
    if (!isNaN(newModifier)) {
      setModifier(newModifier);
    }
    setIsEditingModifier(false);
    setLastRollOutput(null); 
  };
  
  const handleModifierInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleModifierInputBlur();
    }
  };

  const handleAdvantageToggle = (clickedState: 'advantage' | 'disadvantage') => {
    if (advantageState === clickedState) setAdvantageState(null);
    else setAdvantageState(clickedState);
  };

  const addDieToChain = (dieToAdd: DiceType) => {
    setDiceChain(prevChain => {
      const existingEntry = prevChain.find(item => item.die === dieToAdd);
      if (existingEntry) {
        return prevChain.map(item =>
          item.die === dieToAdd ? { ...item, count: item.count + 1 } : item
        );
      } else {
        return [...prevChain, { die: dieToAdd, count: 1 }];
      }
    });
    setLastRollOutput(null); 
  };

  const handleRemoveChainPart = (part: { type: 'die'; die: DiceType } | { type: 'modifier' }) => {
    if (part.type === 'modifier') {
      setModifier(0);
    } else {
      setDiceChain(prevChain => {
        const existingEntry = prevChain.find(item => item.die === part.die);
        if (existingEntry) {
          if (existingEntry.count > 1) {
            return prevChain.map(item =>
              item.die === part.die ? { ...item, count: item.count - 1 } : item
            );
          } else {
            return prevChain.filter(item => item.die !== part.die);
          }
        }
        return prevChain;
      });
    }
    setLastRollOutput(null); 
  };

  const rollSingleDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

  const executeDiceChainRoll = () => {
    if (diceChain.length === 0 && modifier === 0) {
      toast({ title: "Empty Roll", description: "Add some dice or a modifier to roll.", variant: "default" });
      return;
    }
    
    setIsRolling(true);
    setCriticalMessage(null);

    setTimeout(() => {
      let total = 0;
      const breakdownParts: string[] = [];
      let criticalEncountered: 'success' | 'failure' | undefined = undefined;
      let formulaString = "";

      diceChain.forEach((item, index) => {
        const dieConfig = DICE_CONFIG.find(d => d.type === item.die);
        if (!dieConfig) return;

        formulaString += `${item.count}${item.die}`;
        
        const rollsForThisDieType: string[] = [];
        for (let i = 0; i < item.count; i++) {
          let chosenRoll: number;
          let rawRoll1: number | undefined, rawRoll2: number | undefined;

          if (item.die === 'd20' && advantageState) {
            rawRoll1 = rollSingleDie(dieConfig.sides);
            rawRoll2 = rollSingleDie(dieConfig.sides);
            chosenRoll = advantageState === 'advantage' ? Math.max(rawRoll1, rawRoll2) : Math.min(rawRoll1, rawRoll2);
            rollsForThisDieType.push(`${chosenRoll}{${rawRoll1},${rawRoll2}}`);
          } else {
            chosenRoll = rollSingleDie(dieConfig.sides);
            rollsForThisDieType.push(String(chosenRoll));
          }
          
          if (item.die === 'd20') {
            if (chosenRoll === 20) criticalEncountered = 'success';
            if (chosenRoll === 1 && criticalEncountered !== 'success') criticalEncountered = 'failure'; // Don't overwrite success with failure if both occur
          }
          total += chosenRoll;
        }
        breakdownParts.push(`${item.count}${item.die}:[${rollsForThisDieType.join(',')}]`);
        if (index < diceChain.length - 1) formulaString += " + ";
      });
      
      total += modifier;
      if (modifier !== 0) {
        if (formulaString !== "") formulaString += ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}`;
        else formulaString = String(modifier);
        breakdownParts.push(`Mod:${modifier > 0 ? '+' : ''}${modifier}`);
      }
      if (formulaString === "") formulaString = "0"; // Handle case of only modifier and it's 0

      const resultDetails: RollResultDetails = {
        total,
        breakdown: `${breakdownParts.join('; ')} = ${total}`,
        isCritical: criticalEncountered,
      };
      setLastRollOutput(resultDetails);

      const historyEntry: HistoryEntry = {
        id: String(Date.now()),
        timestamp: new Date(),
        type: 'complex',
        formula: formulaString,
        result: resultDetails,
      };
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      
      if (criticalEncountered === 'success') {
        setCriticalMessage({ text: "CRITICAL SUCCESS!", colorClass: "text-success" });
      } else if (criticalEncountered === 'failure') {
        setCriticalMessage({ text: "CRITICAL FAILURE!", colorClass: "text-destructive" });
      }
      
      // Clear the chain for the next roll
      setDiceChain([]);
      setModifier(0); 
      setIsRolling(false);
    }, 300);
  };

  const handleCoinFlip = () => {
    setIsRolling(true); // Reuse for button disabling
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const historyEntry: HistoryEntry = {
        id: String(Date.now()),
        timestamp: new Date(),
        type: 'coin',
        result,
      };
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      toast({ title: "Coin Flip Result", description: result });
      setIsRolling(false);
    }, 300);
  };

  return (
    <div className="space-y-3">
      {criticalMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <span className={`text-5xl sm:text-6xl md:text-7xl font-extrabold animate-explode-text ${criticalMessage.colorClass} drop-shadow-lg`}>
            {criticalMessage.text}
          </span>
        </div>
      )}
      <Card className="shadow-md">
        <CardContent className="space-y-4 px-4 pt-4 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {DICE_CONFIG.map(({ type }) => (
              <Button
                key={type}
                onClick={() => addDieToChain(type)}
                className="h-10 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                size="default"
                variant="outline"
                disabled={isRolling}
              >
                {type.toUpperCase()}
              </Button>
            ))}
            <Button
              key="coin"
              onClick={handleCoinFlip}
              className="h-10 text-sm font-semibold transition-transform hover:scale-105 active:scale-95 border-primary" // Added black border
              size="default"
              variant="outline"
              disabled={isRolling}
            >
              50/50
            </Button>
          </div>
          
          <Separator />

          <div className="flex flex-row items-end justify-between pt-1">
            <div className="flex flex-col items-start">
              <Label className="text-xs text-muted-foreground mb-1 self-start">Modifiers</Label>
              <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleModifierValueChange(-1)} disabled={isRolling} className="h-8 w-8">
                  <Minus className="h-4 w-4" />
                </Button>
                {isEditingModifier ? (
                  <Input
                    ref={modifierInputRef}
                    type="number"
                    value={modifierInput}
                    onChange={handleModifierInputChange}
                    onBlur={handleModifierInputBlur}
                    onKeyDown={handleModifierInputKeyDown}
                    className="h-8 w-16 text-center px-1 text-sm"
                  />
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => { setModifierInput(String(modifier)); setIsEditingModifier(true); }}
                    className="h-8 w-16 text-sm"
                    disabled={isRolling}
                  >
                    {modifier >= 0 ? `+${modifier}` : modifier}
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={() => handleModifierValueChange(1)} disabled={isRolling} className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <Button
                variant={advantageState === 'advantage' ? 'success' : 'outline'}
                onClick={() => handleAdvantageToggle('advantage')}
                disabled={isRolling}
                className={cn(
                  "text-xs px-3 py-1.5 h-auto w-full transition-colors duration-150",
                  advantageState === 'advantage' ? "border border-success" : "hover:bg-success hover:text-success-foreground hover:border-success border-input"
                )}
                aria-pressed={advantageState === 'advantage'}
              >
                Advantage
              </Button>
              <Button
                variant={advantageState === 'disadvantage' ? 'destructive' : 'outline'}
                onClick={() => handleAdvantageToggle('disadvantage')}
                disabled={isRolling}
                className={cn(
                  "text-xs px-3 py-1.5 h-auto w-full transition-colors duration-150",
                  advantageState === 'disadvantage' ? "border border-destructive" : "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive border-input"
                )}
                aria-pressed={advantageState === 'disadvantage'}
              >
                Disadvantage
              </Button>
            </div>
          </div>

          <Button onClick={executeDiceChainRoll} className="w-full" disabled={isRolling}>
            {isRolling ? <Dices className="mr-2 h-4 w-4 animate-spin" /> : <Dices className="mr-2 h-4 w-4" />}
            Roll Dice
          </Button>
          
          <div className="mt-3 flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/50 bg-muted/20 p-4 text-primary shadow-inner min-h-[90px]">
            {isRolling && <Dices className="h-10 w-10 animate-spin text-accent" />}
            {!isRolling && lastRollOutput ? (
              <>
                <span className="text-4xl font-bold">{lastRollOutput.total}</span>
                {mounted && (
                  <p className="text-muted-foreground text-xs mt-1 text-center whitespace-pre-wrap">
                    {lastRollOutput.breakdown}
                  </p>
                )}
              </>
            ) : !isRolling ? (
                 <div className="text-center text-lg font-medium">
                    {activeRollFormulaDisplay}
                 </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle  className="text-lg">Roll History</CardTitle>
        </CardHeader>
        <CardContent>
          {rollHistory.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">No rolls yet.</p>
          ) : (
            <ScrollArea className="h-[150px] rounded-md border p-1 text-xs">
              {rollHistory.map((entry) => (
                <div key={entry.id}>
                  <div className="flex justify-between items-center p-1.5">
                    {entry.type === 'coin' ? (
                       <span className="whitespace-pre-wrap break-words text-left"> 
                         Coin Flip: <span className="font-semibold text-primary">{entry.result}</span>
                       </span>
                    ) : (
                       <span className="whitespace-pre-wrap break-words text-left"> 
                        {entry.formula} = <span className="font-semibold text-primary">{entry.result.total}</span>
                        <br/>
                        <span className="text-muted-foreground text-[10px]">({entry.result.breakdown})</span>
                      </span>
                    )}
                    {mounted && (
                         <span className="text-muted-foreground ml-2 flex-shrink-0">
                            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                  </div>
                  {rollHistory.indexOf(entry) < rollHistory.length - 1 && <Separator />}
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

