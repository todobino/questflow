
'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Character } from '@/lib/types';
import { RACES, CLASSES, SUBCLASSES, BACKGROUNDS, type DndClass } from '@/lib/dnd-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Save, Shuffle, Loader2 } from 'lucide-react';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogContent } from '../ui/dialog'; // Assuming dialog parts are needed

const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  race: z.string().optional(),
  class: z.string().optional(),
  subclass: z.string().optional(),
  background: z.string().optional(),
  level: z.coerce.number().min(1).max(20).optional().default(1),
  backstory: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type CharacterFormData = z.infer<typeof characterSchema>;

interface CharacterFormProps {
  currentCharacter?: Partial<Character>; // Used for editing
  onSave: (character: CharacterFormData) => void; // Adjusted for form data
  onClose: () => void; // For closing the dialog
  onRandomize: () => Promise<void>;
  isRandomizing: boolean;
  isDialog?: boolean; // To conditionally render dialog parts
}

export function CharacterForm({ 
  currentCharacter, 
  onSave, 
  onClose, 
  onRandomize, 
  isRandomizing,
  isDialog = false // Default to false if not in a dialog
}: CharacterFormProps) {
  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: '',
      race: '',
      class: '',
      subclass: '',
      background: '',
      level: 1,
      backstory: '',
      imageUrl: '',
      ...currentCharacter, // Spread current character for editing
    },
  });

  const [availableSubclasses, setAvailableSubclasses] = useState<readonly string[]>([]);
  const selectedClass = form.watch('class') as DndClass | undefined;

  useEffect(() => {
    if (selectedClass && SUBCLASSES[selectedClass]) {
      setAvailableSubclasses(SUBCLASSES[selectedClass]);
    } else {
      setAvailableSubclasses([]);
    }
  }, [selectedClass, form]);

  useEffect(() => {
    if (currentCharacter) {
      form.reset({
        name: currentCharacter.name || '',
        race: currentCharacter.race || '',
        class: currentCharacter.class || '',
        subclass: currentCharacter.subclass || '',
        background: currentCharacter.background || '',
        level: currentCharacter.level || 1,
        backstory: currentCharacter.backstory || '',
        imageUrl: currentCharacter.imageUrl || '',
      });
       if (currentCharacter.class && SUBCLASSES[currentCharacter.class as DndClass]) {
        setAvailableSubclasses(SUBCLASSES[currentCharacter.class as DndClass]);
      }
    } else {
      // Reset to default if no currentCharacter (e.g., for new character)
       form.reset({
        name: '', race: '', class: '', subclass: '', background: '', level: 1, backstory: '', imageUrl: ''
      });
    }
  }, [currentCharacter, form, isDialog]); // Added isDialog to deps to ensure reset on open

  const onSubmit = (data: CharacterFormData) => {
    onSave(data); // Parent component (dialog) will handle context update
  };
  
  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 py-4 max-h-[calc(80vh-12rem)] overflow-y-auto pr-2"> {/* Added max-height and overflow for scrollability */}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="race"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Race</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a race" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RACES.map(race => <SelectItem key={race} value={race}>{race}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                   <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('subclass', ''); 
                    }} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLASSES.map(dndClass => <SelectItem key={dndClass} value={dndClass}>{dndClass}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
             <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a background" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BACKGROUNDS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subclass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subclass</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedClass || availableSubclasses.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedClass ? "Select a subclass" : "Select class first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSubclasses.map(subclass => <SelectItem key={subclass} value={subclass}>{subclass}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backstory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backstory</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your character's history, motivations, and significant life events."
                    className="resize-y min-h-[100px]"
                    rows={4}
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
                  <Input placeholder="https://placehold.co/400x400.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {isDialog && (
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> {currentCharacter?.id ? 'Save Changes' : 'Create Character'}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );

  if (isDialog) {
    return (
      <DialogContent className="sm:max-w-2xl"> {/* Increased width for better form layout */}
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {currentCharacter?.id ? 'Edit Character' : 'Create New Character'}
            <Button onClick={onRandomize} disabled={isRandomizing} variant="default" size="sm">
              {isRandomizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
              {isRandomizing ? 'Randomizing...' : 'Randomize'}
            </Button>
          </DialogTitle>
          <DialogDescription>
            {currentCharacter?.id ? "Update your character's details." : "Fill in the details for your new party member."}
          </DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    );
  }

  // Fallback for non-dialog usage (original structure, though now deprecated by moving to dialog)
  return (
     <div className="p-4 border rounded-lg shadow-lg">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{currentCharacter?.id ? 'Edit Character' : 'Create New Character'}</h3>
         <Button onClick={onRandomize} disabled={isRandomizing} variant="default" size="sm">
            {isRandomizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
            {isRandomizing ? 'Randomizing...' : 'Randomize'}
          </Button>
       </div>
       {FormContent}
        <div className="mt-6 flex justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button form={form.formState.id} type="submit"> {/* Ensure button triggers form submission */}
              <Save className="mr-2 h-4 w-4" /> {currentCharacter?.id ? 'Save Changes' : 'Create Character'}
            </Button>
          </div>
     </div>
  );
}
