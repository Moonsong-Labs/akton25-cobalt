import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { type AIMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

// https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/#customizing-agent-behavior
const tools = [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

const model = new ChatOpenAI({
	model: "gpt-4o-mini",
	temperature: 0,
});
// .bindTools(tools)

// const {content}=await model.invoke("hello!")
// console.log(content)
