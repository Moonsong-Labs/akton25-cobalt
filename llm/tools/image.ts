import { tool } from "@langchain/core/tools";
import terminalImage from "terminal-image";
import { z } from "zod";

export const displayImageTool = tool(
	async (args): Promise<string> => {
		console.log("Displaying image...");
		const filePath = args.imagePath
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
		return `image file path: ${args.imagePath}`;
	},
	{
		name: "displayImage",
		description: "Display an image",
		schema: z.object({
			imagePath: z.string().describe("The path of the image to display"),
		}),
	},
);
