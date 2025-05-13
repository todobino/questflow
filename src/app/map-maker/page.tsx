'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MapForm } from '@/components/map-maker/map-form';
import { MapDisplay } from '@/components/map-maker/map-display';
import type { OverworldMapData } from '@/lib/types';
import type { GenerateOverworldMapInput } from '@/ai/flows/generate-overworld-map';
import { generateOverworldMap } from '@/ai/flows/generate-overworld-map';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function MapMakerPage() {
  const [mapData, setMapData] = useState<OverworldMapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateMap = async (input: GenerateOverworldMapInput) => {
    setIsLoading(true);
    setMapData(null);
    try {
      const result = await generateOverworldMap(input);
      setMapData(result);
      toast({
        title: 'Map Generated!',
        description: 'Your overworld map has been successfully created.',
      });
    } catch (error) {
      console.error('Error generating map:', error);
      toast({
        title: 'Map Generation Failed',
        description: 'Could not generate the map. Please check your inputs or try again later.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <PageHeader
        title="Overworld Map Maker"
        description="Generate a unique overworld map for your campaign using AI. Provide coordinates, radius, and optional details to bring your world to life."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MapForm onGenerate={handleGenerateMap} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="flex h-[500px] items-center justify-center shadow-lg">
              <CardContent className="text-center">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold">Generating Map...</p>
                <p className="text-muted-foreground">This might take a moment. Please wait.</p>
              </CardContent>
            </Card>
          ) : mapData ? (
            <MapDisplay mapData={mapData} />
          ) : (
            <Card className="flex h-[500px] items-center justify-center shadow-lg">
              <CardContent className="text-center">
                <CardTitle className="text-2xl">Your Map Awaits</CardTitle>
                <CardDescription className="mt-2">
                  Fill in the details on the left and click "Generate Map" to see your world.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
