import type { MessageContent } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { z } from "zod";
import { dreamerAgent } from "./dreamer";
import { gpt4omini, gpt4ominiLowTemp, llama31withTools } from "./models";
import { recruiterAgent } from "./recruiter";
import { storyTellerAgent } from "./storyteller";
import { displayImageTool, uploadHeroTool, uploadImageTool } from "./tools";
import { createQuestTool, recruitHeroTool, startQuestTool } from "./tools/ethereum";

export const promptNecro = async (message: string) => {
  const response = await llama31withTools.invoke(message);
  return response;
};

export const cleanResponse = async (message: MessageContent) => {
  const schema = z.object({
    id: z.string().describe("The id of the character"),
    name: z.string().describe("The name of the character"),
  });

  const structuredPrompt = gpt4omini.withStructuredOutput(schema);
  return structuredPrompt.invoke(JSON.stringify(message));
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
  - **IMPORTANT** Mint character on chain by using the recruitHeroTool. Pass in the wallet address of the original user query to this tool.
  - Return the character id to the user.
  
  ### Starting a Quest
  - When a new quest is to be started, ask the storyTellerAgent to generate a new quest decription and scenario.
  - When a quest is to be started, call the startQuestTool to create a new quest.
  `;

const necromancerAgent = createSupervisor({
  includeAgentName: "inline",
  supervisorName: "Necromancer",
  agents: [storyTellerAgent, dreamerAgent, recruiterAgent],
  llm: gpt4ominiLowTemp,
  tools: [uploadHeroTool, uploadImageTool, displayImageTool,createQuestTool,startQuestTool, recruitHeroTool ],
  prompt: GAME_LOGIC,
});

export const app = necromancerAgent.compile({
  checkpointer: new MemorySaver(),
});
