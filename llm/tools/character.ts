import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const pickGenderTool = tool(
	async () => {
		console.log("Picking gender...");
		const genders = ["Male", "Female", "Non-binary"];
		const randomIndex = Math.floor(Math.random() * genders.length);
		return genders[randomIndex];
	},
	{
		name: "pickGenderTool",
		description: "Randomly selects a gender for a hero character",
		schema: z.object({}),
	},
);
