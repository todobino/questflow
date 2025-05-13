
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { GenerateBattleMapInput } from '@/ai/flows/generate-battle-map'; // Updated import
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Terrain, DraftingCompass, ScanText } from 'lucide-react'; // Using Terrain for type, DraftingCompass for general map making, ScanText for description

const terrainTypes = ["Cave", "Castle", "Forest", "River", "Ocean", "Dungeon", "Tavern", "Plains"] as const;

const mapFormSchema = z.object({
  terrainType: z.enum(terrainTypes, { required_error: "Terrain type is required" }),
  boardDescription: z.string().min(5, 'Description must be at least 5 characters').max(500, 'Description is too long'),
});

type MapFormData = z.infer<typeof mapFormSchema>;

interface MapFormProps {
  onGenerate: (data: GenerateBattleMapInput) => void; // Updated type
  isLoading: boolean;
}

export function MapForm({ onGenerate, isLoading }: MapFormProps) {
  const form = useForm<MapFormData>({
    resolver: zodResolver(mapFormSchema),
    defaultValues: {
      terrainType: 'Forest',
      boardDescription: 'A clearing in an ancient forest with a small ruin in the center.',
    },
  });

  const onSubmit = (data: MapFormData) => {
    onGenerate(data);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><DraftingCompass className="mr-2 h-5 w-5 text-primary" />Battle Map Parameters</CardTitle>
        <CardDescription>Define the environment and details for your D&amp;D battle map.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="terrainType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Terrain className="mr-2 h-4 w-4 text-muted-foreground" /> Terrain Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a terrain type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {terrainTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="boardDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><ScanText className="mr-2 h-4 w-4 text-muted-foreground" /> Board Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A narrow cave passage opening into a larger cavern with a small underground stream."
                      className="resize-y min-h-[120px]"
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
              {isLoading ? 'Generating...' : 'Generate Battle Map'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
