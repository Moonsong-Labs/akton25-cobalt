import { DynamicStructuredTool } from "@langchain/core/tools";
import { PinataSDK } from "pinata";
import type { UploadResponse } from "pinata";
import { z } from "zod";
import { heroSchema } from "../recruiter";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

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
export const heroMetadata = z.object({
  id: z.string().uuid().describe("The unique identifier of the hero"),
  content: z.object({
    name: z.string().describe("The name of the hero"),
    description: z.string().describe("The description of the hero"),
    image: z.string().describe("The ipfs url of the hero"),
  }),
});

export const uploadHeroTool = new DynamicStructuredTool({
  name: "uploadHero",
  description: "Upload a Hero to IPFS using Pinata",
  schema: heroMetadata,
  func: async ({ id, content }) => {
    return upload_json_to_ipfs(id, content);
  },
});

export const stageMetadata = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().describe("The ipfs url of the stage"),
  hp: z.number().min(1).max(100),
  resistances: z
    .object({
      romance: z.number().min(-100).max(100),
      persuade: z.number().min(-100).max(100),
      bribe: z.number().min(-100).max(100),
      fight: z.number().min(-100).max(100),
      sneak: z.number().min(-100).max(100),
    })
    .describe("Resistances are percentages between -100% and 100%."),
});

export const uploadStageTool = new DynamicStructuredTool({
  name: "uploadStage",
  description: "Upload a Stage to IPFS using Pinata",
  schema: stageMetadata,
  func: async ({ name, description, image, hp, resistances }) => {
    return upload_json_to_ipfs(name, { description, image, hp, resistances });
  },
});

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
