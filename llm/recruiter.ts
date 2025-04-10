import assert from "node:assert";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { gpt4omini } from "./models";
import { heroSchema, type Hero } from "./schemas";
import { pickGenderTool } from "./tools";

const systemMessage = new SystemMessage(
	"You are an expert Dungeons & Dragons style hero creator." +
		"You task is to create fun and interesting heros for people to play with.",
);

export const promptRecruiter = async (input: string) => {
	const humanMessage = new HumanMessage(`The events as known are: ${input}`);
	const { content } = await gpt4omini.invoke([systemMessage, humanMessage]);
	return content;
};

export function rollRandomHeroStats(): Omit<Hero, "level" | "name"> {
	// D&D 5e standard point buy starts with base stats of 8 and 27 points to spend
	const baseStatValue = 8;
	const totalPointsToSpend = 27;

	// Point cost table for D&D 5e point buy system
	// Value: 8  9  10 11 12 13 14 15
	// Cost:  0  1  2  3  4  5  7  9
	const pointCostTable: Record<number, number> = {
		8: 0,
		9: 1,
		10: 2,
		11: 3,
		12: 4,
		13: 5,
		14: 7,
		15: 9,
	};

	const stats = {
		strength: baseStatValue,
		dexterity: baseStatValue,
		constitution: baseStatValue,
		intelligence: baseStatValue,
		wisdom: baseStatValue,
		charisma: baseStatValue,
	};

	const statKeys = Object.keys(stats) as Array<keyof typeof stats>;

	let remainingPoints = totalPointsToSpend;
	while (remainingPoints > 0) {
		const randomStatIndex = Math.floor(Math.random() * statKeys.length);
		const statToIncrease = statKeys[randomStatIndex];
		assert(statToIncrease, "this is a bug!");
		const currentValue = stats[statToIncrease];

		if (currentValue < 15) {
			const costToIncrease =
				// @ts-ignore
				pointCostTable[currentValue + 1] - pointCostTable[currentValue];

			if (costToIncrease <= remainingPoints) {
				stats[statToIncrease]++;
				remainingPoints -= costToIncrease;
			}
		}

		if (statKeys.every((stat) => stats[stat] >= 15)) {
			break;
		}

		if (Math.random() < 0.05) {
			break;
		}
	}
	const bonusPoints = Math.floor(Math.random() * 2) + 1; // 1 or 2 bonus points
	for (let i = 0; i < bonusPoints; i++) {
		const randomStatIndex = Math.floor(Math.random() * statKeys.length);
		const statToBoost = statKeys[randomStatIndex];

		assert(statToBoost, "this is a bug!");

		if (stats[statToBoost] < 20) {
			stats[statToBoost]++;
		}
	}

	return { content: stats };
}

export const generateHeroTool = new DynamicStructuredTool({
	name: "generateHeroTool",
	description:
		"Generate random D&D style character stats using the point buy system",
	schema: z.object({
		name: z.string().describe("Hero's name"),
		content: heroSchema,
	}),
	func: async (input: { name: string }): Promise<Hero> => {
		console.log("Generating random hero...");
		const heroStats = rollRandomHeroStats();
		const hero = {
			name: input.name,
			...heroStats,
		};
		return hero;
	},
});

export const recruiterAgent = createReactAgent({
	llm: gpt4omini,
	name: "recruiter",
	tools: [generateHeroTool, pickGenderTool],
	prompt:
		"You are an dnd hero creator." +
		"You will generate random DND style heroes." +
		"You will use pickGenderTool to help influence a name you give them" +
		"You will pick random fantasy names to give them." +
		"Use the generateHeroTool tool to create new heros.",
});
