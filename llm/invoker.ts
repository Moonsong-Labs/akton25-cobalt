import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { gpt4omini } from "./models";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const styleGuidelines = `
  - Output should be a JSON with fields:
    - name: string
    - hp: number
    - resistances: object
      - romance: number
      - persuade: number
      - bribe: number
      - fight: number
      - sneak: number
  - The stage could be a battle with a monster, a puzzle or a negotiation.
  - Names should describe the stage of the encounter. Examples:
    - Battle: "Goblin Horde"
    - Puzzle: "Door without a knob"
    - Negotiation: "Jarl of the Dwarves"
  - HP should be a number between 1 and 100 according to the difficulty of the encounter.
  - Resistances should be a number between -100 and 100 according to the difficulty of the encounter.
  - Resistances should be negative if the character has an advantage against the resistance type.
  - Resistances should be coherent with the stage difficulty and name. For example, a goblin horde should be resistant to sneak and fight, but not to persuade.
`;

export const systemMessageText = `
  ## Role
  You are an invoker.
 
  ## Instructions
  You will be given a stage difficulty and you will generate a stage name and hp.
  
  ## Style Guidelines
  ${styleGuidelines}`;

const systemMessage = new SystemMessage(systemMessageText);

export const promptInvoker = async (input: string) => {
	const stageDifficulty = input;
	const humanMessage = new HumanMessage(
		`The stage difficulty is: ${stageDifficulty}`
	);
	const { content } = await gpt4omini.invoke([systemMessage, humanMessage]);
	return content;
};

export const invokerAgent = createReactAgent({
	llm: gpt4omini,
	tools: [],
	prompt: systemMessageText,
	name: "Invoker",
});
