import type { MessageContent } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { z } from "zod";
import { dreamerAgent } from "./dreamer";
import { gpt4omini, gpt4ominiLowTemp, llama31withTools } from "./models";
import { recruiterAgent } from "./recruiter";
import {storyTellerAgent, instructionsBio, instructionsStart, instructionsTask} from "./storyteller";
import {
  createQuestTool,
  generateAndSaveHeroMetadataTool,
  recruitHeroTool,
  saveImageLocallyTool,
  startQuestTool,
  uploadHeroTool,
  uploadImageTool,
  uploadStageTool,
} from "./tools";
import { invokerAgent } from "./invoker";

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
  
  ### Global Rules
  - WHenever there is an error related to a missing environment variable or AssertionError, stop all execution and report the fault.

  ### Character generation
  - When needing to create a new hero, ask the recruiter agent to generate you some random stats and name for a hero.
  - Depending on which stats recruit gives you, create a biography for them with the storyteller using ${instructionsBio} as instructions.
  - Depending on the biography given to you, ask the dreamer to create an image of them and upload it to ipfs with uploadImageTool.
  - Each character only requires a single image, identifiedably by their image name.
  - Ensure the dreamer returns the image name when it makes you an image.
  - Upload character image to ipfs using uploadImageTool.
  - Use the uploadHeroTool to persist a character to ipfs.
  - Display the image using the displayImageTool using the local image path.
  - Save generated hero images locally with saveImageLocallyTool  <heroname> (no spaces allLowercase)
  - Save generated metadata locally with the  generateAndSaveHeroMetadataTool <heroname> (no spaces allLowercase)
  - **IMPORTANT** Mint character on chain by using the recruitHeroTool. Pass in the wallet address of the original user query to this tool. The cid should be a complete ifps url as the metadata uri parameter.
  - Return the character id to the user.

  ### Creating a new Quest
  - When a new quest is to be started, ask the storyTellerAgent to generate a new quest description and scenario using ${instructionsTask} as instructions.
  - When a quest is created, called the createQuestTool to store it on chain.
  
  ### Starting a Quest
  - When a quest is to be started, call the startQuestTool to create a new quest.

  ### Scenario generation
  - When needing to create a new scenario, ask the storyteller to create a scenario name and description using ${instructionsStart} as instructions.
  - Ask the invoker to create 3 stages for the scenario with increasing difficulty.
  - Invoker will return only one stage at a time. You will need to ask the invoker for the next stage until all 3 are created.
  - For each stage, ask the storyteller to create a stage description and add it to the stage metadata.
  - For each stage, ask the dreamer to create an image of the stage and upload it to ipfs with uploadImageTool. Add the image name to the stage metadata.
  - Each stage only requires a single image, identifiedably by their image name.
  - Ensure the dreamer returns the image name when it makes you an image.
  - Use the uploadStageTool to persist a stage to ipfs.
  - Display the image using the displayImageTool using the local image path.
  `;

const necromancerAgent = createSupervisor({
  includeAgentName: "inline",
  supervisorName: "Necromancer",
  agents: [storyTellerAgent, dreamerAgent, recruiterAgent, invokerAgent],
  llm: gpt4ominiLowTemp,
  tools: [
    uploadHeroTool,
    uploadImageTool,
    uploadStageTool,
    createQuestTool,
    startQuestTool,
    recruitHeroTool,
    saveImageLocallyTool,
    generateAndSaveHeroMetadataTool,
  ],
  prompt: GAME_LOGIC,
});

export const app = necromancerAgent.compile({
  checkpointer: new MemorySaver(),
});
