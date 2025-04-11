import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { gpt4omini } from "./models";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

// TODO: Add schema to the tool
const stageSchema = z.object({
  name: z.string(),
  description: z.string(),
  hp: z.number().min(1).max(100),
  resistances: z
    .object({
      romance: z.number().min(-100).max(100),
      persuade: z.number().min(-100).max(100),
      bribe: z.number().min(-100).max(100),
      fight: z.number().min(-100).max(100),
      sneak: z.number().min(-100).max(100),
    })
    .describe("Resistances are percentages between -100% and 100%."),
});

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
  You will be given a stage difficulty and you will generate a stage description, name, hp and resistances.
  
  ## Style Guidelines
  ${styleGuidelines}`;

const systemMessage = new SystemMessage(systemMessageText);

export const promptInvoker = async (input: string) => {
  const humanMessage = new HumanMessage(`The stage difficulty is: ${input}`);
  const { content } = await gpt4omini.invoke([systemMessage, humanMessage]);
  return content;
};

export const invokerAgent = createReactAgent({
  llm: gpt4omini,
  tools: [],
  prompt: systemMessageText,
  name: "Invoker",
});
