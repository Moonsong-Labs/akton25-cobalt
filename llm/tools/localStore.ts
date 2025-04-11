import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { heroSchema } from "../schemas";

const GENERATED_DIR = "generated";
const JSON_DIR = join(GENERATED_DIR, "json");
const IMAGE_DIR = join(GENERATED_DIR, "images");

// Ensure directories exist
if (!existsSync(GENERATED_DIR)) {
  mkdirSync(GENERATED_DIR);
}
if (!existsSync(JSON_DIR)) {
  mkdirSync(JSON_DIR);
}
if (!existsSync(IMAGE_DIR)) {
  mkdirSync(IMAGE_DIR);
}

/**
 * Saves a JSON object to a local file in the generated/json directory.
 * @param name - The base name for the file (e.g., "hero1"). ".json" will be appended.
 * @param content - The JSON object to save.
 * @returns The relative path to the saved JSON file (e.g., "generated/json/hero1.json").
 */
export async function saveJsonLocally(
  name: string,
  content: object
): Promise<string> {
  const filePath = join(JSON_DIR, `${name}.json`);
  try {
    writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`JSON saved locally to: ${filePath}`);
    return filePath; // Return relative path
  } catch (error) {
    console.error("Error saving JSON locally:", error);
    throw error;
  }
}

/**
 * Saves an image file to a local directory in the generated/images directory.
 * @param sourceImagePath - The path to the source image file.
 * @param targetImageName - The desired name for the saved image file (e.g., "hero_avatar.png").
 * @returns The relative path to the saved image file (e.g., "generated/images/hero_avatar.png").
 */
export async function saveImageLocally(
  sourceImagePath: string,
  targetImageName: string
): Promise<string> {
  const targetPath = join(IMAGE_DIR, targetImageName);
  try {
    const bunFile = Bun.file(sourceImagePath);
    const arrayBuffer = await bunFile.arrayBuffer();
    writeFileSync(targetPath, Buffer.from(arrayBuffer));
    console.log(`Image saved locally to: ${targetPath}`);
    return targetPath; // Return relative path
  } catch (error) {
    console.error("Error saving image locally:", error);
    throw error;
  }
}

// Tool to save hero JSON locally
export const saveHeroLocallyTool = new DynamicStructuredTool({
  name: "saveHeroLocally",
  description: "Save Hero JSON data to a local file.",
  schema: heroSchema, // Reusing the existing hero schema
  func: async ({ name, content }) => {
    // Add the local image path to the content before saving
    // Assuming the image path is passed within the content object
    // or needs to be retrieved/constructed here.
    // We'll adjust this based on how the dreamer agent provides the image path.
    return saveJsonLocally(name, content);
  },
});

// Tool to save image locally
export const saveImageLocallyTool = new DynamicStructuredTool({
  name: "saveImageLocally",
  description: "Save an image file locally.",
  schema: z.object({
    sourceImagePath: z.string().describe("The file path of the source image."),
    targetImageName: z
      .string()
      .describe("The desired name for the saved image file (e.g., hero_avatar.png)."),
  }),
  func: async ({ sourceImagePath, targetImageName }) => {
    return saveImageLocally(sourceImagePath, targetImageName);
  },
}); 

export const generateAndSaveHeroMetadataTool = new DynamicStructuredTool({
  name: "generateHeroMetadata",
  description: "Generate metadata for a hero.",
  schema: z.object({
    heroDescription: z.string().describe("The biography of the hero."),
    heroImage: z.string().describe("The url of hero image"),
    heroName: z.string().describe("The name of the hero."),
  }),
  func: async ({ heroName, heroDescription, heroImage }): Promise<string> => {
    console.log("Generating metadata for hero:", heroName);
    const metadata = {
      name: heroName,
      image: heroImage,
      description: heroDescription,
    };
    console.log(metadata)
    const filePath= `generated/json/${heroName}.json`
    
    Bun.write(filePath, JSON.stringify(metadata));
    return `Saved locally to ${filePath}`
  },
});
