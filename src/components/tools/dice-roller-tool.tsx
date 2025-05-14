
'use client';

import { useState, useEffect, useRef } from 'react';
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

interface RollResultDetails {
  total: number | string;
  breakdown: string;
  isCritical?: 'success' | 'failure';
  diceType: RollType; 
  rawRolls?: (number | string)[]; 
  chosenRoll?: number | string; 
  advantageState?: AdvantageStateType | null;
  modifier?: number;
  formula?: string; // To store the built formula like "2d6 + 1d4 + 3"
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
  
  const [activeRollFormulaDisplay, setActiveRollFormulaDisplay] = useState<React.ReactNode>(null);
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

  const getRollDetailsDisplay = (rollDetails: { rawRolls?: (number | string)[], chosenRoll?: number | string, diceType: DiceType, advantageState?: AdvantageStateType | null }): React.ReactNode => {
    if (!rollDetails.rawRolls || rollDetails.rawRolls.length === 0) {
      return null; 
    }
  
    if (rollDetails.diceType === 'd20' && rollDetails.advantageState && rollDetails.rawRolls.length === 2) {
      const [roll1, roll2] = rollDetails.rawRolls as [number, number];
      const chosen = rollDetails.chosenRoll as number;
      
      return (
        <>
          (
          <span className={cn(chosen === roll1 ? (rollDetails.advantageState === 'advantage' ? 'font-bold text-success' : 'font-bold text-destructive') : '')}>{roll1}</span>
          , 
          <span className={cn(chosen === roll2 ? (rollDetails.advantageState === 'advantage' ? 'font-bold text-success' : 'font-bold text-destructive') : '')}>{roll2}</span>
          )
        </>
      );
    }
      
    return <>({rollDetails.rawRolls.join(', ')})</>;
  };


  useEffect(() => {
    if (diceChain.length === 0 && modifier === 0) {
      setActiveRollFormulaDisplay(<span className="text-muted-foreground">Build your roll</span>);
      setLastRollOutput(null);
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
              size="sm"
              className="h-auto px-1 py-0.5 font-bold text-primary hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
        parts.push(<span key={`plus-${index}`} className="mx-0.5 text-muted-foreground text-xs">+</span>);
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
              className="h-auto px-1 py-0.5 font-bold text-primary hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
    setLastRollOutput(null); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceChain, modifier]);


  const handleModifierValueChange = (delta: number) => {
    setModifier(prev => prev + delta);
    setLastRollOutput(null); // Clear last roll when formula changes
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
    setLastRollOutput(null); // Clear last roll when formula changes
  };
  
  const handleModifierInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleModifierInputBlur();
    }
  };

 const handleAdvantageToggle = (clickedState: 'advantage' | 'disadvantage') => {
    setAdvantageState(prevState => prevState === clickedState ? null : clickedState);
    setLastRollOutput(null); // Clear last roll when formula changes
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
    setLastRollOutput(null); // Clear last roll when formula changes
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
    setLastRollOutput(null); // Clear last roll when formula changes
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
      let currentTotal = 0;
      const breakdownParts: string[] = [];
      let finalCriticalEncountered: 'success' | 'failure' | undefined = undefined;
      let formulaStringParts: string[] = [];
      const allRawRollsCollected: (number|string)[] = [];


      diceChain.forEach((item) => {
        const dieConfig = DICE_CONFIG.find(d => d.type === item.die);
        if (!dieConfig) return;

        formulaStringParts.push(`${item.count > 1 ? item.count : ''}${item.die}`);
        
        const rollsForThisDieType: (number|string)[] = [];
        let sumForThisDieType = 0;

        for (let i = 0; i < item.count; i++) {
          let chosenRoll: number;
          let rawRoll1: number | undefined, rawRoll2: number | undefined;

          if (item.die === 'd20') {
            rawRoll1 = rollSingleDie(dieConfig.sides);
            if (advantageState) {
              rawRoll2 = rollSingleDie(dieConfig.sides);
              chosenRoll = advantageState === 'advantage' ? Math.max(rawRoll1, rawRoll2) : Math.min(rawRoll1, rawRoll2);
              rollsForThisDieType.push(chosenRoll); 
              allRawRollsCollected.push(`${chosenRoll} (${rawRoll1},${rawRoll2})`);
            } else {
              chosenRoll = rawRoll1;
              rollsForThisDieType.push(chosenRoll);
              allRawRollsCollected.push(chosenRoll);
            }
            
            if (chosenRoll === 20 && finalCriticalEncountered !== 'failure') finalCriticalEncountered = 'success';
            if (chosenRoll === 1) finalCriticalEncountered = 'failure'; 
          } else {
            chosenRoll = rollSingleDie(dieConfig.sides);
            rollsForThisDieType.push(chosenRoll);
            allRawRollsCollected.push(chosenRoll);
          }
          sumForThisDieType += chosenRoll;
        }
        currentTotal += sumForThisDieType;
        breakdownParts.push(`${item.count > 1 ? item.count : ''}${item.die}:[${rollsForThisDieType.join(',')}]`);
      });
      
      currentTotal += modifier;
      let finalFormula = formulaStringParts.join(' + ');
      if (modifier !== 0) {
        finalFormula += ` ${modifier > 0 ? '+' : ''} ${Math.abs(modifier)}`;
        breakdownParts.push(`Mod:${modifier > 0 ? '+' : ''}${modifier}`);
      }
      if (finalFormula === "") finalFormula = "0";


      const resultDetails: RollResultDetails = {
        total: currentTotal,
        breakdown: `${finalFormula} = ${currentTotal} (Details: ${breakdownParts.join('; ')})`,
        isCritical: finalCriticalEncountered, 
        diceType: diceChain[0]?.die || 'd6', 
        rawRolls: allRawRollsCollected, 
        chosenRoll: currentTotal - modifier, 
        advantageState: advantageState,
        modifier: modifier,
        formula: finalFormula,
      };
      setLastRollOutput(resultDetails);

      const historyEntry: HistoryEntry = {
        id: String(Date.now()),
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
      // setModifier(0); // Decided to keep modifier for subsequent rolls
      setIsRolling(false);
    }, 300);
  };

  const handleCoinFlip = () => {
    setIsRolling(true);
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const resultDetails: RollResultDetails = {
        total: result,
        breakdown: `Coin Flip: ${result}`,
        diceType: 'coin',
      };
      setLastRollOutput(resultDetails); // Show coin flip result briefly in main display
      const historyEntry: HistoryEntry = {
        id: String(Date.now()),
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
                "h-auto aspect-square flex items-center justify-center p-1 text-xs"
              )}
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
                  "text-xs px-2 py-1 h-auto transition-colors duration-150 w-28", // Increased width
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
                  "text-xs px-2 py-1 h-auto transition-colors duration-150 w-28", // Increased width
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
              <>
                <span className="text-4xl font-bold">{lastRollOutput.total}</span>
                 {mounted && lastRollOutput.diceType !== 'coin' && lastRollOutput.formula && (
                  <p className="text-muted-foreground text-xs mt-1 text-center whitespace-pre-wrap">
                    {lastRollOutput.formula.replace(/(\d+d\d+)/g, (match, p1) => {
                        const dieRolls = lastRollOutput.rawRolls?.filter(r => typeof r === 'string' && r.includes(p1.split('d')[1]) || typeof r === 'number') || [];
                        // This logic for display is simplified; more complex logic needed for precise adv/disadv grouping per die type
                        // For now, just shows the overall chosen rolls with adv/disadv indication if applicable.
                        if (lastRollOutput.diceType === 'd20' && lastRollOutput.advantageState && lastRollOutput.rawRolls?.find(r => typeof r === 'string' && r.includes('('))) {
                            const d20Rolls = lastRollOutput.rawRolls.find(r => typeof r === 'string' && r.includes('(')) as string;
                            const mainRoll = d20Rolls.substring(0, d20Rolls.indexOf('('));
                            const subRolls = d20Rolls.substring(d20Rolls.indexOf('('));
                            return (
                                <>
                                <span className={cn(lastRollOutput.advantageState === 'advantage' ? 'text-success font-bold' : 'text-destructive font-bold')}>{mainRoll}</span>
                                {subRolls}
                                </>
                            );
                        }
                        return match; // Fallback for non-d20 or non-adv/disadv
                    })}
                    {lastRollOutput.modifier !== 0 ? ` ${lastRollOutput.modifier > 0 ? '+' : ''} ${Math.abs(lastRollOutput.modifier ?? 0)}` : ''}
                    {` = ${lastRollOutput.total}`}
                  </p>
                )}
                 {mounted && lastRollOutput.diceType === 'coin' && (
                    <p className="text-muted-foreground text-xs mt-1 text-center whitespace-pre-wrap">
                        {lastRollOutput.breakdown}
                    </p>
                 )}
              </>
            ) : (
                 <div className="text-center text-lg font-medium">
                    <TooltipProvider>
                      {activeRollFormulaDisplay}
                    </TooltipProvider>
                 </div>
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
                    {entry.diceType === 'coin' ? (
                       <span className="whitespace-pre-wrap break-words text-left"> 
                         {entry.breakdown}
                       </span>
                    ) : (
                       <span className="whitespace-pre-wrap break-words text-left"> 
                        {entry.breakdown} 
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

