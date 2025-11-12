import { GoogleGenAI, Type } from "@google/genai";
import { AuthenticityAnalysis, UserAnswers } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Custom error to carry the raw response payload for debugging
export class JsonParseError extends Error {
  public rawResponse: string;
  constructor(message: string, rawResponse: string) {
    super(message);
    this.name = 'JsonParseError';
    this.rawResponse = rawResponse;
  }
}

const analysisSchema = {
  type: Type.OBJECT,
  required: ["name", "authenticity_analysis"], // Make the structured data required
  properties: {
    name: { type: Type.STRING },
    authenticity_analysis: {
      type: Type.OBJECT,
      required: ["alignment", "boundary_consistency", "shadow_integration", "ethical_string_influence", "self_expression"],
      properties: {
        alignment: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score from 0-10" },
            evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        boundary_consistency: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score from 0-10" },
            evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        shadow_integration: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score from 0-10" },
            evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        ethical_string_influence: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score from 0-10" },
            evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        self_expression: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score from 0-10" },
            evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    },
    narrative_summary: { 
        type: Type.STRING,
        description: 'A concise, non-judgmental summary, strictly under 200 words.'
    },
  },
};


export const analyzePublicFigure = async (name: string): Promise<{ analysis: AuthenticityAnalysis, rawText: string }> => {
  // Simplified prompt that focuses on the task, not the structure.
  // The schema will handle forcing the correct JSON output.
  const prompt = `
    Perform a detailed analysis of the public figure "${name}" based on the five dimensions of authenticity and coherence:
    1.  **Alignment**: Consistency between stated values and observable behavior.
    2.  **Boundary Consistency**: Patterns of refusal, acceptance, and autonomy.
    3.  **Shadow Integration**: How impulses or unorthodox behaviors manifest.
    4.  **Influence of Ethical Strings**: Degree to which societal expectations dictate behavior.
    5.  **Self-Expression**: Coherence and clarity of persona.

    For each dimension, provide a score from 0 to 10 and bullet points of supporting evidence from publicly available information.
    
    Finally, provide a concise narrative summary (under 200 words).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      maxOutputTokens: 8192, // Increased significantly to ensure space for all fields
    },
  });
  
  const rawText = response.text;

  try {
    let jsonString = rawText.trim();
    const parsedJson = JSON.parse(jsonString);
    return { analysis: parsedJson as AuthenticityAnalysis, rawText };
  } catch (e) {
    console.error("Failed to parse JSON response:", rawText, e);
    throw new JsonParseError("The AI returned an invalid data format.", rawText);
  }
};

export const getSurpriseFigure = async (): Promise<string> => {
  const prompt = `
    Suggest an interesting and well-known public figure to analyze for authenticity.
    The figure can be from any field like arts, science, politics, or business.
    **CRITICAL:** I need a DIFFERENT and UNEXPECTED suggestion each time. Do not repeat previous suggestions.
    Return ONLY the full name of the person, with no additional text, titles, or quotation marks.
    For example: Leonardo da Vinci
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        temperature: 1.0, // Maximize creativity and randomness
    }
  });
  return response.text.trim().replace(/"/g, ''); // Clean up any quotes
};

export const analyzeUser = async (answers: UserAnswers): Promise<string> => {
    const prompt = `
        Analyze the following self-assessment responses to create a psychological profile summary.
        This summary should focus on the user's likely perspectives on authenticity, coherence, and personal boundaries.
        Based on this profile, describe the user's potential leanings and biases when evaluating public figures.
        The summary must be descriptive, non-judgmental, insightful, and written in the second person (e.g., "You likely value...").
        Do not repeat the questions or answers. Provide a concise, narrative paragraph.

        User's Answers:
        ${JSON.stringify(answers, null, 2)}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const analyzeBias = async (
  userProfile: string,
  figureAnalysis: AuthenticityAnalysis
): Promise<string> => {
    const prompt = `
        A user with the following profile is evaluating a public figure.

        User Profile:
        ${userProfile}

        Public Figure Analysis:
        Name: ${figureAnalysis.name}
        Summary: ${figureAnalysis.narrative_summary}
        Scores: 
        - Alignment: ${figureAnalysis.authenticity_analysis.alignment.score}
        - Boundary Consistency: ${figureAnalysis.authenticity_analysis.boundary_consistency.score}
        - Shadow Integration: ${figureAnalysis.authenticity_analysis.shadow_integration.score}
        - Ethical String Influence: ${figureAnalysis.authenticity_analysis.ethical_string_influence.score}
        - Self Expression: ${figureAnalysis.authenticity_analysis.self_expression.score}

        Based on the user's profile and the analysis of the public figure, provide a brief, non-judgmental commentary on how the user's biases and leanings might influence their perception of this figure. 
        Highlight potential areas of strong resonance (where the user might view the figure favorably) and dissonance (where they might be more critical).
        The analysis should be insightful and written directly to the user (e.g., "Given your values, you might find...").
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};