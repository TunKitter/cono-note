'use server';
/**
 * @fileOverview An AI agent to suggest improvements to Javascript code.
 *
 * - suggestImprovements - A function that handles the code improvement suggestions.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  code: z.string().describe('The Javascript code to be improved.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  improvedCode: z.string().describe('The improved Javascript code.'),
  suggestions: z.array(z.string()).describe('An array of suggestions for the code.'),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {
    schema: z.object({
      code: z.string().describe('The Javascript code to be improved.'),
    }),
  },
  output: {
    schema: z.object({
      improvedCode: z.string().describe('The improved Javascript code.'),
      suggestions: z.array(z.string()).describe('An array of suggestions for the code.'),
    }),
  },
  prompt: `You are an AI code assistant that helps improve Javascript code.

You will receive Javascript code and you will provide an improved version of the code, as well as a list of suggestions for the code.

Code:
{{{code}}}`,
});

const suggestImprovementsFlow = ai.defineFlow<
  typeof SuggestImprovementsInputSchema,
  typeof SuggestImprovementsOutputSchema
>({
  name: 'suggestImprovementsFlow',
  inputSchema: SuggestImprovementsInputSchema,
  outputSchema: SuggestImprovementsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

