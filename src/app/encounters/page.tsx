
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { MonsterListItem, MonsterListResponse, MonsterDetails } from '@/lib/types';
import { Loader2, Search, Shield, Heart, X, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider'; // For future CR filter

const DND_API_BASE_URL = 'https://www.dnd5eapi.co';

interface MonsterBrowserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  allMonsters: MonsterListItem[];
  onMonsterSelect: (monsterUrl: string) => void;
  selectedMonster: MonsterDetails | null;
  isLoadingDetails: boolean;
  apiError: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredMonsters: MonsterListItem[];
}

function MonsterBrowserDialog({
  isOpen,
  onOpenChange,
  allMonsters,
  onMonsterSelect,
  selectedMonster,
  isLoadingDetails,
  apiError,
  searchTerm,
  setSearchTerm,
  filteredMonsters
}: MonsterBrowserDialogProps) {

  const getMonsterImageSrc = (monsterIndex: string) => {
    return `${DND_API_BASE_URL}/api/images/monsters/${monsterIndex}.png`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-2xl flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            Monster Compendium
          </DialogTitle>
          <DialogDescription>
            Browse, search, and view details for D&D 5e monsters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden">
          {/* Left Pane: Search, Filters, List */}
          <div className="md:col-span-1 flex flex-col border-r p-4 overflow-hidden">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search monsters..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* CR Slider Placeholder */}
            <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                <p className="text-xs text-center text-muted-foreground">
                    Challenge Rating (CR) filtering is planned for a future update.
                    The current API doesn't support efficient CR-based filtering for the entire monster list.
                </p>
                {/* <Label htmlFor="cr-slider" className="text-sm font-medium">Challenge Rating</Label>
                <Slider
                    id="cr-slider"
                    defaultValue={[0, 30]} // Example range
                    min={0}
                    max={30}
                    step={1}
                    className="my-2"
                    disabled // Disabled for now
                />
                <p className="text-xs text-muted-foreground text-center">CR: 0 - 30</p> */}
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4">
              {filteredMonsters.length === 0 && searchTerm ? (
                <p className="text-center text-sm text-muted-foreground py-4">No monsters found for "{searchTerm}".</p>
              ) : filteredMonsters.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">No monsters to display.</p>
              ) : (
                <ul className="space-y-1.5">
                  {filteredMonsters.map(monster => (
                    <li key={monster.index}>
                      <Button
                        variant={selectedMonster?.index === monster.index ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto py-2 px-3 text-left hover:bg-accent text-sm"
                        onClick={() => onMonsterSelect(monster.url)}
                      >
                        {monster.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Right Pane: Monster Details */}
          <div className="md:col-span-2 p-4 overflow-y-auto">
            {isLoadingDetails && !selectedMonster ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading monster details...</p>
              </div>
            ) : selectedMonster ? (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-primary">{selectedMonster.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedMonster.size} {selectedMonster.type} ({selectedMonster.alignment})
                </p>
                
                {selectedMonster.image && (
                  <div className="w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden relative border shadow-md">
                     <Image
                        src={getMonsterImageSrc(selectedMonster.index)}
                        alt={selectedMonster.name}
                        layout="fill"
                        objectFit="contain"
                        data-ai-hint={`${selectedMonster.type} monster`}
                      />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm p-3 border rounded-lg bg-background shadow-sm">
                  <div><Badge variant="outline" className="text-xs">CR</Badge> {selectedMonster.challenge_rating} (XP: { (selectedMonster as any).xp || 'N/A' })</div>
                  <div className="flex items-center"><Heart className="mr-1.5 h-4 w-4 text-red-500" /> HP: {selectedMonster.hit_points} ({selectedMonster.hit_dice})</div>
                  {selectedMonster.armor_class && selectedMonster.armor_class.length > 0 && (
                    <div className="flex items-center col-span-2"><Shield className="mr-1.5 h-4 w-4 text-sky-600" /> AC: {selectedMonster.armor_class[0]?.value || 'N/A'} {selectedMonster.armor_class[0]?.type && `(${selectedMonster.armor_class[0]?.type})`}</div>
                  )}
                </div>
                
                {selectedMonster.desc && (
                  <div>
                    <h4 className="font-semibold mb-1 text-md">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedMonster.desc}</p>
                  </div>
                )}
                {/* Add more details here: Speed, Stats, Actions, etc. */}
                <p className="text-xs text-muted-foreground">Further details like abilities, actions, and lore will be available in future updates.</p>
              </div>
            ) : apiError && !isLoadingDetails ? (
                <p className="text-center text-destructive py-10">{apiError}</p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">Select a monster</p>
                  <p className="text-sm text-muted-foreground/80">Details will appear here once you choose a monster from the list.</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="p-4 border-t mt-auto">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function EncountersPage() {
  const [allMonsters, setAllMonsters] = useState<MonsterListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetails | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMonsterBrowserOpen, setIsMonsterBrowserOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchMonsterList() {
      setIsLoadingList(true);
      setApiError(null);
      try {
        const response = await fetch(`${DND_API_BASE_URL}/api/monsters`);
        if (!response.ok) {
          throw new Error(`Failed to fetch monster list: ${response.statusText}`);
        }
        const data: MonsterListResponse = await response.json();
        setAllMonsters(data.results);
      } catch (error) {
        console.error("Error fetching monster list:", error);
        setApiError((error as Error).message || "Could not load monster list.");
        toast({
          title: "Error",
          description: "Could not load monster list. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingList(false);
      }
    }
    if (isMonsterBrowserOpen && allMonsters.length === 0) { // Fetch only when dialog opens and list is empty
        fetchMonsterList();
    }
  }, [isMonsterBrowserOpen, toast, allMonsters.length]);


  const filteredMonsters = useMemo(() => {
    if (!searchTerm) return allMonsters;
    const lowercasedFilter = searchTerm.toLowerCase();
    return allMonsters.filter(item =>
      item.name.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, allMonsters]);


  const handleMonsterSelect = async (monsterUrl: string) => {
    if (selectedMonster?.url === monsterUrl && !isLoadingDetails) return; // Avoid re-fetching if already selected & not loading

    setIsLoadingDetails(true);
    setSelectedMonster(null); 
    setApiError(null);
    try {
      const response = await fetch(`${DND_API_BASE_URL}${monsterUrl}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch monster details: ${response.statusText}`);
      }
      const data: MonsterDetails = await response.json();
      setSelectedMonster(data);
    } catch (error) {
      console.error("Error fetching monster details:", error);
      setApiError((error as Error).message || "Could not load monster details.");
       toast({
        title: "Error Loading Details",
        description: (error as Error).message || "Failed to load monster details.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Encounter Creator"
        description="Browse monsters and design challenging encounters for your party."
        actions={
            <Button onClick={() => setIsMonsterBrowserOpen(true)} disabled={isLoadingList}>
                <BookOpen className="mr-2 h-4 w-4" />
                {isLoadingList ? "Loading Monsters..." : "Browse Monster Compendium"}
            </Button>
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Build Your Encounter</CardTitle>
          <CardDescription>Add monsters, set quantities, and balance the challenge.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Encounter building tools are coming soon! This section will allow you to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
            <li>Add selected monsters from the Compendium to an encounter list.</li>
            <li>Filter by Challenge Rating (once API limitations are addressed).</li>
            <li>Automatically generate encounters based on party level and desired difficulty.</li>
            <li>Save and load your custom encounters.</li>
            <li>Export encounters to the Combat Tracker.</li>
          </ul>
        </CardContent>
      </Card>

      <MonsterBrowserDialog
        isOpen={isMonsterBrowserOpen}
        onOpenChange={setIsMonsterBrowserOpen}
        allMonsters={allMonsters} // Pass the full list, dialog will handle its internal filtering
        onMonsterSelect={handleMonsterSelect}
        selectedMonster={selectedMonster}
        isLoadingDetails={isLoadingDetails}
        apiError={apiError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredMonsters={filteredMonsters} // Pass the already name-filtered list for display
      />
    </>
  );
}


    