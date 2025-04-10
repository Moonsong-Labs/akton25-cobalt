import assert from "node:assert";
import { GoogleGenAI } from "@google/genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import terminalImage from "terminal-image";
import { z } from "zod";
import { googleAi, gpt4omini } from "./models";

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
		console.log("Image generated successfully");
		console.log("Saving image...");
		const imageData = Buffer.from(imageBase64, "base64");
		const filePath = `generated/${args.imageName}.png`;
		await Bun.write(filePath, imageData);
		return `Image saved successfully to ${filePath}`;
	},
	{
		name: "generateImageAndSave",
		description: "Generate an image based on a prompt",
		schema: z.object({
			imageName: z.string().describe("Pascal case image name to save as"),
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

const saveImageTool = tool(
	async (args) => {
		console.log("Saving image...");
		const imageData = Buffer.from(args.imageBase64, "base64");
		await Bun.write("generated/dream.png", imageData);
	},
	{
		name: "saveImage",
		description: "Save an image to your device",
		schema: z.object({
			imageBase64: z.string().describe("The image data to save"),
			imageName: z.string().describe("The name of the image to save"),
		}),
	},
);

const displayImageTool = tool(
	async (args): Promise<string> => {
		console.log("Displaying image...");
		const filePath = `generated/${args.imageName}.png`;
		const file = Bun.file(filePath);
		if (!(await file.exists())) {
			return `Error: Image file not found at ${filePath}`;
		}
		const arrayBuffer = await file.arrayBuffer();
		const imageData = new Uint8Array(arrayBuffer);
		const imageInTerminal = await terminalImage.buffer(imageData, {
			width: "50%",
		});
		console.log(imageInTerminal);
		return `Image ${args.imageName}.png displayed successfully.`;
	},
	{
		name: "displayImage",
		description: "Display an image",
		schema: z.object({
			imageName: z.string().describe("The image name to display"),
		}),
	},
);

export const dreamerAgent = createReactAgent({
	llm: gpt4omini,
	name: "Dreamer",
	tools: [generateImageAndSaveTool, promptTemplateTool, displayImageTool],
	prompt:
		"You are an AI assistant that helps generate images based on user prompts. " +
		"Use the promptTemplate tool to format user requests into detailed image generation prompts. " +
		"Then use the generateImageAndSaveTool tool to create the image. " +
		"After generating an image, use the displayImage tool to show it to the user.",
});
