import { ethers } from "ethers";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import Quest from "../../contracts/out/Quest.sol/Quest.json";
import Tavern from "../../contracts/out/Tavern.sol/Tavern.json";

export function getSigner(privateKey: string): ethers.Signer {
	const rpcUrl = process.env.ETHEREUM_RPC_URL;
	if (!rpcUrl) {
		throw new Error("ETHEREUM_RPC_URL environment variable is not set");
	}
	const provider = new ethers.JsonRpcProvider(rpcUrl);
	return new ethers.Wallet(privateKey, provider);
}

// Types matching the Solidity contracts
export type QuestStatus = "OPEN" | "IN_PROGRESS" | "FINISHED";
export enum Task {
	ROMANCE = "ROMANCE",
	FIGHT = "FIGHT",
	BRIBE = "BRIBE",
	PERSUADE = "PERSUADE",
	SNEAK = "SNEAK",
}

export enum Outcome {
	PASS = "PASS",
	FAIL = "FAIL",
}

export interface HeroStats {
	strength: number;
	dexterity: number;
	willPower: number;
	intelligence: number;
	charisma: number;
	constitution: number;
}

export interface HeroInfo {
	name: string;
	level: number;
	metadataUrl: string;
	cooldown: number;
	stats: HeroStats;
}

export type QuestContract = ethers.Contract & {
	createNewQuest: (
		metadataUrl: string,
	) => Promise<ethers.ContractTransactionResponse>;
	joinQuest: (
		questId: number,
		heroId: number,
	) => Promise<ethers.ContractTransactionResponse>;
	startQuest: (questId: number) => Promise<ethers.ContractTransactionResponse>;
	performTask: (
		questId: number,
		heroId: number,
		task: number,
	) => Promise<ethers.ContractTransactionResponse>;
	resolveTask: (
		questId: number,
		outcome: number,
	) => Promise<ethers.ContractTransactionResponse>;
	finishQuest: (questId: number) => Promise<ethers.ContractTransactionResponse>;
	questHeroes: (questId: number) => Promise<ethers.BigNumberish[]>;
	url: (questId: number) => Promise<string>;
};

export type TavernContract = ethers.Contract & {
	recruit: (
		master: string,
		name: string,
		uri: string,
		stats: HeroStats,
	) => Promise<ethers.ContractTransactionResponse>;
	heroInfo: (heroId: number) => Promise<HeroInfo>;
	isActive: (heroId: number) => Promise<boolean>;
	setQuest: (
		questAddress: string,
	) => Promise<ethers.ContractTransactionResponse>;
};

export function getQuestContract(
	questAddress: string,
	private_key: string,
): QuestContract {
	const signer = getSigner(private_key);
	return new ethers.Contract(questAddress, Quest.abi, signer) as QuestContract;
}

export function getTavernContract(
	tavernAddress: string,
	private_key: string,
): TavernContract {
	const signer = getSigner(private_key);
	return new ethers.Contract(
		tavernAddress,
		Tavern.abi,
		signer,
	) as TavernContract;
}

// Quest Contract Interactions
export async function createQuest(
	questAddress: string,
	private_key: string,
	metadataUrl: string,
): Promise<number> {
	const tx = await getQuestContract(questAddress, private_key).createNewQuest(
		metadataUrl,
	);
	const receipt = await tx.wait();
	if (!receipt) throw new Error("Transaction receipt is null");
	const event = receipt.logs[0];
	if (!event || !("args" in event))
		throw new Error("Event log not found or invalid");
	return Number(event.args.questId);
}

export const createQuestTool = new DynamicStructuredTool({
	name: "createQuest",
	description: "Create a new quest",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		metadataUrl: z.string().describe("The URL of the quest metadata"),
	}),
	func: async ({ questAddress, private_key, metadataUrl }) => {
		const questId = await createQuest(questAddress, private_key, metadataUrl);
		return `Quest created successfully: ${questId}`;
	},
});

export async function joinQuest(
	questAddress: string,
	private_key: string,
	questId: number,
	heroId: number,
): Promise<void> {
	const tx = await getQuestContract(questAddress, private_key).joinQuest(
		questId,
		heroId,
	);
	await tx.wait();
}

export const joinQuestTool = new DynamicStructuredTool({
	name: "joinQuest",
	description: "Join a quest",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		questId: z.number().describe("The ID of the quest"),
		heroId: z.number().describe("The ID of the hero"),
	}),
	func: async ({ questAddress, private_key, questId, heroId }) => {
		await joinQuest(questAddress, private_key, questId, heroId);
		return "Hero joined quest successfully";
	},
});

export async function startQuest(
	questAddress: string,
	private_key: string,
	questId: number,
): Promise<void> {
	const tx = await getQuestContract(questAddress, private_key).startQuest(
		questId,
	);
	await tx.wait();
}

export const startQuestTool = new DynamicStructuredTool({
	name: "startQuest",
	description: "Start a quest",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		questId: z.number().describe("The ID of the quest"),
	}),
	func: async ({ questAddress, private_key, questId }) => {
		await startQuest(questAddress, private_key, questId);
		return "Quest started successfully";
	},
});

export async function performTask(
	questAddress: string,
	private_key: string,
	questId: number,
	heroId: number,
	task: Task,
): Promise<void> {
	const tx = await getQuestContract(questAddress, private_key).performTask(
		questId,
		heroId,
		taskToNumber(task),
	);
	await tx.wait();
}

export const performTaskTool = new DynamicStructuredTool({
	name: "performTask",
	description: "Perform a task",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		questId: z.number().describe("The ID of the quest"),
		heroId: z.number().describe("The ID of the hero"),
		task: z.nativeEnum(Task).describe("The task to perform"),
	}),
	func: async ({ questAddress, private_key, questId, heroId, task }) => {
		await performTask(questAddress, private_key, questId, heroId, task);
		return "Task performed successfully";
	},
});

export async function resolveTask(
	questAddress: string,
	private_key: string,
	questId: number,
	outcome: Outcome,
): Promise<void> {
	const tx = await getQuestContract(questAddress, private_key).resolveTask(
		questId,
		outcomeToNumber(outcome),
	);
	await tx.wait();
}

export const resolveTaskTool = new DynamicStructuredTool({
	name: "resolveTask",
	description: "Resolve a task",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		questId: z.number().describe("The ID of the quest"),
		outcome: z.nativeEnum(Outcome).describe("The outcome of the task"),
	}),
	func: async ({ questAddress, private_key, questId, outcome }) => {
		await resolveTask(questAddress, private_key, questId, outcome);
		return "Task resolved successfully";
	},
});

export async function finishQuest(
	questAddress: string,
	private_key: string,
	questId: number,
): Promise<void> {
	const tx = await getQuestContract(questAddress, private_key).finishQuest(
		questId,
	);
	await tx.wait();
}

export const finishQuestTool = new DynamicStructuredTool({
	name: "finishQuest",
	description: "Finish a quest",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		questId: z.number().describe("The ID of the quest"),
	}),
	func: async ({ questAddress, private_key, questId }) => {
		await finishQuest(questAddress, private_key, questId);
		return "Quest finished successfully";
	},
});

export async function getQuestHeroes(
	questAddress: string,
	private_key: string,
	questId: number,
): Promise<number[]> {
	return (
		await getQuestContract(questAddress, private_key).questHeroes(questId)
	).map((id: ethers.BigNumberish) => Number(id));
}

export const getQuestHeroesTool = new DynamicStructuredTool({
	name: "getQuestHeroes",
	description: "Get the heroes of a quest",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		questId: z.number().describe("The ID of the quest"),
	}),
	func: async ({ questAddress, private_key, questId }) => {
		const heroes = await getQuestHeroes(questAddress, private_key, questId);
		return `Heroes: ${heroes.join(", ")}`;
	},
});

export async function getQuestUrl(
	questAddress: string,
	private_key: string,
	questId: number,
): Promise<string> {
	return await getQuestContract(questAddress, private_key).url(questId);
}

export const getQuestUrlTool = new DynamicStructuredTool({
	name: "getQuestUrl",
	description: "Get the URL of a quest",
	schema: z.object({
		questAddress: z.string().describe("The address of the quest"),
		private_key: z.string().describe("The private key of the quest"),
		questId: z.number().describe("The ID of the quest"),
	}),
	func: async ({ questAddress, private_key, questId }) => {
		const url = await getQuestUrl(questAddress, private_key, questId);
		return `URL: ${url}`;
	},
});

// Tavern Contract Interactions
export async function recruitHero(
	tavernAddress: string,
	private_key: string,
	master: string,
	name: string,
	uri: string,
	stats: HeroStats,
): Promise<number> {
	const tx = await getTavernContract(tavernAddress, private_key).recruit(
		master,
		name,
		uri,
		stats,
	);
	const receipt = await tx.wait();
	if (!receipt) throw new Error("Transaction receipt is null");
	const event = receipt.logs[0];
	if (!event || !("args" in event))
		throw new Error("Event log not found or invalid");
	return Number(event.args.heroId);
}

export const recruitHeroTool = new DynamicStructuredTool({
	name: "recruitHero",
	description: "Recruit a hero",
	schema: z.object({
		tavernAddress: z.string().describe("The address of the tavern"),
		private_key: z.string().describe("The private key of the tavern"),
		master: z.string().describe("The master of the hero"),
		name: z.string().describe("The name of the hero"),
		uri: z.string().describe("The URI of the hero"),
		stats: z.object({
			strength: z.number().describe("The strength of the hero"),
			dexterity: z.number().describe("The dexterity of the hero"),
			willPower: z.number().describe("The will power of the hero"),
			intelligence: z.number().describe("The intelligence of the hero"),
			charisma: z.number().describe("The charisma of the hero"),
			constitution: z.number().describe("The constitution of the hero"),
		}),
	}),
	func: async ({ tavernAddress, private_key, master, name, uri, stats }) => {
		const heroId = await recruitHero(
			tavernAddress,
			private_key,
			master,
			name,
			uri,
			stats,
		);
		return `Hero recruited successfully: ${heroId}`;
	},
});

export async function getHeroInfo(
	tavernAddress: string,
	private_key: string,
	heroId: number,
): Promise<HeroInfo> {
	return await getTavernContract(tavernAddress, private_key).heroInfo(heroId);
}

export const getHeroInfoTool = new DynamicStructuredTool({
	name: "getHeroInfo",
	description: "Get the info of a hero",
	schema: z.object({
		tavernAddress: z.string().describe("The address of the tavern"),
		private_key: z.string().describe("The private key of the tavern"),
		heroId: z.number().describe("The ID of the hero"),
	}),
	func: async ({ tavernAddress, private_key, heroId }) => {
		const heroInfo = await getHeroInfo(tavernAddress, private_key, heroId);
		return `Hero info: ${JSON.stringify(heroInfo)}`;
	},
});

export async function isHeroActive(
	tavernAddress: string,
	private_key: string,
	heroId: number,
): Promise<boolean> {
	return await getTavernContract(tavernAddress, private_key).isActive(heroId);
}

export const isHeroActiveTool = new DynamicStructuredTool({
	name: "isHeroActive",
	description: "Check if a hero is active",
	schema: z.object({
		tavernAddress: z.string().describe("The address of the tavern"),
		private_key: z.string().describe("The private key of the tavern"),
		heroId: z.number().describe("The ID of the hero"),
	}),
	func: async ({ tavernAddress, private_key, heroId }) => {
		const isActive = await isHeroActive(tavernAddress, private_key, heroId);
		return `Hero is active: ${isActive}`;
	},
});

// Helper function to convert between Solidity enums and TypeScript strings
export function questStatusToNumber(status: QuestStatus): number {
	switch (status) {
		case "OPEN":
			return 0;
		case "IN_PROGRESS":
			return 1;
		case "FINISHED":
			return 2;
		default:
			throw new Error("Invalid quest status");
	}
}

export function taskToNumber(task: Task): number {
	switch (task) {
		case "ROMANCE":
			return 0;
		case "FIGHT":
			return 1;
		case "BRIBE":
			return 2;
		case "PERSUADE":
			return 3;
		case "SNEAK":
			return 4;
		default:
			throw new Error("Invalid task");
	}
}

export function outcomeToNumber(outcome: Outcome): number {
	switch (outcome) {
		case "PASS":
			return 0;
		case "FAIL":
			return 1;
		default:
			throw new Error("Invalid outcome");
	}
}
