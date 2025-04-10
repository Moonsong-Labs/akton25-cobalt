import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { gpt4omini } from "./models";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const styleGuidelines = `
  - Output should be a JSON with three stages. Each stage should have the following fields:
    - stage: number
    - name: string
    - description: string
    - hp: number
    - resistances: object
      - romance: number
      - persuade: number
      - bribe: number
      - fight: number
      - sneak: number
    - stats: object
      - str: number
      - dex: number
      - will: number
      - int: number
      - cha: number
      - con: number
  - The stage could be a battle with a monster, a puzzle or a negotiation.
  - Each stage should be harder than the previous one.
  - Names should describe the stage of the encounter. Examples:
    - Battle: "Goblin Horde"
    - Puzzle: "Door without a knob"
    - Negotiation: "Travelling merchant"
  - HP should be a number between 1 and 100 according to the difficulty and content of the stage.
  - Resistances should follow the following rules:
    - Resistances should be between -100% and 100%.
    - Resistances should be negative if the character has an advantage against the resistance type.
    - Resistances should be coherent with the stage difficulty and name. For example, a goblin horde should be resistant to sneak and fight, but not to persuade.
  - Stats should be a number between 0 and 10 according to the difficulty and content of the stage.
`;

export const systemMessageText = `
  ## Role
  You are an invoker.
 
  ## Instructions
  You will be given a scenario description and you will generate three consecutive stages in that scenario.
  The stages should be coherent with the scenario description and the style guidelines.
  
  ## Style Guidelines
  ${styleGuidelines}`;

const systemMessage = new SystemMessage(systemMessageText);

export const promptInvoker = async (input: string) => {
  const scenarioDescription = input;
  const humanMessage = new HumanMessage(
    `The scenario description is: ${scenarioDescription}`
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
