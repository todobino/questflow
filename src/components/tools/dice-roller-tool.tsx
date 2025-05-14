
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dices, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
type AdvantageStateType = 'advantage' | 'disadvantage' | null;
type RollType = DiceType | 'coin';

interface DiceChainEntry {
  die: DiceType;
  count: number;
}

interface RollResultDetails {
  total: number | string; // Can be number for dice, string for "Heads"/"Tails"
  breakdown: string;
  isCritical?: 'success' | 'failure';
  diceType: RollType; // To differentiate coin flips from dice rolls
  rawRolls?: (number | string)[]; // Store individual rolls, string for adv/disadv notation
  chosenRoll?: number | string; // The roll taken after adv/disadv
}

type HistoryEntry = {
  id: string;
  timestamp: Date;
} & RollResultDetails; // Simplified to use RollResultDetails directly


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

  const getRollDetailsDisplay = (rollDetails: { rawRolls?: (number | string)[], chosenRoll?: number | string, diceType: RollType, advantageState?: AdvantageStateType }): React.ReactNode => {
    if (rollDetails.diceType === 'coin' || !rollDetails.rawRolls || rollDetails.rawRolls.length === 0) {
      return null; 
    }
  
    if (rollDetails.diceType === 'd20' && rollDetails.advantageState && rollDetails.rawRolls.length === 2) {
      const [roll1, roll2] = rollDetails.rawRolls as [number, number]; // Assuming rawRolls are numbers here
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
  
    // For single dice or multiple non-d20 dice
    return <>({rollDetails.rawRolls.join(', ')})</>;
  };


  useEffect(() => {
    if (diceChain.length === 0 && modifier === 0) {
      setActiveRollFormulaDisplay(<span className="text-muted-foreground">Build your roll</span>);
      setLastRollOutput(null); // Clear previous roll output when formula is empty
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
        parts.push(<span key={`plus-${index}`} className="mx-0.5 text-muted-foreground text-xs">+</span>);
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
    setLastRollOutput(null); // Clear previous roll output when formula changes
  }, [diceChain, modifier]);


  const handleModifierValueChange = (delta: number) => {
    setModifier(prev => prev + delta);
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
  };
  
  const handleModifierInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleModifierInputBlur();
    }
  };

 const handleAdvantageToggle = (clickedState: 'advantage' | 'disadvantage') => {
    setAdvantageState(prevState => prevState === clickedState ? null : clickedState);
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
      let formulaString = "";
      const allRawRolls: (number|string)[] = [];
      let anyD20Rolled = false;


      diceChain.forEach((item, chainIndex) => {
        const dieConfig = DICE_CONFIG.find(d => d.type === item.die);
        if (!dieConfig) return;

        formulaString += `${item.count > 1 ? item.count : ''}${item.die}`;
        
        const rollsForThisDieType: (number|string)[] = [];
        for (let i = 0; i < item.count; i++) {
          let chosenRoll: number;
          let rawRoll1: number | undefined, rawRoll2: number | undefined;

          if (item.die === 'd20') {
            anyD20Rolled = true;
            rawRoll1 = rollSingleDie(dieConfig.sides);
            if (advantageState) {
              rawRoll2 = rollSingleDie(dieConfig.sides);
              chosenRoll = advantageState === 'advantage' ? Math.max(rawRoll1, rawRoll2) : Math.min(rawRoll1, rawRoll2);
              rollsForThisDieType.push(`${chosenRoll}{${rawRoll1},${rawRoll2}}`); // Store for detailed breakdown
            } else {
              chosenRoll = rawRoll1;
              rollsForThisDieType.push(String(chosenRoll));
            }
            
            // Critical check is only for chosen d20 rolls
            if (chosenRoll === 20 && finalCriticalEncountered !== 'failure') finalCriticalEncountered = 'success';
            if (chosenRoll === 1) finalCriticalEncountered = 'failure'; 
          } else {
            chosenRoll = rollSingleDie(dieConfig.sides);
            rollsForThisDieType.push(String(chosenRoll));
          }
          currentTotal += chosenRoll;
        }
        allRawRolls.push(...rollsForThisDieType);
        breakdownParts.push(`${item.count > 1 ? item.count : ''}${item.die}:[${rollsForThisDieType.join(',')}]`);
        if (chainIndex < diceChain.length - 1 || modifier !==0) formulaString += " + ";
      });
      
      currentTotal += modifier;
      if (modifier !== 0) {
        formulaString += ` ${modifier > 0 ? '+' : ''}${modifier}`; 
        breakdownParts.push(`Mod:${modifier > 0 ? '+' : ''}${modifier}`);
      }
      if (formulaString === "") formulaString = "0"; // Should not happen if button is disabled for empty roll

      const resultDetails: RollResultDetails = {
        total: currentTotal,
        breakdown: `${breakdownParts.join('; ')} = ${currentTotal}`,
        isCritical: anyD20Rolled ? finalCriticalEncountered : undefined, // Only set critical if a D20 was involved
        diceType: diceChain[0]?.die || 'd6', // Fallback, ideally pick first die type or make it more robust
        rawRolls: allRawRolls,
        chosenRoll: currentTotal - modifier, // This is a simplification, chosenRoll should ideally be per die or for a single d20
        advantageState: advantageState
      };
      setLastRollOutput(resultDetails);

      const historyEntry: HistoryEntry = {
        id: String(Date.now()),
        timestamp: new Date(),
        ...resultDetails, // Spread the detailed result
      };
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      
      if (resultDetails.isCritical === 'success') {
        setCriticalMessage({ text: "CRITICAL SUCCESS!", colorClass: "text-success" });
      } else if (resultDetails.isCritical === 'failure') {
        setCriticalMessage({ text: "CRITICAL FAILURE!", colorClass: "text-destructive" });
      }
      
      setDiceChain([]);
      // setModifier(0); // Keep modifier for subsequent similar rolls if desired, or clear it
      setIsRolling(false);
    }, 300);
  };

  const handleCoinFlip = () => {
    setIsRolling(true);
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const historyEntry: HistoryEntry = {
        id: String(Date.now()),
        timestamp: new Date(),
        diceType: 'coin',
        total: result,
        breakdown: `Coin Flip: ${result}`,
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
                  "text-xs px-2 py-1 h-auto transition-colors duration-150",
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
                  "text-xs px-2 py-1 h-auto transition-colors duration-150",
                   advantageState === 'disadvantage' ? "border border-destructive" : "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive border-input"
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
                {mounted && lastRollOutput.diceType !== 'coin' && (
                  <p className="text-muted-foreground text-xs mt-1 text-center whitespace-pre-wrap">
                    {getRollDetailsDisplay({
                        rawRolls: lastRollOutput.rawRolls,
                        chosenRoll: lastRollOutput.chosenRoll,
                        diceType: lastRollOutput.diceType,
                        advantageState: advantageState // Pass current advantage state for rendering
                    })}
                    {lastRollOutput.rawRolls && lastRollOutput.rawRolls.length > 0 && lastRollOutput.modifier !== 0 ? ' ' : ''}
                    {lastRollOutput.modifier !== 0 ? `${lastRollOutput.modifier > 0 ? '+' : ''}${lastRollOutput.modifier}`: ''}
                    {lastRollOutput.rawRolls && lastRollOutput.rawRolls.length > 0 ? ` = ${lastRollOutput.total}` : ''}
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
                    {activeRollFormulaDisplay}
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

