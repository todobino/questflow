
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dices, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
type AdvantageStateType = 'advantage' | 'disadvantage' | null;

interface DiceRoll {
  id: string;
  diceType: DiceType;
  rawRolls: number[];
  chosenRoll: number;
  modifier: number;
  advantageState: AdvantageStateType;
  finalResult: number;
  timestamp: Date;
}

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
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [modifier, setModifier] = useState(0);
  const [isEditingModifier, setIsEditingModifier] = useState(false);
  const [modifierInput, setModifierInput] = useState('0');
  const [advantageState, setAdvantageState] = useState<AdvantageStateType>(null);
  const [criticalMessage, setCriticalMessage] = useState<CriticalMessage | null>(null);


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
      const timer = setTimeout(() => {
        setCriticalMessage(null);
      }, 1800); // Duration of the explode animation + a bit
      return () => clearTimeout(timer);
    }
  }, [criticalMessage]);

  const handleModifierChange = (delta: number) => {
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

  const rollDie = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const executeRoll = (diceType: DiceType, sides: number) => {
    setIsRolling(true);
    setCurrentRoll(null);
    setCriticalMessage(null); // Clear previous critical message

    setTimeout(() => {
      let rawRolls: number[] = [];
      let chosenRoll: number;

      if (diceType === 'd20' && advantageState) {
        const roll1 = rollDie(sides);
        const roll2 = rollDie(sides);
        rawRolls = [roll1, roll2];
        if (advantageState === 'advantage') {
          chosenRoll = Math.max(roll1, roll2);
        } else { // disadvantage
          chosenRoll = Math.min(roll1, roll2);
        }
      } else {
        const roll = rollDie(sides);
        rawRolls = [roll];
        chosenRoll = roll;
      }

      const finalResult = chosenRoll + modifier;

      const newRoll: DiceRoll = {
        id: String(Date.now()),
        diceType,
        rawRolls,
        chosenRoll,
        modifier,
        advantageState: diceType === 'd20' ? advantageState : null, 
        finalResult,
        timestamp: new Date(),
      };

      setCurrentRoll(newRoll);
      setRolls(prevRolls => [newRoll, ...prevRolls.slice(0, 19)]);
      setIsRolling(false);

      if (diceType === 'd20') {
        if (newRoll.chosenRoll === 20) {
          setCriticalMessage({ text: "CRITICAL SUCCESS!", colorClass: "text-success" });
        } else if (newRoll.chosenRoll === 1) {
          setCriticalMessage({ text: "CRITICAL FAILURE!", colorClass: "text-destructive" });
        }
      }
    }, 300);
  };
  
  const getRollDescription = (roll: DiceRoll): string => {
    let desc = `Rolled ${roll.diceType}`;
    if (roll.rawRolls.length > 1 && roll.advantageState) {
      desc += ` (${roll.rawRolls.join(', ')}) taking ${roll.chosenRoll}`;
    } else {
      desc += ` (${roll.chosenRoll})`;
    }
    if (roll.modifier !== 0) {
      desc += ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`;
    }
    if (roll.diceType === 'd20' && roll.advantageState) {
      desc += ` with ${roll.advantageState.charAt(0).toUpperCase() + roll.advantageState.slice(1)}`;
    }
    desc += ` = ${roll.finalResult}`;
    return desc;
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
        <CardHeader>
          <CardTitle className="text-lg">Dice Roller Deluxe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4 flex items-center justify-center rounded-lg border border-dashed border-primary/50 bg-muted/20 p-6 text-4xl font-bold text-primary shadow-inner min-h-[90px]">
            {isRolling && <Dices className="h-10 w-10 animate-spin text-accent" />}
            {!isRolling && currentRoll ? (
              <span>{currentRoll.finalResult}</span>
            ) : (
              !isRolling && <span className="text-muted-foreground">0</span>
            )}
          </div>
          {mounted && currentRoll && !isRolling && (
              <p className="text-center text-muted-foreground text-xs -mt-2 mb-2">
                {getRollDescription(currentRoll)}
              </p>
          )}

          {/* Modifier Controls */}
          <div className="space-y-1 pt-1"> {/* Removed Label */}
            <div className="flex items-center justify-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleModifierChange(-1)} disabled={isRolling} className="h-8 w-8">
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
                  aria-label="Roll modifier"
                />
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setModifierInput(String(modifier)); 
                    setIsEditingModifier(true);
                  }} 
                  className="h-8 w-16 text-sm"
                  disabled={isRolling}
                  aria-label={`Current modifier: ${modifier >= 0 ? `+${modifier}` : modifier}. Click to edit.`}
                >
                  {modifier >= 0 ? `+${modifier}` : modifier}
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => handleModifierChange(1)} disabled={isRolling} className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advantage/Disadvantage Controls for d20 */}
          <div className="space-y-1 pt-2"> {/* Removed Label */}
            <RadioGroup 
              value={advantageState || 'none'} 
              onValueChange={(value) => setAdvantageState(value === 'none' ? null : value as AdvantageStateType)} 
              className="flex justify-center space-x-2"
              aria-label="d20 roll state"
              disabled={isRolling}
            >
              {(['none', 'advantage', 'disadvantage'] as const).map((stateValue) => (
                <Label
                  key={stateValue}
                  htmlFor={`adv-${stateValue}`}
                  className={cn(
                    "flex items-center space-x-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    (advantageState === stateValue || (stateValue === 'none' && advantageState === null))
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground"
                  )}
                >
                  <RadioGroupItem value={stateValue} id={`adv-${stateValue}`} className="sr-only" />
                  {stateValue.charAt(0).toUpperCase() + stateValue.slice(1)}
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <Separator />

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {DICE_CONFIG.map(({ type, sides }) => (
              <Button
                key={type}
                onClick={() => executeRoll(type, sides)}
                className="h-10 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                size="default"
                variant="outline"
                disabled={isRolling}
              >
                {type.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle  className="text-lg">Roll History</CardTitle>
          <CardDescription className="text-xs">Your last 20 rolls.</CardDescription>
        </CardHeader>
        <CardContent>
          {rolls.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">No rolls yet.</p>
          ) : (
            <ScrollArea className="h-[150px] rounded-md border p-1 text-xs">
              {rolls.map((roll, index) => (
                <div key={roll.id}>
                  <div className="flex justify-between items-center p-1.5">
                    <span className="whitespace-pre-wrap break-all">{getRollDescription(roll)}</span>
                    {mounted && (
                         <span className="text-muted-foreground ml-2 flex-shrink-0">
                            {roll.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                  </div>
                  {index < rolls.length - 1 && <Separator />}
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

