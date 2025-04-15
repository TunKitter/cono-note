// Use server directive.
'use server';

/**
 * @fileOverview Generates Javascript code based on a description.
 *
 * - generateCodeFromDescription - A function that generates Javascript code based on a description.
 * - GenerateCodeFromDescriptionInput - The input type for the generateCodeFromDescription function.
 * - GenerateCodeFromDescriptionOutput - The return type for the generateCodeFromDescription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCodeFromDescriptionInputSchema = z.object({
  description: z.string().describe('The description of the Javascript code to generate.'),
});
export type GenerateCodeFromDescriptionInput = z.infer<typeof GenerateCodeFromDescriptionInputSchema>;

const GenerateCodeFromDescriptionOutputSchema = z.object({
  code: z.string().describe('The generated Javascript code.'),
});
export type GenerateCodeFromDescriptionOutput = z.infer<typeof GenerateCodeFromDescriptionOutputSchema>;

export async function generateCodeFromDescription(
  input: GenerateCodeFromDescriptionInput
): Promise<GenerateCodeFromDescriptionOutput> {
  return generateCodeFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromDescriptionPrompt',
  input: {
    schema: z.object({
      description: z.string().describe('The description of the Javascript code to generate.'),
    }),
  },
  output: {
    schema: z.object({
      code: z.string().describe('The generated Javascript code.'),
    }),
  },
  prompt: `You are an AI code assistant that generates JavaScript code based on a description.

  Generate the JavaScript code based on the following description:
  {{description}}

  The code should be wrapped in a function.
  `,
});

const generateCodeFromDescriptionFlow = ai.defineFlow<
  typeof GenerateCodeFromDescriptionInputSchema,
  typeof GenerateCodeFromDescriptionOutputSchema
>(
  {
    name: 'generateCodeFromDescriptionFlow',
    inputSchema: GenerateCodeFromDescriptionInputSchema,
    outputSchema: GenerateCodeFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
