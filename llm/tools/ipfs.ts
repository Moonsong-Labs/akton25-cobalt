import { PinataSDK } from "pinata";
import type { UploadResponse } from "pinata";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import "dotenv/config";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

export async function upload_json_to_ipfs(name: string, content: object): Promise<UploadResponse> {
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

export async function upload_image_to_ipfs(imageFile: File): Promise<UploadResponse> {
  try {
    const upload = await pinata.upload.public.file(imageFile);
    console.log(upload);
    return upload;
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
}

export const uploadHeroTool = new DynamicStructuredTool({
  name: "uploadHero",
  description: "Upload a Hero to IPFS using Pinata",
  schema: z.object({
    name: z.string().describe("The name of the file to upload"),
    content: z.object({
      name: z.string().describe("The name of the hero"),
      description: z.string().describe("The description of the hero"),
      image: z.string().describe("The image of the hero"),
      attributes: z.array(z.object({
        attack: z.string().describe("The attack of the hero"),
        value: z.string().describe("The attack value of the hero"),
      })).describe("The attributes of the hero"),
    }).describe("The content to upload to IPFS"),
  }),
  func: async ({ name, content }) => {
    return upload_json_to_ipfs(name, content);
  },
});

export const uploadImageTool = new DynamicStructuredTool({
  name: "uploadImage",
  description: "Upload an image to IPFS using Pinata",
  schema: z.object({
    imageFile: z.instanceof(File).describe("The image file to upload"),
  }),
  func: async ({ imageFile }) => {
    return upload_image_to_ipfs(imageFile);
  },
});
