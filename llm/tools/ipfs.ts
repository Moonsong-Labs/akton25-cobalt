import { PinataSDK } from "pinata";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import "dotenv/config";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

export async function upload_to_ipfs(name: string, content: string) {
  try {
    const file = new File([content], name, {
      type: "text/plain",
    });
    const upload = await pinata.upload.public.file(file);
    console.log(upload);
    return upload;

  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

export const ipfsUploadTool = new DynamicStructuredTool({
  name: "ipfs_upload",
  description: "Upload content to IPFS using Pinata",
  schema: z.object({
    name: z.string().describe("The name of the file to upload"),
    content: z.string().describe("The content to upload to IPFS"),
  }),
  func: async ({ name, content }) => {
    return upload_to_ipfs(name, content);
  },
});
