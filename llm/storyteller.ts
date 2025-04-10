import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import {
	deepSeekV3,
	geminiFlash,
	gpt4omini,
	llama4Maverick,
	mistralSmall,
} from "./models";

const styleGuidelines = `
  - Use descriptive language to create vivid imagery.
  - Incorporate sensory details to engage the reader's senses.
  - Maintain a consistent tone and voice throughout the story.
  - Use dialogue to advance the plot and reveal character traits.
  - Avoid cliches and predictable plot twists.
  - Your output should be a maximum of 3 sentences but prioritize clarity and coherence.
`;

const instructionsTask = `
  - Your final sentence should present a challenge involving one of the characters that needs to be resolved.
  - Avoid repeating the same challenge or situation in the story.
  - The challenge should involve either an object or a monster but not both.
  - Provide a name and description for the object / monster.
  - The challenge should be resolvable by one of the following actions: "attack", "persuade", "bribe", "sneak", "romance" 
`;

const instructionsEnd = `
  - Your final sentence should present a conclusion to the story.
  - Based on the success or failure of the characters' previous actions, provide a resolution that ties up the narrative.
`;

export const systemMessageText = `
  ## Role
  You are a storyteller.
 
 ## Instructions
 - You will be given a prompt and you will generate a story based on the prompt.
 ${instructionsTask}
  
  ## Style Guidelines
  ${styleGuidelines}
  `;

const systemMessage = new SystemMessage(systemMessageText);

export const promptStoryteller = async (input: string) => {
	const humanMessage = new HumanMessage(`The events as known are: ${input}`);
	const { content } = await geminiFlash.invoke([systemMessage, humanMessage]);
	return content;
};

export const storyTellerAgent = createReactAgent({
	llm: geminiFlash,
	tools: [],
	prompt: systemMessageText,
	name: "Storyteller",
});
