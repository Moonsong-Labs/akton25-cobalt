import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
	gpt4ominiCreative,
	mistralSmallCreative,
	llama31withTools,
} from "./models";
import {z} from "zod";

const styleGuidelines = `
  - Use descriptive language to create vivid imagery.
  - Incorporate sensory details to engage the reader's senses.
  - Maintain a consistent tone and voice throughout the story.
  - Use dialogue to advance the plot and reveal character traits.
  - Avoid cliches and predictable plot twists.
  - Your output should be a maximum of 3 sentences but prioritize clarity and coherence.
`;

export const instructionsStart = ` 
  - Define the setting and introduce the main characters.
  - Provide a brief background on how the characters got together.
  - Establish the tone and style of the story.
  - Ensure you have the name of the characters provided in the prompt.
  - Conclude with a cliffhanger that sets up the next part of the story.
  - Do not provide a resolution to the story.
  - The story should not include any specific challenges or conflicts.
`;

const instructionsTask = ` 
  - Stick to the established tone and style of the story.
  - If used, the names of the characters should be consistent with the overall story.
  - Your final sentence should present a challenge involving one of the characters that needs to be resolved.
  - Avoid repeating the same challenge or situation in the story.
  - The challenge should involve either an object or a monster but not both.
  - Provide a name and description for the object / monster.
  - The challenge should be resolvable by one of the following actions: "attack", "persuade", "bribe", "sneak", "romance" 
`;

const instructionsEnd = `
  - Stick to the established tone and style of the story.
  - If used, the names of the characters should be consistent with the overall story.
  - Your final sentence should present a conclusion to the story.
  - Based on the success or failure of the characters' previous actions, provide a resolution that ties up the narrative.
`;

export const instructionsBio = `
  - Using a provided name and stats, create a biography for a character.
  - The biography should include the character's background, personality traits, and motivations.
  - Avoid using the name more than once.
  - The biography should be engaging and provide depth to the character.
`;

export const systemMessageText = `
 ## Role
 You are a storyteller.
 
 ## Instructions
 - You will be given a prompt and you will generate a quest story or biography based on the prompt.
 - If you asked to return metadata, you will use the generateAsJSONTool to generate a JSON object.
 
 ## Style Guidelines
 ${styleGuidelines}
`;

const systemMessage = new SystemMessage(systemMessageText);

const generateAsJSONTool = tool(
	async (args): Promise<JSON> => {
		console.log("Generating prompt output...");
		const response =  await promptStoryteller(args.prompt);
		console.log("Generating JSON object...");
		let output: JSON = JSON.parse(`
		 	"content": "${response}",
		`);
		return output;
	},
	{
		name: "generateAsMetadata",
		description: "Generate a JSON object based on the input",
		schema: z.object({
			prompt: z.string().describe("The prompt to generate a JSON object"),
		}),
	},
);

export const promptStoryteller = async (input: string) => {
	const humanMessage = new HumanMessage(`The events as known are: ${input}`);
	const { content } = await gpt4ominiCreative.invoke([systemMessage, humanMessage]);
	return content;
};

export const storyTellerAgent = createReactAgent({
    checkpointSaver: new MemorySaver(),
    llm: gpt4ominiCreative,
	tools: [generateAsJSONTool],
	prompt: systemMessageText,
	name: "Storyteller",
});