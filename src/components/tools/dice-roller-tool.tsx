
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dices, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
type AdvantageStateType = 'advantage' | 'disadvantage' | null;
type RollType = DiceType | 'coin';

interface DiceChainEntry {
  die: DiceType;
  count: number;
}

interface IndividualDieRollResult {
  physicalRolls: number[]; 
  chosenRoll: number;
  isD20AdvDis: boolean; 
  advantageState?: AdvantageStateType; 
}

interface RollSegment {
  die: DiceType;
  count: number; 
  results: IndividualDieRollResult[]; 
}


interface RollResultDetails {
  id: string; // Added for keying animations
  total: number | string; 
  breakdown: string; 
  isCritical?: 'success' | 'failure';
  diceType: RollType; 
  rollSegments?: RollSegment[]; 
  modifier?: number;
  formula?: string; 
  advantageState?: AdvantageStateType | null; 
}


type HistoryEntry = {
  id: string;
  timestamp: Date;
} & RollResultDetails;


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
  
  const [activeRollFormulaDisplay, setActiveRollFormulaDisplay] = useState<React.ReactNode>(<span className="text-muted-foreground">Build your roll</span>);
  const [lastRollOutput, setLastRollOutput] = useState<RollResultDetails | null>(null);
  
  const [rollHistory, setRollHistory] = useState<HistoryEntry[]>([]);
  const [isRolling, setIsRolling] = useState(false);
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


  useEffect(() => {
    if (diceChain.length === 0 && modifier === 0) {
      setActiveRollFormulaDisplay(<span className="text-muted-foreground text-lg">Build your roll</span>);
      return;
    }

    const parts: React.ReactNode[] = [];
    diceChain.forEach((item, index) => {
      parts.push(
        <Tooltip key={`${item.die}-${index}-tooltip`}>
          <TooltipTrigger asChild>
            <Button
              key={`${item.die}-${index}`}
              variant="ghost"
              className="h-auto px-2 py-1 text-xl font-bold text-primary hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => handleRemoveChainPart({ type: 'die', die: item.die })}
            >
              {item.count > 1 ? `${item.count}${item.die}` : item.die}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove Die</p>
          </TooltipContent>
        </Tooltip>
      );
      if (index < diceChain.length - 1 || modifier !== 0) {
        parts.push(<span key={`plus-${index}`} className="mx-1 text-xl text-muted-foreground">+</span>);
      }
    });

    if (modifier !== 0) {
       parts.push(
        <Tooltip key="modifier-tooltip">
          <TooltipTrigger asChild>
            <Button
              key="modifier"
              variant="ghost"
              className="h-auto px-2 py-1 text-xl font-bold text-primary hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => handleRemoveChainPart({ type: 'modifier' })}
            >
              {modifier > 0 ? `+${modifier}` : modifier}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove Modifier</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    
    setActiveRollFormulaDisplay(<div className="flex flex-wrap items-center justify-center gap-x-0.5">{parts}</div>);
  }, [diceChain, modifier]);


  const handleModifierValueChange = (delta: number) => {
    setModifier(prev => prev + delta);
    setLastRollOutput(null); 
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
    setAdvantageState(prevState => prevState === clickedState ? null : clickedState);
    setLastRollOutput(null); 
  };


  const addDieToChain = (dieToAdd: DiceType) => {
    setDiceChain(prevChain => {
      const existingEntryIndex = prevChain.findIndex(item => item.die === dieToAdd);
      if (existingEntryIndex > -1) {
        return prevChain.map((item, index) =>
          index === existingEntryIndex ? { ...item, count: item.count + 1 } : item
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
        const existingEntryIndex = prevChain.findIndex(item => item.die === part.die);
        if (existingEntryIndex > -1) {
          const existingEntry = prevChain[existingEntryIndex];
          if (existingEntry.count > 1) {
            return prevChain.map((item, index) =>
              index === existingEntryIndex ? { ...item, count: item.count - 1 } : item
            );
          } else {
            return prevChain.filter((_, index) => index !== existingEntryIndex);
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
      let currentTotalSum = 0;
      let formulaStringForLog = "";
      let firstDiceTypeForOutput : DiceType | null = null;
      
      const outputRollSegments: RollSegment[] = [];
      let overallIsCritical: 'success' | 'failure' | undefined = undefined;


      diceChain.forEach((chainItem, chainIdx) => {
        const dieConfig = DICE_CONFIG.find(d => d.type === chainItem.die);
        if (!dieConfig) return;
        if (!firstDiceTypeForOutput) firstDiceTypeForOutput = chainItem.die;

        if (chainIdx > 0) formulaStringForLog += " + ";
        formulaStringForLog += `${chainItem.count > 1 ? chainItem.count : ''}${chainItem.die}`;
        
        const segmentDieRolls: IndividualDieRollResult[] = [];

        for (let i = 0; i < chainItem.count; i++) {
          let chosenRollThisInstance: number;
          let physicalRollsThisInstance: number[];
          let advStateThisInstance: AdvantageStateType | undefined = undefined;

          if (chainItem.die === 'd20') {
            const r1 = rollSingleDie(dieConfig.sides);
            advStateThisInstance = advantageState; 
            if (advStateThisInstance) {
              const r2 = rollSingleDie(dieConfig.sides);
              chosenRollThisInstance = advStateThisInstance === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
              physicalRollsThisInstance = [r1, r2];
            } else {
              chosenRollThisInstance = r1;
              physicalRollsThisInstance = [r1];
            }
            
            if (chosenRollThisInstance === 20 && overallIsCritical !== 'failure') overallIsCritical = 'success';
            if (chosenRollThisInstance === 1) overallIsCritical = 'failure'; 
          } else {
            chosenRollThisInstance = rollSingleDie(dieConfig.sides);
            physicalRollsThisInstance = [chosenRollThisInstance];
          }
          currentTotalSum += chosenRollThisInstance;
          segmentDieRolls.push({
            physicalRolls: physicalRollsThisInstance,
            chosenRoll: chosenRollThisInstance,
            isD20AdvDis: chainItem.die === 'd20' && !!advStateThisInstance,
            advantageState: advStateThisInstance
          });
        }
        outputRollSegments.push({
          die: chainItem.die,
          count: chainItem.count,
          results: segmentDieRolls
        });
      });
      
      const finalTotalWithModifier = currentTotalSum + modifier;
      
      const historyBreakdownParts: string[] = [];
      outputRollSegments.forEach(segment => {
        const rolls = segment.results.map(r => r.chosenRoll).join('+');
        historyBreakdownParts.push(`${segment.count > 1 ? segment.count : ''}${segment.die}(${rolls})`);
      });

      let historyBreakdownString = historyBreakdownParts.join(' + ');

      if (outputRollSegments.length === 0 && modifier !== 0) { // Only modifier
        historyBreakdownString = `${modifier > 0 ? '+' : ''}${Math.abs(modifier)}`;
      } else if (modifier !== 0) { // Dice and modifier
        historyBreakdownString += ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}`;
      } else if (outputRollSegments.length === 0 && modifier === 0) { // No dice, no modifier
        historyBreakdownString = "0"; 
      }
      // If only dice and modifier is 0, historyBreakdownString is already just the dice part


      historyBreakdownString += ` = ${finalTotalWithModifier}`;


      const resultDetails: RollResultDetails = {
        id: String(Date.now() + Math.random()), 
        total: finalTotalWithModifier,
        breakdown: historyBreakdownString,
        isCritical: overallIsCritical, 
        diceType: firstDiceTypeForOutput || (diceChain.length > 0 ? diceChain[0].die : 'd6'),
        rollSegments: outputRollSegments,
        modifier: modifier,
        formula: formulaStringForLog,
        advantageState: advantageState,
      };
      setLastRollOutput(resultDetails);

      const historyEntry: HistoryEntry = {
        id: resultDetails.id,
        timestamp: new Date(),
        ...resultDetails,
      };
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      
      if (resultDetails.isCritical === 'success') {
        setCriticalMessage({ text: "CRITICAL SUCCESS!", colorClass: "text-success" });
      } else if (resultDetails.isCritical === 'failure') {
        setCriticalMessage({ text: "CRITICAL FAILURE!", colorClass: "text-destructive" });
      }
      
      setDiceChain([]);
      setLastRollOutput(null); // Clear the formula display, ready for next build
      setActiveRollFormulaDisplay(<span className="text-muted-foreground text-lg">Build your roll</span>); // Reset formula display
      // setModifier(0); // Keep modifier for subsequent rolls or let user clear
      setIsRolling(false);
    }, 300);
  };

  const handleCoinFlip = () => {
    setIsRolling(true);
    setActiveRollFormulaDisplay(<span className="text-muted-foreground text-lg">Build your roll</span>); // Clear dice formula if any
    setDiceChain([]); // Clear dice chain
    // setModifier(0); // Optionally clear modifier
    setLastRollOutput(null); 
    
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const resultDetails: RollResultDetails = {
        id: String(Date.now() + Math.random()),
        total: result,
        breakdown: `Coin Flip: ${result}`,
        diceType: 'coin',
      };
      setLastRollOutput(resultDetails); 
      const historyEntry: HistoryEntry = {
        id: resultDetails.id,
        timestamp: new Date(),
        ...resultDetails,
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
            {DICE_CONFIG.map(({ type }) => {
              const dieEntry = diceChain.find(item => item.die === type);
              const currentDieCount = dieEntry ? dieEntry.count : 0;
              return (
                <Button
                  key={type}
                  onClick={() => addDieToChain(type)}
                  className={cn(
                    "font-semibold transition-transform hover:scale-105 active:scale-95",
                    "h-auto aspect-square flex flex-col items-center justify-center p-1",
                    currentDieCount > 0 ? 'border-primary shadow-md' : 'border-input'
                  )}
                  variant="outline"
                  disabled={isRolling}
                >
                  <span className="text-xs">{type.toUpperCase()}</span>
                  {currentDieCount > 0 && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      x{currentDieCount}
                    </span>
                  )}
                </Button>
              );
            })}
             <Button
                key="coin"
                onClick={handleCoinFlip}
                className={cn(
                  "font-semibold transition-transform hover:scale-105 active:scale-95 border-primary",
                  "h-auto aspect-square flex flex-col items-center justify-center p-1 text-xs"
                )}
                variant="outline"
                disabled={isRolling}
              >
                <div className="flex flex-col items-center">
                  <span>Coin</span>
                  <span>Flip</span>
                </div>
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
                  "text-xs px-2 py-1 h-auto transition-colors duration-150", 
                   advantageState === 'advantage' 
                    ? "border border-success" 
                    : "hover:bg-success hover:text-success-foreground hover:border-success border-input"
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
                  "text-xs px-2 py-1 h-auto transition-colors duration-150", 
                   advantageState === 'disadvantage' 
                    ? "border border-destructive" 
                    : "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive border-input"
                )}
                aria-pressed={advantageState === 'disadvantage'}
              >
                Disadvantage
              </Button>
            </div>
          </div>
          
          <Button onClick={executeDiceChainRoll} className="w-full" disabled={isRolling || (diceChain.length === 0 && modifier === 0)}>
            {isRolling ? <Dices className="mr-2 h-4 w-4 animate-spin" /> : <Dices className="mr-2 h-4 w-4" />}
            Roll Dice
          </Button>
          
          <div className="mt-3 flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/50 bg-muted/20 p-4 text-primary shadow-inner min-h-[90px]">
            {isRolling && !lastRollOutput ? (
                <Dices className="h-10 w-10 animate-spin text-accent" />
            ) : lastRollOutput ? (
              <span
                key={lastRollOutput.id} 
                className="text-5xl font-bold animate-roll-burst"
              >
                {lastRollOutput.total}
              </span>
            ) : (
                <TooltipProvider>
                  <div className="flex flex-wrap items-center justify-center gap-x-0.5">
                      {activeRollFormulaDisplay}
                  </div>
                </TooltipProvider>
            )}
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
                     <span className="whitespace-pre-wrap break-words text-left text-foreground"> 
                       {entry.breakdown} 
                     </span>
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
