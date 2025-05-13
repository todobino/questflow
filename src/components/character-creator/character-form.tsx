'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Character } from '@/lib/types';
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
import { Save } from 'lucide-react';

const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  race: z.string().optional(),
  class: z.string().optional(),
  backstory: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type CharacterFormData = z.infer<typeof characterSchema>;

interface CharacterFormProps {
  currentCharacter?: Partial<Character>;
  onSave: (character: Character) => void;
}

export function CharacterForm({ currentCharacter, onSave }: CharacterFormProps) {
  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: '',
      race: '',
      class: '',
      backstory: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (currentCharacter) {
      form.reset({
        name: currentCharacter.name || '',
        race: currentCharacter.race || '',
        class: currentCharacter.class || '',
        backstory: currentCharacter.backstory || '',
        imageUrl: currentCharacter.imageUrl || '',
      });
    }
  }, [currentCharacter, form]);

  const onSubmit = (data: CharacterFormData) => {
    onSave({
      id: currentCharacter?.id || String(Date.now()), // Simple ID generation for new
      ...data,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Character Details</CardTitle>
        <CardDescription>Define your character's core attributes and story.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Elara Meadowlight" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Elf, Dwarf, Human" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wizard, Rogue, Paladin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="backstory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backstory</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your character's history, motivations, and significant life events."
                      className="resize-y min-h-[120px]"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto">
              <Save className="mr-2 h-4 w-4" /> Save Character
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
