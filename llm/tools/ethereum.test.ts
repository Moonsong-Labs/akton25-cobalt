import { expect, test } from "bun:test";
import { ethers } from "ethers";
import Quest from "../../contracts/out/Quest.sol/Quest.json";
import Tavern from "../../contracts/out/Tavern.sol/Tavern.json";
import {
	createQuest,
	joinQuest,
	startQuest,
	performTask,
	getQuestHeroes,
	recruitHero,
	getHeroInfo,
	isHeroActive,
	questStatusToNumber,
	taskToNumber,
	outcomeToNumber,
} from "./ethereum";

// Anvil test setup
const ANVIL_RPC_URL = "http://localhost:8545";
const ANVIL_PRIVATE_KEY =
	"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Anvil's first account

const setupTest = async () => {
	// Reset Anvil state
	const provider = new ethers.JsonRpcProvider(ANVIL_RPC_URL);
	await provider.send("anvil_reset", []);

	// Connect to Anvil
	const signer = new ethers.Wallet(ANVIL_PRIVATE_KEY, provider);

	// Deploy contracts
	const questFactory = new ethers.ContractFactory(
		Quest.abi,
		Quest.bytecode,
		signer,
	);
	const tavernFactory = new ethers.ContractFactory(
		Tavern.abi,
		Tavern.bytecode,
		signer,
	);

	const tavernContract = await tavernFactory.deploy(signer.address);
	await tavernContract.waitForDeployment();
	const tavernAddress = await tavernContract.getAddress();

	const questContract = await questFactory.deploy(
		tavernAddress,
		signer.address,
	);
	await questContract.waitForDeployment();
	const questAddress = await questContract.getAddress();

	// Set up the quest contract in the tavern
	const tavern = new ethers.Contract(
		tavernAddress,
		Tavern.abi,
		signer,
	);
	await tavern.setQuest(questAddress);

	return {
		provider,
		signer,
		quest: questContract,
		tavern: tavernContract,
		questAddress,
		tavernAddress,
	};
};

// Quest Management Tests
test("should create a new quest", async () => {
	const { questAddress } = await setupTest();
	const metadataUrl = "https://example.com/quest1";

	const questId = await createQuest(questAddress, ANVIL_PRIVATE_KEY, metadataUrl);
	expect(questId).toBe(0); // First quest should have ID 0
});

test("should join a quest", async () => {
	const { questAddress, tavernAddress } = await setupTest();
	const metadataUrl = "https://example.com/quest1";
	const questId = await createQuest(questAddress, ANVIL_PRIVATE_KEY, metadataUrl);

	// First create a hero
	const heroId = await recruitHero(
		tavernAddress,
		ANVIL_PRIVATE_KEY,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Anvil's second account
		"Sir Lancelot",
		"https://example.com/hero1",
		{
			strength: 10,
			dexterity: 8,
			willPower: 7,
			intelligence: 6,
			charisma: 9,
			constitution: 8,
		},
	);

	await joinQuest(questAddress, ANVIL_PRIVATE_KEY, questId, heroId);
});

test("should perform a task", async () => {
	const { questAddress, tavernAddress } = await setupTest();
	const metadataUrl = "https://example.com/quest1";
	const questId = await createQuest(questAddress, ANVIL_PRIVATE_KEY, metadataUrl);

	// Create a hero
	const heroId = await recruitHero(
		tavernAddress,
		ANVIL_PRIVATE_KEY,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
		"Sir Lancelot",
		"https://example.com/hero1",
		{
			strength: 10,
			dexterity: 8,
			willPower: 7,
			intelligence: 6,
			charisma: 9,
			constitution: 8,
		},
	);

	await joinQuest(questAddress, ANVIL_PRIVATE_KEY, questId, heroId);
	await startQuest(questAddress, ANVIL_PRIVATE_KEY, questId);
	await performTask(questAddress, ANVIL_PRIVATE_KEY, questId, heroId, "FIGHT");
});

test("should get quest heroes", async () => {
	const { questAddress, tavernAddress } = await setupTest();
	const metadataUrl = "https://example.com/quest1";
	const questId = await createQuest(questAddress, ANVIL_PRIVATE_KEY, metadataUrl);

	// Create a hero
	const heroId = await recruitHero(
		tavernAddress,
		ANVIL_PRIVATE_KEY,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
		"Sir Lancelot",
		"https://example.com/hero1",
		{
			strength: 10,
			dexterity: 8,
			willPower: 7,
			intelligence: 6,
			charisma: 9,
			constitution: 8,
		},
	);

	await joinQuest(questAddress, ANVIL_PRIVATE_KEY, questId, heroId);
	const heroes = await getQuestHeroes(questAddress, ANVIL_PRIVATE_KEY, questId);
	expect(heroes).toEqual([heroId]);
});

// Hero Management Tests
test("should recruit a new hero", async () => {
	const { tavernAddress } = await setupTest();
	const heroId = await recruitHero(
		tavernAddress,
		ANVIL_PRIVATE_KEY,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
		"Sir Lancelot",
		"https://example.com/hero1",
		{
			strength: 10,
			dexterity: 8,
			willPower: 7,
			intelligence: 6,
			charisma: 9,
			constitution: 8,
		},
	);
	expect(heroId).toBe(0); // First hero should have ID 0
});

test("should get hero info", async () => {
	const { tavernAddress } = await setupTest();
	const heroId = await recruitHero(
		tavernAddress,
		ANVIL_PRIVATE_KEY,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
		"Sir Lancelot",
		"https://example.com/hero1",
		{
			strength: 10,
			dexterity: 8,
			willPower: 7,
			intelligence: 6,
			charisma: 9,
			constitution: 8,
		},
	);

	const info = await getHeroInfo(tavernAddress, ANVIL_PRIVATE_KEY, heroId);
	expect(info.name).toBe("Sir Lancelot");
	expect(info.level).toBe(1);
	expect(info.metadataUrl).toBe("https://example.com/hero1");
	expect(info.stats.strength).toBe(10);
});

test("should check if hero is active", async () => {
	const { tavernAddress } = await setupTest();
	const heroId = await recruitHero(
		tavernAddress,
		ANVIL_PRIVATE_KEY,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
		"Sir Lancelot",
		"https://example.com/hero1",
		{
			strength: 10,
			dexterity: 8,
			willPower: 7,
			intelligence: 6,
			charisma: 9,
			constitution: 8,
		},
	);

	const isActive = await isHeroActive(tavernAddress, ANVIL_PRIVATE_KEY, heroId);
	expect(isActive).toBe(true);
});

// Helper Function Tests
test("should convert quest status to number", () => {
	expect(questStatusToNumber("OPEN")).toBe(0);
	expect(questStatusToNumber("IN_PROGRESS")).toBe(1);
	expect(questStatusToNumber("FINISHED")).toBe(2);
});

test("should convert task to number", () => {
	expect(taskToNumber("ROMANCE")).toBe(0);
	expect(taskToNumber("FIGHT")).toBe(1);
	expect(taskToNumber("BRIBE")).toBe(2);
	expect(taskToNumber("PERSUADE")).toBe(3);
	expect(taskToNumber("SNEAK")).toBe(4);
});

test("should convert outcome to number", () => {
	expect(outcomeToNumber("PASS")).toBe(0);
	expect(outcomeToNumber("FAIL")).toBe(1);
});
