
'use server';
/**
 * @fileOverview Generates a random D&D 5e character concept including name, attributes, backstory, and image.
 *
 * - generateRandomCharacter - A function that handles the character randomization process.
 * - GenerateRandomCharacterOutput - The return type for the generateRandomCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RACES, CLASSES, SUBCLASSES, BACKGROUNDS, type DndClass } from '@/lib/dnd-data';

// Constructing a string for the prompt to list available options.
const raceOptions = RACES.join(', ');
const classOptions = CLASSES.join(', ');
const backgroundOptions = BACKGROUNDS.join(', ');

// Helper to get subclass options string for the prompt
const getClassSubclassPromptInfo = () => {
  let info = "";
  for (const className of CLASSES) {
    const subclasses = SUBCLASSES[className as DndClass];
    if (subclasses && subclasses.length > 0) {
      info += `\nIf Class is ${className}, Subclass can be one of: ${subclasses.join(', ')}.`;
    }
  }
  return info;
};
const subclassPromptInfo = getClassSubclassPromptInfo();


const GenerateRandomCharacterOutputSchema = z.object({
  name: z.string().describe('The generated name for the character, fitting their race, class, and background.'),
  race: z.string().describe('The selected D&D 5e race for the character.'),
  characterClass: z.string().describe('The selected D&D 5e class for the character.'),
  subclass: z.string().describe('The selected D&D 5e subclass, appropriate for the chosen class.'),
  background: z.string().describe('The selected D&D 5e background for the character.'),
  backstory: z.string().describe('A 2-3 sentence compelling backstory for the character.'),
  imageUrl: z.string().describe("A square character portrait as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateRandomCharacterOutput = z.infer<typeof GenerateRandomCharacterOutputSchema>;

// Input schema is empty as this flow generates all data.
const GenerateRandomCharacterInputSchema = z.object({});
export type GenerateRandomCharacterInput = z.infer<typeof GenerateRandomCharacterInputSchema>;


export async function generateRandomCharacter(_input?: GenerateRandomCharacterInput): Promise<GenerateRandomCharacterOutput> {
  return generateRandomCharacterFlow({});
}

const characterDetailsPrompt = ai.definePrompt({
  name: 'generateRandomCharacterDetailsPrompt',
  input: { schema: z.object({}) }, // No specific input needed for this part
  output: { schema: z.object({
    name: z.string().describe('A fitting and unique name for the character based on the generated attributes.'),
    race: z.string().describe(`Chosen from: ${raceOptions}`),
    characterClass: z.string().describe(`Chosen from: ${classOptions}`),
    subclass: z.string().describe('Chosen based on the selected class and available D&D 5e subclasses.'),
    background: z.string().describe(`Chosen from: ${backgroundOptions}`),
    backstory: z.string().describe('A 2-3 sentence compelling backstory for the character.'),
  })},
  prompt: `You are an expert D&D character concept generator. Generate a random character concept.

First, select one option for each of the following attributes:
Available Races: ${raceOptions}.
Available Classes: ${classOptions}.
Available Backgrounds: ${backgroundOptions}.

Subclass guidance (pick one appropriate for the chosen Class): ${subclassPromptInfo}

Second, generate a fitting and unique name for this character based on the selections above.

Third, generate a compelling and concise backstory (2-3 sentences) for this character based on the selections.

Return the output as a JSON object with keys: 'name', 'race', 'characterClass', 'subclass', 'background', 'backstory'.
Ensure the subclass is valid for the chosen class.
`,
});


const generateRandomCharacterFlow = ai.defineFlow(
  {
    name: 'generateRandomCharacterFlow',
    inputSchema: GenerateRandomCharacterInputSchema,
    outputSchema: GenerateRandomCharacterOutputSchema,
  },
  async (_input) => {
    // Step 1: Generate character details (name, race, class, subclass, background, backstory)
    const { output: characterDetails } = await characterDetailsPrompt({});
    if (!characterDetails) {
      throw new Error('Failed to generate character details.');
    }

    // Step 2: Generate character image based on details
    const imagePromptText = `Generate a square (1:1 aspect ratio) Dungeons & Dragons character portrait. The character is a ${characterDetails.race} ${characterDetails.subclass} ${characterDetails.characterClass} named ${characterDetails.name}. Style: fantasy art, detailed portrait. Backstory hint: ${characterDetails.backstory.substring(0,100)}`;
    
    let imageUrl = `https://placehold.co/400x400.png`; // Default placeholder
    let imageDescription = `Placeholder for ${characterDetails.race} ${characterDetails.characterClass}`;

    try {
        const { media, text } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: imagePromptText,
        config: {
            responseModalities: ['IMAGE', 'TEXT'],
        },
        });

        if (media && media.url) {
            imageUrl = media.url;
            imageDescription = text || `Generated image for ${characterDetails.race} ${characterDetails.characterClass}`;
        } else {
             console.warn('Image generation returned no media, using placeholder.');
        }
    } catch (imgError) {
        console.error('Image generation failed, using placeholder:', imgError);
        // Keep the default placeholder if image generation fails
    }


    return {
      name: characterDetails.name,
      race: characterDetails.race,
      characterClass: characterDetails.characterClass,
      subclass: characterDetails.subclass,
      background: characterDetails.background,
      backstory: characterDetails.backstory,
      imageUrl: imageUrl,
    };
  }
);

