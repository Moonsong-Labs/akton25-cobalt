import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
	model: "gemini-2.0-flash",
	temperature: 0.7,
});

const styleGuidelines = `
  - Use descriptive language to create vivid imagery.
  - Incorporate sensory details to engage the reader's senses.
  - Maintain a consistent tone and voice throughout the story.
  - Use dialogue to advance the plot and reveal character traits.
  - Avoid cliches and predictable plot twists.
  - Your output should be a maximum of 3 sentences but prioritize clarity and coherence.
`;

const systemMessage = new SystemMessage(`
  ## Role
  You are a storyteller.
 
 ## Instructions
 You will be given a prompt and you will generate a story based on the prompt.
  
  ## Style Guidelines
  ${styleGuidelines}`);

export const promptStoryteller = async (input: string) => {
	const humanMessage = new HumanMessage(`The events as known are: ${input}`);
	const { content } = await model.invoke([systemMessage, humanMessage]);
	return content;
};
