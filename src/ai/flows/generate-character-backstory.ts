'use server';

/**
 * @fileOverview Generates character backstories using AI.
 *
 * - generateCharacterBackstory - A function that handles the character backstory generation process.
 * - GenerateCharacterBackstoryInput - The input type for the generateCharacterBackstory function.
 * - GenerateCharacterBackstoryOutput - The return type for the generateCharacterBackstory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterBackstoryInputSchema = z.object({
  characterName: z.string().describe('The name of the character.'),
  characterRace: z.string().describe('The race of the character.'),
  characterClass: z.string().describe('The class of the character.'),
  setting: z.string().describe('The setting for the character backstory.'),
});

export type GenerateCharacterBackstoryInput = z.infer<typeof GenerateCharacterBackstoryInputSchema>;

const GenerateCharacterBackstoryOutputSchema = z.object({
  backstory: z.string().describe('The generated backstory for the character.'),
});

export type GenerateCharacterBackstoryOutput = z.infer<typeof GenerateCharacterBackstoryOutputSchema>;

export async function generateCharacterBackstory(
  input: GenerateCharacterBackstoryInput
): Promise<GenerateCharacterBackstoryOutput> {
  return generateCharacterBackstoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterBackstoryPrompt',
  input: {schema: GenerateCharacterBackstoryInputSchema},
  output: {schema: GenerateCharacterBackstoryOutputSchema},
  prompt: `You are an expert storyteller, specializing in creating character backstories for tabletop role-playing games.

  Generate a compelling and detailed backstory for a character with the following characteristics:

  Character Name: {{{characterName}}}
  Race: {{{characterRace}}}
  Class: {{{characterClass}}}
  Setting: {{{setting}}}
  `,
});

const generateCharacterBackstoryFlow = ai.defineFlow(
  {
    name: 'generateCharacterBackstoryFlow',
    inputSchema: GenerateCharacterBackstoryInputSchema,
    outputSchema: GenerateCharacterBackstoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
