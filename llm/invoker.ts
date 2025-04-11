import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { gpt4omini } from "./models";

// TODO: Add zod schema to the guidelines
const styleGuidelines = `
  - Output should be a JSON with a stage:
    - name: string
    - description: string
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
    - Negotiation: "Travelling merchant"
  - HP should be a number between 1 and 100 according to the difficulty and content of the stage.
  - Resistances should follow the following rules:
    - Resistances should be between -100% and 100%.
    - Resistances should be negative if the character has an advantage against the resistance type.
    - Resistances should be coherent with the stage difficulty and name. For example, a goblin horde should be resistant to sneak and fight, but not to persuade.
`;

export const systemMessageText = `
  ## Role
  You are an invoker.
 
  ## Instructions
  You will be given a scenario description and difficulty and you will generate a stage hp and resistances.
  - The stage should be coherent with the scenario description and difficulty.
  - Each stage should be different from the others.
  
  ## Style Guidelines
  ${styleGuidelines}`;

const systemMessage = new SystemMessage(systemMessageText);

export const promptInvoker = async (input: string) => {
  const humanMessage = new HumanMessage(
    `The stage name, description and difficulty is: ${input}`
  );
  const { content } = await gpt4omini.invoke([systemMessage, humanMessage]);
  return content;
};

export const invokerAgent = createReactAgent({
  llm: gpt4omini,
  tools: [],
  prompt: systemMessageText,
  name: "Invoker",
  checkpointer: new MemorySaver(),
});
