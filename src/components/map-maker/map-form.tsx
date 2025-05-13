'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { GenerateOverworldMapInput } from '@/ai/flows/generate-overworld-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MapPin, Radius, Milestone, Building } from 'lucide-react';

const mapFormSchema = z.object({
  coordinates: z.string().min(1, 'Coordinates are required (e.g., 34.0522,-118.2437)'),
  radius: z.coerce.number().min(1, 'Radius must be at least 1km').max(1000, 'Radius cannot exceed 1000km'),
  terrainDescription: z.string().optional(),
  settlementDetails: z.string().optional(),
});

type MapFormData = z.infer<typeof mapFormSchema>;

interface MapFormProps {
  onGenerate: (data: GenerateOverworldMapInput) => void;
  isLoading: boolean;
}

export function MapForm({ onGenerate, isLoading }: MapFormProps) {
  const form = useForm<MapFormData>({
    resolver: zodResolver(mapFormSchema),
    defaultValues: {
      coordinates: '34.0522,-118.2437', // Default to Los Angeles
      radius: 100,
      terrainDescription: '',
      settlementDetails: '',
    },
  });

  const onSubmit = (data: MapFormData) => {
    onGenerate(data);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Map Parameters</CardTitle>
        <CardDescription>Define the core elements of your map.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> Coordinates (Lat,Lng)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 40.7128,-74.0060" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Radius className="mr-2 h-4 w-4 text-muted-foreground" /> Radius (km)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terrainDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Milestone className="mr-2 h-4 w-4 text-muted-foreground" /> Terrain Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Lush forests, towering mountains, arid deserts"
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settlementDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /> Settlement Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A small fishing village named Oakhaven, known for its sturdy ships."
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Map'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
