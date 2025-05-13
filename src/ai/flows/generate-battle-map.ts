
'use server';
/**
 * @fileOverview Generates D&D battle maps using AI.
 *
 * - generateBattleMap - A function that handles the battle map generation process.
 * - GenerateBattleMapInput - The input type for the generateBattleMap function.
 * - GenerateBattleMapOutput - The return type for the generateBattleMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBattleMapInputSchema = z.object({
  terrainType: z.string().describe('The selected type of terrain for the battle map (e.g., Cave, Forest).'),
  boardDescription: z.string().describe('A detailed description of the battle map features.'),
});
export type GenerateBattleMapInput = z.infer<typeof GenerateBattleMapInputSchema>;

const GenerateBattleMapOutputSchema = z.object({
  mapImage: z
    .string()
    .describe("A data URI containing the generated battle map image. Expected format: 'data:image/png;base64,<encoded_data>'."),
  description: z.string().describe('A description of the generated map, combining terrain and user input.'),
});
export type GenerateBattleMapOutput = z.infer<typeof GenerateBattleMapOutputSchema>;

export async function generateBattleMap(input: GenerateBattleMapInput): Promise<GenerateBattleMapOutput> {
  return generateBattleMapFlow(input);
}

const generateBattleMapFlow = ai.defineFlow(
  {
    name: 'generateBattleMapFlow',
    inputSchema: GenerateBattleMapInputSchema,
    outputSchema: GenerateBattleMapOutputSchema,
  },
  async (input: GenerateBattleMapInput) => {
    const imagePrompt = `Generate a top-down Dungeons & Dragons battle map, approximately 100ft by 100ft in size. The generated image must be square (1:1 aspect ratio). The style should be a hand-drawn or digital D&D map. The setting is a classic fantasy ${input.terrainType}. The map should include these features: ${input.boardDescription}. Do not include any gridlines or squares on the map.`;

    const { media, text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePrompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], // Requesting both image and text
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media.');
    }
    
    const finalDescription = text 
      ? `AI Description for ${input.terrainType} map: ${text}` 
      : `Generated D&D style map for ${input.terrainType}. Details: ${input.boardDescription}`;

    return {
      mapImage: media.url,
      description: finalDescription,
    };
  }
);

