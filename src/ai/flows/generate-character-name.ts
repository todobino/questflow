// This is an auto-generated file from Firebase Studio.
'use server';

/**
 * @fileOverview Generates character names using AI.
 *
 * - generateCharacterName - A function that generates character names.
 * - GenerateCharacterNameInput - The input type for the generateCharacterName function.
 * - GenerateCharacterNameOutput - The return type for the generateCharacterName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterNameInputSchema = z.object({
  race: z.string().describe('The race of the character.'),
  gender: z.string().describe('The gender of the character.'),
  setting: z.string().describe('The setting of the character.'),
});
export type GenerateCharacterNameInput = z.infer<typeof GenerateCharacterNameInputSchema>;

const GenerateCharacterNameOutputSchema = z.object({
  name: z.string().describe('The generated name of the character.'),
});
export type GenerateCharacterNameOutput = z.infer<typeof GenerateCharacterNameOutputSchema>;

export async function generateCharacterName(input: GenerateCharacterNameInput): Promise<GenerateCharacterNameOutput> {
  return generateCharacterNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterNamePrompt',
  input: {schema: GenerateCharacterNameInputSchema},
  output: {schema: GenerateCharacterNameOutputSchema},
  prompt: `You are a fantasy name generator.  Generate a name for a character with the following attributes:

Race: {{{race}}}
Gender: {{{gender}}}
Setting: {{{setting}}}

Name: `,
});

const generateCharacterNameFlow = ai.defineFlow(
  {
    name: 'generateCharacterNameFlow',
    inputSchema: GenerateCharacterNameInputSchema,
    outputSchema: GenerateCharacterNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
