import { DynamicStructuredTool } from "@langchain/core/tools";
import { PinataSDK } from "pinata";
import type { UploadResponse } from "pinata";
import { z } from "zod";
import { heroSchema } from "../schemas";
import dotenv from "dotenv";
import  assert  from "node:assert";
import type { AnyLink } from "@web3-storage/w3up-client/types";
import { create } from "@web3-storage/w3up-client";


dotenv.config();

const pinata = new PinataSDK({
	pinataJwt: process.env.PINATA_JWT,
	pinataGateway: process.env.GATEWAY_URL,
});

export async function upload_json_to_ipfs(
	name: string,
	content: object,
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
	func: async ({ name, content }) => {
		return upload_json_to_ipfs(name, content);
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
	imagePath: string,
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
