
'use server';
/**
 * @fileOverview Generates character portraits using AI.
 *
 * - generateCharacterImage - A function that handles the character image generation process.
 * - GenerateCharacterImageInput - The input type for the generateCharacterImage function.
 * - GenerateCharacterImageOutput - The return type for the generateCharacterImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterImageInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  race: z.string().optional().describe('The race of the character (e.g., Elf, Dwarf).'),
  characterClass: z.string().optional().describe('The class of the character (e.g., Wizard, Fighter).'),
  subclass: z.string().optional().describe('The subclass of the character (e.g., Evocation, Battle Master).'),
  background: z.string().optional().describe('The background of the character (e.g., Sage, Soldier).'),
  backstory: z.string().optional().describe('A brief backstory or key traits of the character.'),
});
export type GenerateCharacterImageInput = z.infer<typeof GenerateCharacterImageInputSchema>;

const GenerateCharacterImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe("A data URI containing the generated character portrait. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateCharacterImageOutput = z.infer<typeof GenerateCharacterImageOutputSchema>;

export async function generateCharacterImage(input: GenerateCharacterImageInput): Promise<GenerateCharacterImageOutput> {
  return generateCharacterImageFlow(input);
}

const generateCharacterImageFlow = ai.defineFlow(
  {
    name: 'generateCharacterImageFlow',
    inputSchema: GenerateCharacterImageInputSchema,
    outputSchema: GenerateCharacterImageOutputSchema,
  },
  async (input: GenerateCharacterImageInput) => {
    let promptText = `Generate a square Dungeons & Dragons character portrait in a consistent, high-fidelity fantasy style. The image should be painterly and detailed, resembling official D&D or Magic: The Gathering artwork. Show the character from the shoulders up, facing forward or slightly turned. Use a moody or blurred fantasy background to maintain focus on the character. Maintain stylistic consistency across different races, classes, and backgrounds.

Character Details:
Name: ${input.name}`;
    if (input.race) promptText += `\nRace: ${input.race}`;
    if (input.characterClass) promptText += `\nClass: ${input.characterClass}`;
    if (input.subclass) promptText += `\nSubclass: ${input.subclass}`;
    if (input.background) promptText += `\nBackground: ${input.background}`;
    if (input.backstory) promptText += `\nBackstory/Traits: ${input.backstory.substring(0, 200)}...`; // Limit backstory length for prompt

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: promptText,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], // Requesting IMAGE modality
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
