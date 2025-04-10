import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { gpt4omini } from "./models";
import { createReactAgent } from "@langchain/langgraph/prebuilt";


const styleGuidelines = `
  - Use descriptive language to create vivid imagery.
  - Incorporate sensory details to engage the reader's senses.
  - Maintain a consistent tone and voice throughout the story.
  - Use dialogue to advance the plot and reveal character traits.
  - Avoid cliches and predictable plot twists.
  - Your output should be a maximum of 3 sentences but prioritize clarity and coherence.
`;

export const systemMessageText = `
  ## Role
  You are a storyteller.
 
 ## Instructions
 You will be given a prompt and you will generate a story based on the prompt.
  
  ## Style Guidelines
  ${styleGuidelines}`

const systemMessage = new SystemMessage(systemMessageText);

export const promptStoryteller = async (input: string) => {
	const humanMessage = new HumanMessage(`The events as known are: ${input}`);
	const { content } = await gpt4omini.invoke([systemMessage, humanMessage]);
	return content;
};


export const storyTellerAgent = createReactAgent({
  llm: gpt4omini,
  tools: [],
  prompt: systemMessageText,
  name: "Storyteller",
});
