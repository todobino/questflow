'use client';

import Image from 'next/image';
import type { OverworldMapData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MapDisplayProps {
  mapData: OverworldMapData;
}

export function MapDisplay({ mapData }: MapDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Generated Overworld Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          {mapData.mapImage ? (
            <Image
              src={mapData.mapImage}
              alt="Generated Overworld Map"
              width={800}
              height={450}
              className="h-full w-full object-contain"
              data-ai-hint="fantasy map"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Map image will appear here.
            </div>
          )}
        </div>
        <CardDescription>Map Details:</CardDescription>
        <ScrollArea className="mt-2 h-[100px] rounded-md border p-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">{mapData.description || 'No description provided.'}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
