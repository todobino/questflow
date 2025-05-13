// src/ai/flows/generate-session-summary.ts
'use server';

/**
 * @fileOverview AI flow for generating session summaries.
 *
 * - generateSessionSummary - A function that generates a session summary.
 * - GenerateSessionSummaryInput - The input type for the generateSessionSummary function.
 * - GenerateSessionSummaryOutput - The return type for the generateSessionSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSessionSummaryInputSchema = z.object({
  sessionNotes: z.string().describe('Session notes to summarize.'),
});
export type GenerateSessionSummaryInput = z.infer<typeof GenerateSessionSummaryInputSchema>;

const GenerateSessionSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated session summary.'),
});
export type GenerateSessionSummaryOutput = z.infer<typeof GenerateSessionSummaryOutputSchema>;

export async function generateSessionSummary(input: GenerateSessionSummaryInput): Promise<GenerateSessionSummaryOutput> {
  return generateSessionSummaryFlow(input);
}

const generateSessionSummaryPrompt = ai.definePrompt({
  name: 'generateSessionSummaryPrompt',
  input: {schema: GenerateSessionSummaryInputSchema},
  output: {schema: GenerateSessionSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes session notes.

  Summarize the following session notes:
  {{sessionNotes}}`,
});

const generateSessionSummaryFlow = ai.defineFlow(
  {
    name: 'generateSessionSummaryFlow',
    inputSchema: GenerateSessionSummaryInputSchema,
    outputSchema: GenerateSessionSummaryOutputSchema,
  },
  async input => {
    const {output} = await generateSessionSummaryPrompt(input);
    return output!;
  }
);
