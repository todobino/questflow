
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Disc3, Dices, History, RotateCcw, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetClose,
  SheetFooter as SheetModalFooter,
} from '@/components/ui/sheet';
import { format, isToday, isYesterday, parseISO, formatISO } from 'date-fns';


type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
type AdvantageStateType = 'advantage' | 'disadvantage' | null;
type RollType = DiceType | 'coin';


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
  const [diceChain, setDiceChain] = useState<Array<{ die: DiceType; count: number }>>([]);
  const [modifier, setModifier] = useState(0);
  const [advantageState, setAdvantageState] = useState<AdvantageStateType>(null);

  const [activeRollFormulaDisplay, setActiveRollFormulaDisplay] = useState<React.ReactNode>(<span className="text-muted-foreground text-lg">Build your roll</span>);
  const [lastRollOutput, setLastRollOutput] = useState<RollResultDetails | null>(null);

  const [rollHistory, setRollHistory] = useState<HistoryEntry[]>([]);
  const [isRolling, setIsRolling] = useState<RollType | false>(false);
  const [isEditingModifier, setIsEditingModifier] = useState(false);
  const [modifierInput, setModifierInput] = useState('0');
  const [criticalMessage, setCriticalMessage] = useState<CriticalMessage | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);


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
    if (!lastRollOutput) { 
      const parts: React.ReactNode[] = [];
      if (diceChain.length === 0 && modifier === 0) {
        setActiveRollFormulaDisplay(<span className="text-muted-foreground text-lg">Build your roll</span>);
        return;
      }
      diceChain.forEach((item, index) => {
        parts.push(
          <Tooltip key={`${item.die}-${index}-tooltip`}>
            <TooltipTrigger asChild>
               <Button
                key={`${item.die}-${index}`}
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xl font-bold text-primary hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => { setLastRollOutput(null); handleRemoveChainPart({ type: 'die', die: item.die }); }}
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
          parts.push(<span key={`plus-sep-${index}`} className="mx-1 text-xl text-muted-foreground">+</span>);
        }
      });

      if (modifier !== 0) {
        parts.push(
          <Tooltip key="modifier-tooltip">
            <TooltipTrigger asChild>
               <Button
                key="modifier"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xl font-bold text-primary hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => { setLastRollOutput(null); handleRemoveChainPart({ type: 'modifier' }); }}
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
    }
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
      setModifierInput('0');
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

  const getRollDetailsDisplayForFormula = (result: IndividualDieRollResult, dieType: DiceType): string => {
    if (result.isD20AdvDis && result.physicalRolls.length === 2 && result.advantageState) {
        const r1 = result.physicalRolls[0];
        const r2 = result.physicalRolls[1];
        const chosen = result.chosenRoll;
        const advState = result.advantageState;

        const r1Styled = chosen === r1 
            ? `<strong class="font-bold ${advState === 'advantage' ? 'text-success' : 'text-destructive'}">${r1}</strong>` 
            : `<span class="text-muted-foreground/70">${r1}</span>`;
        const r2Styled = chosen === r2 
            ? `<strong class="font-bold ${advState === 'advantage' ? 'text-success' : 'text-destructive'}">${r2}</strong>`
            : `<span class="text-muted-foreground/70">${r2}</span>`;
        
        return `${dieType}(${r1Styled},${r2Styled})`;
    }
    return `${dieType}(${result.chosenRoll})`;
  };

  const executeDiceChainRoll = () => {
    if (diceChain.length === 0 && modifier === 0) {
      setLastRollOutput({
          id: String(Date.now() + Math.random()),
          total: 0,
          breakdown: "0 = <strong>0</strong>",
          diceType: 'd6', 
          rollSegments: [],
          modifier: 0,
          formula: "0"
      });
      return;
    }

    let primaryDiceTypeForOutput: DiceType = 'd6';
    if (diceChain.length > 0) {
      primaryDiceTypeForOutput = diceChain.reduce((largest, current) => {
        const largestSides = DICE_CONFIG.find(dc => dc.type === largest.die)!.sides;
        const currentSides = DICE_CONFIG.find(dc => dc.type === current.die)!.sides;
        return currentSides > largestSides ? current : largest;
      }).die;
    }

    setIsRolling(primaryDiceTypeForOutput);
    setCriticalMessage(null);
    // setLastRollOutput(null); // Keep last roll visible until new one completes

    setTimeout(() => {
      let currentTotalSum = 0;
      const outputRollSegments: RollSegment[] = [];
      let overallIsCritical: 'success' | 'failure' | undefined = undefined;
      
      diceChain.forEach((chainItem) => {
        const dieConfig = DICE_CONFIG.find(d => d.type === chainItem.die);
        if (!dieConfig) return;

        const segmentDieRolls: IndividualDieRollResult[] = [];

        for (let i = 0; i < chainItem.count; i++) {
          let chosenRollThisInstance: number;
          let physicalRollsThisInstance: number[];
          let advStateForThisDieInstance: AdvantageStateType | undefined = undefined;

          if (chainItem.die === 'd20' && advantageState) {
            advStateForThisDieInstance = advantageState;
            const r1 = rollSingleDie(dieConfig.sides);
            const r2 = rollSingleDie(dieConfig.sides);
            chosenRollThisInstance = advantageState === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
            physicalRollsThisInstance = [r1, r2];
          } else {
            chosenRollThisInstance = rollSingleDie(dieConfig.sides);
            physicalRollsThisInstance = [chosenRollThisInstance];
            advStateForThisDieInstance = undefined;
          }

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
      
      const formulaParts: string[] = [];
      outputRollSegments.forEach(segment => {
          if (segment.die === 'd20' && segment.results.some(r => r.isD20AdvDis)) {
              // Handle d20 with advantage/disadvantage for formula string
              const d20results = segment.results.map(r => {
                if(r.isD20AdvDis && r.physicalRolls.length === 2) {
                  const r1 = r.physicalRolls[0];
                  const r2 = r.physicalRolls[1];
                  const chosen = r.chosenRoll;
                  const advState = r.advantageState;
                  const r1Styled = chosen === r1 ? `<strong class="font-bold ${advState === 'advantage' ? 'text-success' : 'text-destructive'}">${r1}</strong>` : `<span class="text-muted-foreground/70">${r1}</span>`;
                  const r2Styled = chosen === r2 ? `<strong class="font-bold ${advState === 'advantage' ? 'text-success' : 'text-destructive'}">${r2}</strong>` : `<span class="text-muted-foreground/70">${r2}</span>`;
                  return `d20(${r1Styled},${r2Styled})`;
                }
                return `d20(${r.chosenRoll})`;
              });
              formulaParts.push(...d20results);
          } else {
              // Standard dice or d20 without adv/dis
              const rollsForSegment = segment.results.map(r => r.chosenRoll);
              formulaParts.push(`${segment.count > 1 ? segment.count : ''}${segment.die}(${rollsForSegment.join('+')})`);
          }
      });

      let historyBreakdownString = formulaParts.join(' + ');
      if (modifier !== 0) {
          historyBreakdownString += ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}`;
      }
      historyBreakdownString += ` = <strong>${finalTotalWithModifier}</strong>`;
      
      if (diceChain.length === 0 && modifier === 0) {
        historyBreakdownString = "0 = <strong>0</strong>";
      } else if (diceChain.length === 0 && modifier !== 0) {
        historyBreakdownString = `${modifier > 0 ? '+' : ''}${modifier} = <strong>${finalTotalWithModifier}</strong>`;
      }
      
      const resultDetails: RollResultDetails = {
        id: rollId,
        total: finalTotalWithModifier,
        breakdown: historyBreakdownString, 
        isCritical: overallIsCritical,
        diceType: primaryDiceTypeForOutput,
        rollSegments: outputRollSegments,
        modifier: modifier,
        advantageState: advantageState,
        formula: historyBreakdownString // Storing the HTML breakdown for history
      };
      setLastRollOutput(resultDetails);

      const historyEntry: HistoryEntry = {
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
      setDiceChain([]);
      setModifier(0);
      setModifierInput('0');
      setAdvantageState(null);
      // setActiveRollFormulaDisplay(<span className="text-muted-foreground text-lg">Build your roll</span>); // Keep result visible
    }, 300);
  };

  const handleCoinFlip = () => {
    setDiceChain([]);
    setModifier(0);
    setModifierInput('0');
    setAdvantageState(null);
    setActiveRollFormulaDisplay(<span className="text-muted-foreground text-lg">Build your roll</span>);


    setIsRolling('coin');
    setCriticalMessage(null);
    // setLastRollOutput(null); // Keep last roll visible until new one completes


    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const resultId = String(Date.now() + Math.random());
      const breakdownString = `Coin Flip: <strong>${result}</strong>`;
      const resultDetails: RollResultDetails = {
        id: resultId,
        total: result,
        breakdown: breakdownString,
        diceType: 'coin',
      };
      setLastRollOutput(resultDetails); 

      const historyEntry: HistoryEntry = {
        timestamp: new Date(),
        ...resultDetails,
      };
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      setIsRolling(false);
    }, 300);
  };

  const handleResetDice = () => {
    setDiceChain([]);
    setModifier(0);
    setModifierInput('0');
    setAdvantageState(null);
    setLastRollOutput(null);
    setActiveRollFormulaDisplay(<span className="text-muted-foreground text-lg">Build your roll</span>);
  };

  const groupRollsByDay = (history: HistoryEntry[]): Record<string, HistoryEntry[]> => {
    return history.reduce((acc, roll) => {
      const dateKey = formatISO(roll.timestamp, { representation: 'date' });
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(roll);
      return acc;
    }, {} as Record<string, HistoryEntry[]>);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!mounted) return dateStr; 
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
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
      <Card className="shadow-lg flex flex-col flex-1 min-h-0"> {/* Changed shadow-md to shadow-lg */}
         <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
          <CardTitle className="flex items-center text-lg">
            <Dices className="mr-2 h-5 w-5 text-primary" />
            Dice Roller
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsHistorySheetOpen(true)} className="h-8 w-8">
            <History className="h-4 w-4" />
            <span className="sr-only">Roll History</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pt-4 pb-4"> {/* Restored pb-4 */}
            <div className="mb-4 flex min-h-[90px] flex-col items-center justify-center rounded-lg border border-dashed border-primary/50 bg-muted/20 p-4 text-primary shadow-inner">
                {isRolling === 'coin' ? <Disc3 className="h-10 w-10 animate-spin text-accent" />
                 : isRolling ? <Dices className="h-10 w-10 animate-spin text-accent" />
                 : lastRollOutput ? (
                    <div className="flex items-center justify-center gap-2">
                        {lastRollOutput.diceType === 'coin' ? (
                            <Disc3 className="h-10 w-10 text-foreground" />
                        ) : (
                            <Dices className="h-10 w-10 text-foreground" />
                        )}
                        <span
                            key={lastRollOutput.id}
                            className="text-5xl font-bold text-foreground animate-roll-burst"
                        >
                            {lastRollOutput.total}
                        </span>
                    </div>
                ) : (
                    activeRollFormulaDisplay
                )}
            </div>

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
                    "h-auto aspect-square w-full flex flex-col items-center justify-center p-1 text-xs",
                    currentDieCount > 0 ? 'border-primary shadow-md' : 'border-input'
                  )}
                  variant="outline"
                  disabled={!!isRolling}
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
            <TooltipProvider>
               <Tooltip>
                <TooltipTrigger asChild>
                     <Button
                        key="coin"
                        onClick={handleCoinFlip}
                        className={cn(
                            "font-semibold transition-transform hover:scale-105 active:scale-95",
                            "h-auto aspect-square w-full flex flex-col items-center justify-center p-1 text-xs",
                            "text-primary-foreground" 
                        )}
                        variant="default" 
                        disabled={!!isRolling}
                        aria-label="Flip a coin"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <Disc3 className="h-5 w-5" /> 
                            <span className="text-[10px] mt-0">FLIP</span>
                        </div>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Heads or Tails</p></TooltipContent>
               </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1"> {/* Modifier controls */}
              <Button variant="outline" size="icon" onClick={() => handleModifierValueChange(-1)} disabled={!!isRolling} className="h-8 w-8">
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
                  disabled={!!isRolling}
                >
                  {modifier >= 0 ? `+${modifier}` : modifier}
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => handleModifierValueChange(1)} disabled={!!isRolling} className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
             <div className="flex items-center gap-2 flex-1"> {/* Advantage/Disadvantage controls */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => handleAdvantageToggle('advantage')}
                                disabled={!!isRolling}
                                className={cn(
                                    "text-xs px-3 py-1.5 h-8 transition-colors duration-150 flex-1 font-bold",
                                    advantageState === 'advantage'
                                    ? "bg-success text-success-foreground border-success"
                                    : "border-success text-success hover:bg-success hover:text-success-foreground",
                                    "border"
                                )}
                                variant={advantageState === 'advantage' ? 'success' : 'outline'}
                                aria-pressed={advantageState === 'advantage'}
                                >
                                ADV.
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Higher of 2d20</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => handleAdvantageToggle('disadvantage')}
                                disabled={!!isRolling}
                                className={cn(
                                    "text-xs px-3 py-1.5 h-8 transition-colors duration-150 flex-1 font-bold",
                                    advantageState === 'disadvantage'
                                    ? "bg-destructive text-destructive-foreground border-destructive"
                                    : "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground",
                                    "border"
                                )}
                                variant={advantageState === 'disadvantage' ? 'destructive' : 'outline'}
                                aria-pressed={advantageState === 'disadvantage'}
                                >
                                DIS.
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Lower of 2d20</p></TooltipContent>
                     </Tooltip>
                </TooltipProvider>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <Button onClick={executeDiceChainRoll} className="w-full" disabled={!!isRolling || (diceChain.length === 0 && modifier === 0)}>
                Roll Dice
            </Button>
            <Button onClick={handleResetDice} variant="outline" className="w-full" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Dice
            </Button>
             {lastRollOutput && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">Last Roll:</Label>
                 <div 
                    className="mt-1 rounded-md bg-muted/50 p-2 text-xs text-foreground whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: lastRollOutput.breakdown }}
                  />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Roll History</SheetTitle>
            <SheetDescription>Your most recent dice rolls and coin flips.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]"> 
            <div className="p-4 space-y-3">
              {rollHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No rolls yet.</p>
              ) : (
                Object.entries(groupRollsByDay(rollHistory))
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) 
                  .map(([date, rollsInDay]) => (
                    <div key={date}>
                      <h4 className="font-semibold text-sm mb-1.5 text-muted-foreground">{formatDisplayDate(date)}</h4>
                      <ul className="space-y-1.5">
                        {rollsInDay.map((entry, index) => (
                          <React.Fragment key={entry.id}>
                            <li 
                                className="text-xs flex justify-between items-start py-1"
                                dangerouslySetInnerHTML={{ __html: entry.breakdown }}
                            />
                             <span className="text-muted-foreground/80 text-[11px] flex-shrink-0 ml-auto pl-2">
                                {mounted && new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                            {index < rollsInDay.length - 1 && <Separator className="my-0.5 bg-border/70" />}
                          </React.Fragment>
                        ))}
                      </ul>
                       { Object.keys(groupRollsByDay(rollHistory)).sort((a,b) => b.localeCompare(a)).indexOf(date) < Object.keys(groupRollsByDay(rollHistory)).length - 1 &&
                            <Separator className="my-3" />
                        }
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
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

