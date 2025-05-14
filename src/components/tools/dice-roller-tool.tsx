
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dices, Plus, Minus, Disc3 } from 'lucide-react'; // Added Disc3
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
  id: string;
  total: number | string;
  breakdown: string;
  isCritical?: 'success' | 'failure';
  diceType: RollType;
  rollSegments?: RollSegment[];
  modifier?: number;
  advantageState?: AdvantageStateType | null;
  formula?: string;
}


type HistoryEntry = {
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

  const [activeRollFormulaDisplay, setActiveRollFormulaDisplay] = useState<React.ReactNode>(<span className="text-muted-foreground text-lg">Build your roll</span>);
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

  const getRollDetailsDisplay = (result: IndividualDieRollResult): React.ReactNode => {
    if (result.isD20AdvDis && result.physicalRolls.length === 2) {
      const rolls = result.physicalRolls; // Assumes physicalRolls is sorted [min, max]
      const isAdv = result.advantageState === 'advantage';
      return (
        <>
          (
          <span className={cn(!isAdv && result.chosenRoll === rolls[0] ? 'font-bold text-destructive' : '')}>{rolls[0]}</span>
          ,
          <span className={cn(isAdv && result.chosenRoll === rolls[1] ? 'font-bold text-success' : '')}>{rolls[1]}</span>
          )
        </>
      );
    }
    return `(${result.chosenRoll})`;
  };

  useEffect(() => {
    if (lastRollOutput && lastRollOutput.diceType !== 'coin') return; // Keep formula if result is just displayed

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceChain, modifier, lastRollOutput]);


  const handleModifierValueChange = (delta: number) => {
    setLastRollOutput(null);
    setModifier(prev => prev + delta);
  };

  const handleModifierInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModifierInput(e.target.value);
  };

  const handleModifierInputBlur = () => {
    setLastRollOutput(null);
    const newModifier = parseInt(modifierInput, 10);
    if (!isNaN(newModifier)) {
      setModifier(newModifier);
    }
    setIsEditingModifier(false);
  };

  const handleModifierInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleModifierInputBlur();
    }
  };

  const handleAdvantageToggle = (clickedState: 'advantage' | 'disadvantage') => {
    setLastRollOutput(null);
    setAdvantageState(prevState => prevState === clickedState ? null : clickedState);
  };


  const addDieToChain = (dieToAdd: DiceType) => {
    setLastRollOutput(null);
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
  };

  const handleRemoveChainPart = (part: { type: 'die'; die: DiceType } | { type: 'modifier' }) => {
    setLastRollOutput(null);
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
      const outputRollSegments: RollSegment[] = [];
      let overallIsCritical: 'success' | 'failure' | undefined = undefined;
      
      let primaryDiceTypeForOutput: DiceType = 'd6'; 
      if (diceChain.length > 0) {
        primaryDiceTypeForOutput = diceChain.sort((a,b) => DICE_CONFIG.find(dc => dc.type === b.die)!.sides - DICE_CONFIG.find(dc => dc.type === a.die)!.sides)[0].die;
      }


      diceChain.forEach((chainItem) => {
        const dieConfig = DICE_CONFIG.find(d => d.type === chainItem.die);
        if (!dieConfig) return;

        const segmentDieRolls: IndividualDieRollResult[] = [];

        for (let i = 0; i < chainItem.count; i++) {
          let chosenRollThisInstance: number;
          let physicalRollsThisInstance: number[];
          let advStateForThisDieInstance: AdvantageStateType | undefined = undefined;


          if (chainItem.die === 'd20' && advantageState) { // Apply component's advantageState if it's a d20
            advStateForThisDieInstance = advantageState;
            const r1 = rollSingleDie(dieConfig.sides);
            const r2 = rollSingleDie(dieConfig.sides);
            chosenRollThisInstance = advantageState === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
            physicalRollsThisInstance = [r1, r2].sort((a,b) => a-b);
          } else { // For non-d20s, or d20s without active advantage/disadvantage
            chosenRollThisInstance = rollSingleDie(dieConfig.sides);
            physicalRollsThisInstance = [chosenRollThisInstance];
            // advStateForThisDieInstance remains undefined
          }

          // Critical checks only for d20s based on the chosen roll after adv/dis
          if (chainItem.die === 'd20') {
            if (chosenRollThisInstance === 20 && overallIsCritical !== 'failure') {
                overallIsCritical = 'success';
            }
            if (chosenRollThisInstance === 1) {
                overallIsCritical = 'failure';
            }
          }
          
          currentTotalSum += chosenRollThisInstance;
          segmentDieRolls.push({
            physicalRolls: physicalRollsThisInstance,
            chosenRoll: chosenRollThisInstance,
            isD20AdvDis: chainItem.die === 'd20' && !!advStateForThisDieInstance,
            advantageState: advStateForThisDieInstance
          });
        }
        outputRollSegments.push({
          die: chainItem.die,
          count: chainItem.count,
          results: segmentDieRolls
        });
      });

      const finalTotalWithModifier = currentTotalSum + modifier;
      const rollId = String(Date.now() + Math.random());
      
      let currentFormula = diceChain.map(item => `${item.count > 1 ? item.count : ''}${item.die}`).join(' + ');
      if (diceChain.length === 0 && modifier === 0) currentFormula = "0";
      else if (diceChain.length === 0 && modifier !==0) currentFormula = String(modifier);
      else if (modifier !== 0) currentFormula += (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`);

      // Breakdown for history
      let historyBreakdownString = outputRollSegments.map(segment => {
        const chosenRollsForSegment = segment.results.map(r => r.chosenRoll);
        return `${segment.count > 1 ? segment.count : ''}${segment.die}(${chosenRollsForSegment.join('+')})`;
      }).join(' + ');
      
      if (outputRollSegments.length === 0 && modifier !== 0) {
        historyBreakdownString = `${modifier > 0 ? '+' : ''}${modifier}`;
      } else if (modifier !== 0) {
        historyBreakdownString += (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`);
      } else if (outputRollSegments.length === 0 && modifier === 0) {
         historyBreakdownString = "0";
      }
      historyBreakdownString += ` = ${finalTotalWithModifier}`;


      const resultDetails: RollResultDetails = {
        id: rollId,
        total: finalTotalWithModifier,
        breakdown: historyBreakdownString,
        isCritical: overallIsCritical,
        diceType: primaryDiceTypeForOutput,
        rollSegments: outputRollSegments,
        modifier: modifier,
        advantageState: advantageState, // Store the global advantage state used for this roll chain
        formula: currentFormula || String(modifier)
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

      setIsRolling(false);
      // Keep diceChain and modifier as they are for the next roll,
      // setLastRollOutput(null) is handled by formula interaction
    }, 300);
  };

  const handleCoinFlip = () => {
    setIsRolling(true);
    setLastRollOutput(null); // Clear dice chain display
    
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const resultId = String(Date.now() + Math.random());
      const resultDetails: RollResultDetails = {
        id: resultId,
        total: result,
        breakdown: `Coin Flip: ${result}`,
        diceType: 'coin',
      };
      setLastRollOutput(resultDetails);
      const historyEntry: HistoryEntry = {
        id: resultId,
        timestamp: new Date(),
        ...resultDetails,
      };
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      setIsRolling(false);
    }, 300);
  };


  return (
    <div className="h-full flex flex-col">
      {criticalMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <span className={`text-5xl sm:text-6xl md:text-7xl font-extrabold animate-explode-text ${criticalMessage.colorClass} drop-shadow-lg`}>
            {criticalMessage.text}
          </span>
        </div>
      )}
      <Card className="shadow-md flex flex-col flex-1 min-h-0">
        <CardContent className="space-y-4 px-4 pt-4 pb-0"> {/* Adjusted pb-0 */}
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
                    "h-auto aspect-square flex flex-col items-center justify-center p-1 text-xs",
                    currentDieCount > 0 ? 'border-primary shadow-md' : 'border-input'
                  )}
                  variant="outline"
                  disabled={isRolling}
                >
                  <span className="text-sm">{type.toUpperCase()}</span>
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
                  "font-semibold transition-transform hover:scale-105 active:scale-95 border-primary", // Kept border-primary for Coin button
                  "h-auto aspect-square flex flex-col items-center justify-center p-1 text-xs"
                )}
                variant="alert" 
                disabled={isRolling}
                aria-label="Flip a coin"
              >
                <Disc3 className="h-6 w-6" />
              </Button>
          </div>
          
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
                    onClick={() => { setModifierInput(String(modifier)); setIsEditingModifier(true); setLastRollOutput(null); }}
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
                  "text-xs px-3 py-1.5 h-auto transition-colors duration-150",
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
                  "text-xs px-3 py-1.5 h-auto transition-colors duration-150",
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
          
          <div className="mt-3">
            <Button onClick={executeDiceChainRoll} className="w-full" disabled={isRolling || (diceChain.length === 0 && modifier === 0)}>
              {isRolling && lastRollOutput?.diceType !== 'coin' ? <Dices className="mr-2 h-4 w-4 animate-spin" /> : <Dices className="mr-2 h-4 w-4" />}
              Roll Dice
            </Button>
          </div>

          <div className="mt-3 mb-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/50 bg-muted/20 p-4 text-primary shadow-inner min-h-[90px]">
            {isRolling && lastRollOutput?.diceType !== 'coin' ? ( 
                <Dices className="h-10 w-10 animate-spin text-accent" />
            ) : lastRollOutput ? (
                <span
                    key={lastRollOutput.id} 
                    className="text-5xl font-bold text-foreground animate-roll-burst" 
                >
                    {lastRollOutput.total}
                </span>
            ) : (
                <TooltipProvider>
                  {activeRollFormulaDisplay}
                </TooltipProvider>
            )}
            {lastRollOutput && lastRollOutput.diceType !== 'coin' && lastRollOutput.rollSegments && (
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {lastRollOutput.rollSegments.map((segment, segIdx) => (
                  <React.Fragment key={`${lastRollOutput.id}-seg-${segIdx}`}>
                    {segment.results.map((r, rIdx) => (
                       <React.Fragment key={`${lastRollOutput.id}-roll-${segIdx}-${rIdx}`}>
                        {rIdx > 0 || segIdx > 0 ? ' + ' : ''}
                        {segment.die}
                        {getRollDetailsDisplay(r)}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
                {lastRollOutput.modifier !== 0 && (
                  ` ${lastRollOutput.modifier! > 0 ? '+' : '-'} ${Math.abs(lastRollOutput.modifier!)}`
                )}
                {` = ${lastRollOutput.total}`}
              </p>
            )}
             {lastRollOutput && lastRollOutput.diceType === 'coin' && (
                <p className="text-xs text-muted-foreground mt-1 text-center">
                    Coin Flip
                </p>
             )}
          </div>
        </CardContent>

        <Separator className="my-0" /> {/* Ensures it's flush if CardContent has pb-0 */}

        <div className="bg-muted/50 w-full flex-1 min-h-0 flex flex-col">
          {rollHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-2 text-xs text-muted-foreground">
              No rolls yet.
            </div>
          ) : (
            <ScrollArea className="flex-1 text-xs"> {/* flex-1 allows ScrollArea to take available space */}
              <div className="p-2">
                {rollHistory.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <div className="flex justify-between items-center py-1">
                      <span className="whitespace-pre-wrap break-words text-left text-foreground">
                        {entry.breakdown}
                      </span>
                      {mounted && (
                          <span className="text-muted-foreground ml-2 flex-shrink-0">
                              {new Date(entry.timestamp).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                          </span>
                      )}
                    </div>
                    {index < rollHistory.length - 1 && <Separator className="my-0.5 bg-border/70" />}
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
}

