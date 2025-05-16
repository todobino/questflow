
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter as SheetModalFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, History, Search } from 'lucide-react';

interface SearchHistoryEntry {
  id: string;
  term: string;
  timestamp: string;
}

export function ReferenceTool() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    // In a real app, perform search logic here (e.g., API call, filter local data)
    console.log('Searching for:', searchTerm);
    
    // Add to search history (simplified)
    const newEntry: SearchHistoryEntry = {
      id: String(Date.now()),
      term: searchTerm,
      timestamp: new Date().toISOString(),
    };
    setSearchHistory(prev => [newEntry, ...prev.slice(0, 19)]); // Keep last 20
    // setSearchTerm(''); // Optionally clear search term after search
  };

  return (
    <div className="h-full flex flex-col border border-border shadow-md rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
        <h3 className="flex items-center text-lg font-semibold">
          <FileText className="mr-2 h-5 w-5 text-primary" />
          Reference
        </h3>
        <Button variant="ghost" size="icon-sm" onClick={() => setIsHistorySheetOpen(true)} className="h-7 w-7">
          <History className="h-4 w-4" />
          <span className="sr-only">Search History</span>
        </Button>
      </div>

      {/* Main Content Area (Placeholder) */}
      <div className="flex-grow p-3 overflow-y-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Information Display</CardTitle>
            <CardDescription>Details from your search or selected reference material will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the search bar below to find information about rules, lore, items, or any other reference material.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer with Search Bar */}
      <div className="p-3 border-t flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reference..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
      </div>

      {/* Search History Sheet */}
      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Search History</SheetTitle>
            <SheetDescription>
              Your recent reference searches.
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-120px)]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {searchHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No search history yet.</p>
                ) : (
                  searchHistory.map(entry => (
                    <div key={entry.id} className="p-2 border rounded-md text-xs hover:bg-muted/50 cursor-pointer" onClick={() => { setSearchTerm(entry.term); setIsHistorySheetOpen(false); handleSearch(); }}>
                      <p className="font-medium">{entry.term}</p>
                      <p className="text-muted-foreground/80 text-[10px]">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
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
