// Use server directive.
'use server';

/**
 * @fileOverview Generates an overworld map based on input coordinates and parameters.
 *
 * - generateOverworldMap - A function that generates an overworld map.
 * - GenerateOverworldMapInput - The input type for the generateOverworldMap function.
 * - GenerateOverworldMapOutput - The return type for the generateOverworldMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOverworldMapInputSchema = z.object({
  coordinates: z
    .string()
    .describe('The coordinates around which to center the map (e.g., 34.0522,-118.2437).'),
  radius: z.number().describe('The radius of the map in kilometers.'),
  terrainDescription: z
    .string()
    .optional()
    .describe('A description of the terrain, influencing the map generation.'),
  settlementDetails: z.string().optional().describe('Details about the settlement in the map area.'),
});

export type GenerateOverworldMapInput = z.infer<typeof GenerateOverworldMapInputSchema>;

const GenerateOverworldMapOutputSchema = z.object({
  mapImage: z
    .string() // data URI
    .describe('A data URI containing the generated overworld map image.'),
  description: z.string().describe('A description of the generated map.'),
});

export type GenerateOverworldMapOutput = z.infer<typeof GenerateOverworldMapOutputSchema>;

export async function generateOverworldMap(input: GenerateOverworldMapInput): Promise<GenerateOverworldMapOutput> {
  return generateOverworldMapFlow(input);
}

const overworldMapPrompt = ai.definePrompt({
  name: 'overworldMapPrompt',
  input: {schema: GenerateOverworldMapInputSchema},
  output: {schema: GenerateOverworldMapOutputSchema},
  prompt: `You are an expert cartographer, skilled in creating fantasy overworld maps.

  Based on the provided coordinates, radius, terrain description, and settlement details, generate an overworld map image and a textual description.

  The map should be visually appealing and suitable for use in a fantasy tabletop role-playing game.

  Coordinates: {{{coordinates}}}
  Radius: {{{radius}}} km
  Terrain Description: {{{terrainDescription}}}
  Settlement Details: {{{settlementDetails}}}

  Map Image: {{media url=mapImage}}
  Description: {{{description}}}
  `, // Ensure Handlebars syntax is correctly used
});

const generateOverworldMapFlow = ai.defineFlow(
  {
    name: 'generateOverworldMapFlow',
    inputSchema: GenerateOverworldMapInputSchema,
    outputSchema: GenerateOverworldMapOutputSchema,
  },
  async input => {
    const mapGenPrompt = `Generate an overworld map image centered around the coordinates ${input.coordinates}, with a radius of ${input.radius} km.  ${input.terrainDescription ? `The terrain is ${input.terrainDescription}.` : ''} ${input.settlementDetails ? `Settlement details: ${input.settlementDetails}.` : ''}`

    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-exp',

      prompt: mapGenPrompt,

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    const {output} = await overworldMapPrompt({
      ...input,
      mapImage: media.url,
      description: 'Generated map based on the input parameters.',
    });

    return {
      mapImage: media.url,
      description: output.description,
    };
  }
);
