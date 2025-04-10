import { ethers } from "ethers";
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
export type Task = "ROMANCE" | "FIGHT" | "BRIBE" | "PERSUADE" | "SNEAK";
export type Outcome = "PASS" | "FAIL";

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

export async function getQuestHeroes(
	questAddress: string,
	private_key: string,
	questId: number,
): Promise<number[]> {
	return (
		await getQuestContract(questAddress, private_key).questHeroes(questId)
	).map((id: ethers.BigNumberish) => Number(id));
}

export async function getQuestUrl(
	questAddress: string,
	private_key: string,
	questId: number,
): Promise<string> {
	return await getQuestContract(questAddress, private_key).url(questId);
}

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

export async function getHeroInfo(
	tavernAddress: string,
	private_key: string,
	heroId: number,
): Promise<HeroInfo> {
	return await getTavernContract(tavernAddress, private_key).heroInfo(heroId);
}

export async function isHeroActive(
	tavernAddress: string,
	private_key: string,
	heroId: number,
): Promise<boolean> {
	return await getTavernContract(tavernAddress, private_key).isActive(heroId);
}

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
