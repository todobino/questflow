
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dices } from 'lucide-react';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
interface DiceRoll {
  id: string;
  type: DiceType;
  result: number;
  timestamp: Date;
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

  useEffect(() => {
    setMounted(true);
  }, []);


  const rollDice = (dice: DiceType, sides: number) => {
    setIsRolling(true);
    setCurrentRoll(null); // Clear previous roll display immediately

    // Short animation
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      const newRoll: DiceRoll = {
        id: String(Date.now()),
        type: dice,
        result,
        timestamp: new Date(),
      };
      setCurrentRoll(newRoll);
      setRolls(prevRolls => [newRoll, ...prevRolls.slice(0, 9)]); // Keep last 10 rolls
      setIsRolling(false);
    }, 300); // Animation duration
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Roll Dice</CardTitle>
          <CardDescription>Select a die type to roll it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-center rounded-lg border border-dashed border-primary/50 bg-muted/20 p-8 text-5xl font-bold text-primary shadow-inner min-h-[120px]">
            {isRolling && <Dices className="h-12 w-12 animate-spin text-accent" />}
            {!isRolling && currentRoll ? (
              <span className="transition-opacity duration-300 ease-in-out animate-pulse">{currentRoll.result}</span>
            ) : (
              !isRolling && <span className="text-muted-foreground">0</span>
            )}
          </div>
          {mounted && currentRoll && !isRolling && (
              <p className="text-center text-muted-foreground text-xs mb-4">
                You rolled a {currentRoll.type} and got {currentRoll.result}.
              </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DICE_CONFIG.map(({ type, sides }) => (
              <Button
                key={type}
                onClick={() => rollDice(type, sides)}
                className="h-12 text-md font-semibold transition-transform hover:scale-105 active:scale-95"
                size="lg"
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
          <CardDescription className="text-xs">Your last 10 rolls.</CardDescription>
        </CardHeader>
        <CardContent>
          {rolls.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">No rolls yet.</p>
          ) : (
            <ScrollArea className="h-[200px] rounded-md border p-1">
              {rolls.map((roll, index) => (
                <div key={roll.id}>
                  <div className="flex justify-between items-center p-1.5 text-xs">
                    <span>
                      <span className="font-semibold">{roll.type.toUpperCase()}:</span> {roll.result}
                    </span>
                    {mounted && (
                         <span className="text-xs text-muted-foreground">
                            {roll.timestamp.toLocaleTimeString()}
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
