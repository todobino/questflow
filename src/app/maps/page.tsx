
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { MapForm } from '@/components/map-maker/map-form';
import { MapDisplay } from '@/components/map-maker/map-display';
import type { OverworldMapData } from '@/lib/types'; 
import type { GenerateBattleMapInput } from '@/ai/flows/generate-battle-map';
import { generateBattleMap } from '@/ai/flows/generate-battle-map';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Layers } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCampaignContext } from '@/contexts/campaign-context';
import { Breadcrumbs } from '@/components/shared/breadcrumbs'; // Import Breadcrumbs

export default function MapsPage() {
  const { activeCampaign } = useCampaignContext();
  const [mapData, setMapData] = useState<OverworldMapData | null>(null);
  const [savedMaps, setSavedMaps] = useState<OverworldMapData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateMap = async (input: GenerateBattleMapInput) => {
    setIsLoading(true);
    setMapData(null);
    try {
      const result = await generateBattleMap(input);
      setMapData(result);
    } catch (error) {
      console.error('Error generating map:', error);
      toast({
        title: 'Map Generation Failed',
        description: (error as Error).message || 'Could not generate the map. Please try again.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleSaveMap = () => {
    if (mapData) {
      if (savedMaps.some(savedMap => savedMap.mapImage === mapData.mapImage)) {
        return;
      }
      setSavedMaps(prev => [mapData, ...prev]); 
    }
  };

  return (
    <>
      {activeCampaign && <Breadcrumbs activeCampaign={activeCampaign} />}
      <PageHeader
        title="D&amp;D Battle Map Generator"
        description="Create unique, grid-based battle maps for your Dungeons & Dragons sessions using AI. Select a terrain and describe your scene."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MapForm onGenerate={handleGenerateMap} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <Card className="flex h-[500px] items-center justify-center shadow-lg">
              <CardContent className="text-center">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold">Generating Map...</p>
                <p className="text-muted-foreground">The AI is crafting your battle map. Please wait.</p>
              </CardContent>
            </Card>
          ) : mapData ? (
            <>
              <MapDisplay mapData={mapData} />
              <Button onClick={handleSaveMap} className="w-full mt-4">
                <Save className="mr-2 h-4 w-4" /> Save to My Maps
              </Button>
            </>
          ) : (
            <Card className="flex h-[500px] items-center justify-center shadow-lg">
              <CardContent className="text-center">
                <CardTitle className="text-2xl">Your Map Awaits</CardTitle>
                <CardDescription className="mt-2">
                  Fill in the terrain and description on the left and click "Generate Battle Map".
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {savedMaps.length > 0 && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Layers className="mr-2 h-5 w-5 text-primary" /> My Saved Maps</CardTitle>
            <CardDescription>Your collection of generated battle maps.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full pr-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {savedMaps.map((sMap, index) => (
                  <Card key={index} className="overflow-hidden">
                     <div className="aspect-video bg-muted flex items-center justify-center">
                        <Image
                        src={sMap.mapImage}
                        alt={`Saved Map ${index + 1}`}
                        width={300}
                        height={169} 
                        className="object-cover w-full h-full"
                        data-ai-hint="battlemap rpg"
                        />
                    </div>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm truncate">{sMap.description.split('.')[0] || `Map ${index + 1}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                      <p className="line-clamp-2">{sMap.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  );
}
