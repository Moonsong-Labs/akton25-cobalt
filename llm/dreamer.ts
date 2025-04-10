import assert from "node:assert";
import { GoogleGenAI } from "@google/genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
assert(GOOGLE_API_KEY, "GOOGLE_API_KEY is not set");

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

const promptTemplate = (userPrompt: string) => `
  Generate a single high-quality art asset based precisely on the object or scene described below. The style should be consistently applied as specified in the THEME section.
  
  ### DESCRIPTION:
  ${userPrompt}
  
  ### THEME:
  Art Style: [e.g., vector illustration, pixel art, watercolor, anime-style, cyberpunk, etc.]
  Color Palette: [optional—describe preferred color tones, contrasts, or monochromatic scheme]
  Lighting and Mood: [optional—soft lighting, vibrant highlights, dark ambient, etc.]
  Level of Detail: [optional—minimalistic, moderate, highly detailed]
  Background Preference: [optional—plain transparent background, gradient, detailed scene, etc.]
  Aspect Ratio or Dimensions: [optional—1:1 square, 16:9 widescreen, 1080x1080px, etc.]

  `;

export const promptDreamer = async (prompt: string) => {
	return ai.models.generateImages({
		model: "imagen-3.0-generate-002",
		prompt: promptTemplate(prompt),
		config: {
			numberOfImages: 1,
			outputMimeType: "image/png",
		},
	});
};
