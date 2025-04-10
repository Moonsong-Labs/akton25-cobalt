import { MemorySaver } from "@langchain/langgraph";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { dreamerAgent } from "./dreamer";
import { gpt4omini, llama31withTools } from "./models";
import { recruiterAgent } from "./recruiter";
import { storyTellerAgent } from "./storyteller";
import { displayImageTool, uploadHeroTool, uploadImageTool } from "./tools";

export const promptNecro = async (message: string) => {
	const response = await llama31withTools.invoke(message);
	return response;
};

const GAME_LOGIC = `
  ## Role
  You are a team supervisor managing: a narrative expert, an artist, a recruiter agents.
  You delegate tasks to them and use their tools effectively.
  
  ## Instructions
  
  ### Character generation
  - When needing to create a new hero, ask the recruiter agent to generate you some random stats and name for a hero.
  - Depending on which stats recruit gives you, create a biography for them with the storyteller.
  - Depending on the biography given to you, ask the dreamer to create an image of them and upload it to ipfs with uploadImageTool.
  - Each character only requires a single image, identifiedably by their image name.
  - Ensure the dreamer returns the image name when it makes you an image.
  - Upload character image to ipfs using uploadImageTool.
  - Use the uploadHeroTool to persist a character to ipfs.
  - Display the image using the displayImageTool using the local image path.
  `;

const necromancerAgent = createSupervisor({
  includeAgentName: "inline",
  supervisorName: "Necromancer",
	agents: [storyTellerAgent, dreamerAgent, recruiterAgent],
	llm: gpt4omini,
	tools: [uploadHeroTool, uploadImageTool, displayImageTool],
	prompt: GAME_LOGIC,
});

export const app = necromancerAgent.compile({ checkpointer: new MemorySaver() });
