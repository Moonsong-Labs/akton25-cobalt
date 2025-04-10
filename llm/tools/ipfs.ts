import { PinataSDK } from "pinata";
import "dotenv/config";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

/**
 * Uploads a file to IPFS using the Pinata SDK.
 * @param name - The name of the file to upload.
 * @param content - The content of the file to upload.
 * @returns The IPFS hash of the uploaded file.
 */
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
