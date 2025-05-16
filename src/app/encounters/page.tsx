
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { MonsterListItem, MonsterListResponse, MonsterDetails } from '@/lib/types';
import { Loader2, Search, Shield, Heart, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const DND_API_BASE_URL = 'https://www.dnd5eapi.co';

export default function EncountersPage() {
  const [allMonsters, setAllMonsters] = useState<MonsterListItem[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<MonsterListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetails | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
        setFilteredMonsters(data.results);
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
    fetchMonsterList();
  }, [toast]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = allMonsters.filter(item =>
      item.name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredMonsters(filteredData);
  }, [searchTerm, allMonsters]);

  const handleMonsterClick = async (monsterUrl: string) => {
    setIsLoadingDetails(true);
    setSelectedMonster(null); // Clear previous monster while loading new one
    setIsDetailDialogOpen(true); // Open dialog to show loader
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
      setIsDetailDialogOpen(false); // Close dialog on error if it was just opened for loader
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getMonsterImageSrc = (monsterIndex: string) => {
    // The API provides image paths like /api/images/monsters/aboleth.png
    // We need to prepend the base URL.
    return `${DND_API_BASE_URL}/api/images/monsters/${monsterIndex}.png`;
  };

  return (
    <>
      <PageHeader
        title="Encounter Creator"
        description="Browse monsters and design challenging encounters for your party."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Monster Browser Section */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Monster Browser</CardTitle>
            <CardDescription>Search for D&D 5e monsters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search monsters by name..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isLoadingList ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : apiError && filteredMonsters.length === 0 ? (
              <p className="text-center text-destructive">{apiError}</p>
            ) : filteredMonsters.length === 0 && !apiError ? (
              <p className="text-center text-muted-foreground">No monsters found for "{searchTerm}".</p>
            ) : (
              <ScrollArea className="h-[400px] pr-3">
                <ul className="space-y-2">
                  {filteredMonsters.map(monster => (
                    <li key={monster.index}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto py-2 px-3 text-left hover:bg-accent"
                        onClick={() => handleMonsterClick(monster.url)}
                      >
                        {monster.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Encounter Building Section (Placeholder) */}
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Build Your Encounter</CardTitle>
            <CardDescription>Add monsters, set quantities, and balance the challenge.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Encounter building tools are coming soon! This section will allow you to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
              <li>Add selected monsters to an encounter list.</li>
              <li>Filter by Challenge Rating.</li>
              <li>Automatically generate encounters based on party level and desired difficulty.</li>
              <li>Save and load your custom encounters.</li>
              <li>Export encounters to the Combat Tracker.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Monster Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedMonster?.name || 'Loading Monster...'}</DialogTitle>
            {selectedMonster && (
              <DialogDescription>
                {selectedMonster.size} {selectedMonster.type} ({selectedMonster.alignment})
              </DialogDescription>
            )}
          </DialogHeader>
          <ScrollArea className="flex-grow pr-2 -mr-2">
            {isLoadingDetails && !selectedMonster ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : selectedMonster ? (
              <div className="space-y-4 py-4">
                {selectedMonster.image && (
                  <div className="w-full aspect-video bg-muted rounded overflow-hidden relative border">
                     <Image
                        src={getMonsterImageSrc(selectedMonster.index)}
                        alt={selectedMonster.name}
                        layout="fill"
                        objectFit="contain"
                        data-ai-hint={`${selectedMonster.type} monster`}
                      />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><Badge variant="outline">CR</Badge> {selectedMonster.challenge_rating}</div>
                  <div className="flex items-center"><Heart className="mr-1.5 h-4 w-4 text-red-500" /> HP: {selectedMonster.hit_points} ({selectedMonster.hit_dice})</div>
                  <div className="flex items-center"><Shield className="mr-1.5 h-4 w-4 text-sky-600" /> AC: {selectedMonster.armor_class[0]?.value || 'N/A'}</div>
                </div>
                {selectedMonster.desc && (
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMonster.desc}</p>
                  </div>
                )}
                {/* Add more details here: Speed, Stats, Actions, etc. */}
                <p className="text-xs text-muted-foreground">Further details like abilities, actions, and lore will be available soon.</p>
              </div>
            ) : apiError ? (
                <p className="text-center text-destructive py-10">{apiError}</p>
            ) : (
              <p className="text-center text-muted-foreground py-10">No monster details to display.</p>
            )}
          </ScrollArea>
          <DialogFooter className="mt-auto pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
