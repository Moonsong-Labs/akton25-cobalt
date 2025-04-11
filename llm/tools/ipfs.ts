import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import PinataSDK from "@pinata/sdk";
import type { PinataConfig, PinataPinResponse } from "@pinata/sdk";

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
};

const pinata = new PinataSDK(pinataConfig);

export async function upload_json_to_ipfs(
  name: string,
  content: object
): Promise<PinataPinResponse> {
  try {
    const result = await pinata.pinJSONToIPFS(content, {
      pinataMetadata: {
        name: name,
      },
    });
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

export const uploadHeroTool = new DynamicStructuredTool({
  name: "uploadHero",
  description: "Upload a Hero to IPFS using Pinata",
  schema: heroSchema,
  func: async (input) => {
    try {
      const result = await pinata.pinJSONToIPFS(input, {
        pinataMetadata: {
          name: input.name,
        },
      });
      return `Hero uploaded successfully! IPFS Hash: ${result.IpfsHash}`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return `Error uploading hero: ${errorMessage}`;
    }
  },
});

export async function upload_image_to_ipfs(
  imagePath: string
): Promise<PinataPinResponse> {
  try {
    // read image from assets
    const bunFile = Bun.file(imagePath);
    const arrayBuffer = await bunFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([buffer], { type: "image/png" }),
      "hero.png"
    );

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env["PINATA_JWT"]}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const upload = await response.json();
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
