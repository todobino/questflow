
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREDEFINED_TABLES, type RandomTable, type TableItem } from '@/lib/random-tables-data';
import { useToast } from '@/hooks/use-toast';
import { Dices, ListChecks, PlusCircle, Rows, Columns, MessageSquare, Sparkles, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCampaignContext } from '@/contexts/campaign-context';

export default function RandomTablesPage() {
  const { activeCampaign } = useCampaignContext();
  const [availableTables, setAvailableTables] = useState<RandomTable[]>(PREDEFINED_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(PREDEFINED_TABLES[0]?.id);
  const [rolledResult, setRolledResult] = useState<TableItem | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRollTable = () => {
    if (!selectedTableId) {
      toast({ title: 'Error', description: 'Please select a table to roll on.', variant: 'destructive' });
      return;
    }
    const table = availableTables.find(t => t.id === selectedTableId);
    if (!table || table.items.length === 0) {
      toast({ title: 'Error', description: 'Selected table is empty or not found.', variant: 'destructive' });
      return;
    }

    setIsRolling(true);
    setRolledResult(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * table.items.length);
      const result = table.items[randomIndex];
      setRolledResult(result);
      setIsRolling(false);
    }, 300);
  };

  const handleAddNewTable = () => {
    // Placeholder for future functionality
  };
  
  const getIconForTable = (tableId: string) => {
    if (tableId.includes('weather')) return <Sparkles className="mr-2 h-4 w-4" />;
    if (tableId.includes('tavern')) return <MessageSquare className="mr-2 h-4 w-4" />;
    if (tableId.includes('magic')) return <Sparkles className="mr-2 h-4 w-4" />;
    if (tableId.includes('npc') || tableId.includes('quirks')) return <Users className="mr-2 h-4 w-4" />;
    if (tableId.includes('loot') || tableId.includes('trinkets')) return <Rows className="mr-2 h-4 w-4" />;
    if (tableId.includes('plot') || tableId.includes('rumors')) return <Columns className="mr-2 h-4 w-4" />;
    return <ListChecks className="mr-2 h-4 w-4" />;
  };


  return (
    <>
      <PageHeader
        title="Random Tables"
        description="Generate unexpected twists, mundane details, or crucial plot hooks for your campaigns."
      />
      <div className="grid grid-cols-1 gap-6"> 
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Dices className="mr-2 h-5 w-5 text-primary" /> Roll on a Table</CardTitle>
            <CardDescription>Select a table from the dropdown and click "Roll" to get a random result.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
            <div className="space-y-4"> 
              <Select
                value={selectedTableId}
                onValueChange={(value) => {
                  setSelectedTableId(value);
                  setRolledResult(null); 
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map(table => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleRollTable} disabled={isRolling || !selectedTableId} className="w-full md:w-auto">
                {isRolling ? 'Rolling...' : 'Roll Table'}
              </Button>
            </div>

            <div className="min-h-[100px]"> 
              {mounted && rolledResult && (
                <Card className="bg-muted/50 p-4 shadow-inner h-full">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg">Result:</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-md whitespace-pre-wrap">{rolledResult.value}</p>
                  </CardContent>
                </Card>
              )}
              {mounted && isRolling && (
                <Card className="bg-muted/50 p-4 shadow-inner h-full flex items-center justify-center">
                  <Dices className="h-8 w-8 animate-spin text-primary" />
                </Card>
              )}
              {mounted && !rolledResult && !isRolling && (
                 <Card className="bg-muted/30 border-dashed p-4 shadow-inner h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">Your rolled result will appear here.</p>
                 </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" /> Available Tables</CardTitle>
            <CardDescription>Browse the collection of pre-defined random tables.</CardDescription>
          </CardHeader>
          <CardContent>
            {availableTables.length === 0 ? (
              <p className="text-center text-muted-foreground">No tables available.</p>
            ) : (
              <ScrollArea className="h-[300px] pr-3">
                <ul className="space-y-3">
                  {availableTables.map(table => (
                    <li 
                      key={table.id} 
                      className={`rounded-md border p-3 transition-all duration-150 hover:shadow-md ${selectedTableId === table.id ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                      onClick={() => {
                          setSelectedTableId(table.id);
                          setRolledResult(null);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTableId(table.id)}
                    >
                      <h4 className="font-semibold flex items-center">
                          {getIconForTable(table.id)}
                          {table.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{table.description}</p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddNewTable} variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Table (Soon)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
