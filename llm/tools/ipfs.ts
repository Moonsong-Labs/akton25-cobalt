import  assert  from "node:assert";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { create } from "@web3-storage/w3up-client";
import type { AnyLink } from "@web3-storage/w3up-client/types";
import dotenv from "dotenv";
import { PinataSDK } from "pinata";
import type { UploadResponse } from "pinata";
import { z } from "zod";
import PinataSDK from "@pinata/sdk";
import type { PinataConfig, PinataPinResponse } from "@pinata/sdk";


dotenv.config();

const pinata = new PinataSDK({
	pinataJwt: process.env.PINATA_JWT,
	pinataGateway: process.env.GATEWAY_URL,
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

export async function uploadJsonToStorach(
	name: string,
	content: object,
): Promise<AnyLink> {
	try {
		const file = new File([JSON.stringify(content)], name, {
			type: "application/json",
		});

		const loginName = process.env.STORACH_LOGIN_NAME
		const loginPassword = process.env.STORACH_LOGIN_PASSWORD

		const client = await create()
		assert(loginName)
		assert(loginPassword)
		await client.login(loginName as any)
		await client.setCurrentSpace(loginPassword as any) 
		const upload = await client.uploadFile(file)
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

export async function uploadImageToStoracha(
	imagePath: string,
): Promise<AnyLink> {
	try {
		// read image from assets
		const bunFile = Bun.file(imagePath);
		const arrayBuffer = await bunFile.arrayBuffer();
		const imageFile = new File([arrayBuffer], "hero.png", {
			type: "image/png",
		});

		const loginName = process.env.STORACH_LOGIN_NAME
		const loginPassword = process.env.STORACH_LOGIN_PASSWORD

		const client = await create()
		assert(loginName)
		assert(loginPassword)
		await client.login(loginName as any)
		await client.setCurrentSpace(loginPassword as any) 
		const upload = await client.uploadFile(imageFile)
		console.log(upload);
		return upload;
	} catch (error) {
		console.error("Error uploading image to IPFS:", error);
		throw error;
	}
}

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
