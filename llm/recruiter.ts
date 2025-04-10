import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { gpt4omini } from "./models";

const systemMessage = new SystemMessage(
	"You are an expert Dungeons & Dragons style hero creator." +
		"You task is to create fun and interesting heros for people to play with.",
);

export const promptRecruiter = async (input: string) => {
	const humanMessage = new HumanMessage(`The events as known are: ${input}`);
	const { content } = await gpt4omini.invoke([systemMessage, humanMessage]);
	return content;
};
