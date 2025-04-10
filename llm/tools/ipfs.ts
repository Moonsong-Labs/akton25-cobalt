import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import PinataSDK from "@pinata/sdk";
import type { PinataConfig } from "@pinata/sdk";
import type { UploadResponse } from "pinata";
import { z } from "zod";
import { heroSchema } from "../schemas";

// Define the schema first
const heroSchema = z.object({
  name: z.string().describe("The name of the hero"),
  level: z.number().describe("The level of the hero"),
  class: z.string().describe("The class of the hero"),
  attributes: z.object({
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
  }),
});

const pinataConfig: PinataConfig = {
  pinataJWTKey: process.env["PINATA_JWT"] || "",
  pinataGateway: process.env["GATEWAY_URL"] || "",
};

const pinata = new PinataSDK(pinataConfig);

export async function upload_json_to_ipfs(
  name: string,
  content: object
): Promise<UploadResponse> {
  try {
    const file = new File([JSON.stringify(content)], name, {
      type: "application/json",
    });
    const upload = await pinata.upload.public.file(file);
    console.log(upload);
    return upload;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

export const uploadHeroTool = new DynamicStructuredTool({
	name: "uploadHero",
	description: "Upload a Hero to IPFS using Pinata",
	schema: heroSchema,
	func: async ({ name, content }) => {
		return upload_json_to_ipfs(name, content);
	},
});

export async function upload_image_to_ipfs(
  imagePath: string
): Promise<UploadResponse> {
  try {
    // read image from assets
    const bunFile = Bun.file(imagePath);
    const arrayBuffer = await bunFile.arrayBuffer();
    const imageFile = new File([arrayBuffer], "hero.png", {
      type: "image/png",
    });

    const upload = await pinata.upload.public.file(imageFile);
    console.log(upload);
    return upload;
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
}

export const uploadImageTool = new DynamicStructuredTool({
  name: "uploadImage",
  description: "Upload an image to IPFS using Pinata",
  schema: z.object({
    imageFilePath: z.string().describe("The file path of the image to upload"),
  }),
  func: async ({ imageFilePath }) => {
    return upload_image_to_ipfs(imageFilePath);
  },
});
