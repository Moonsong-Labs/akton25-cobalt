import { createSupervisor } from "@langchain/langgraph-supervisor";
import { dreamerAgent } from "./dreamer";
import { gpt4omini, llama31withTools } from "./models";
import { storyTellerAgent } from "./storyteller";

export const promptNecro = async (message: string) => {
	const response = await llama31withTools.invoke(message);
	return response;
};

const GAME_LOGIC =
	"You are a team supervisor managing a narrative expert, an artist. " +
	"For queries that require narrative text, use the storyteller. " +
	"For any tasks that require art assets created, use the dreamer.";

const necromancerAgent = createSupervisor({
	agents: [storyTellerAgent, dreamerAgent],
	llm: gpt4omini,
	tools: [],
	prompt: GAME_LOGIC,
});

export const app = necromancerAgent.compile();
