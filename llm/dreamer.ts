import assert from "node:assert";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import terminalImage from "terminal-image";
import { z } from "zod";
import { googleAi, gpt4omini } from "./models";
import { MemorySaver } from "@langchain/langgraph";




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
	return googleAi.models.generateImages({
		model: "imagen-3.0-generate-002",
		prompt: promptTemplate(prompt),
		config: {
			numberOfImages: 1,
			outputMimeType: "image/png",
		},
	});
};

const generateImageTool = tool(
	async (prompt: string) => {
		console.log("Generating image...");
		const response = await promptDreamer(prompt);
		const imageData = response.generatedImages?.[0]?.image?.imageBytes;
		assert(imageData, "No image data received");
		console.log("Image generated successfully");
		return imageData;
	},
	{
		name: "generateImage",
		description: "Generate an image based on a prompt",
		schema: z
			.string()
			.describe("A generative AI prompt for generating an art asset."),
	},
);

const generateImageAndSaveTool = tool(
	async (args): Promise<string> => {
		console.log("Generating image...");
		const response = await promptDreamer(args.prompt);
		const imageBase64 = response.generatedImages?.[0]?.image?.imageBytes;
		assert(imageBase64, "No image data received");

		console.log("Saving image...");
		const imageData = Buffer.from(imageBase64, "base64");
		const filePath = `generated/${args.imageName}.png`;
		await Bun.write(filePath, imageData);
		return `image file path: ${filePath}`;
	},
	{
		name: "generateImageAndSave",
		description: "Generate an image based on a prompt",
		schema: z.object({
			imageName: z
				.string()
				.describe(
					"Name of the image file, single word, typically the name of the asset.",
				),
			prompt: z
				.string()
				.describe("A generative AI prompt for generating an art asset."),
		}),
	},
);

const promptTemplateTool = tool(
	async (prompt: string): Promise<string> => {
		console.log("Generating prompt template...");
		return promptTemplate(prompt);
	},
	{
		name: "promptTemplate",
		description: "Generate a prompt template based on a prompt",
		schema: z
			.string()
			.describe("A generative AI prompt for generating an art asset."),
	},
);

export const dreamerAgent = createReactAgent({
  checkpointSaver: new MemorySaver(),
	llm: gpt4omini,
	name: "Dreamer",
	tools: [generateImageAndSaveTool, promptTemplateTool],
	prompt: `
	## Role
	You are the Dreamer, an agent that imagines and creates new images based on requests and text only containing resulting filepaths.
	
	## Instructions
	- When being asked to generate an image: first use the promptTemplate tool to format any inputs into detailed image generation prompts.
	- When generating assets, choose a concise and simple name - usually based on the name of that character or asset.
	- Always use the generateImageAndSaveTool tool to create the image.
	- Whenever transferring to another agent, pass any image file path you have generated to the next agent.
	
	## Returns
	**ALWAYS** return image file path names e.g. generated/image1.png
	`,
});
