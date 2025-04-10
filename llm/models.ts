import assert from "node:assert";
import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";

const KLUSTER_API_KEY = process.env.KLUSTER_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
assert(GOOGLE_API_KEY, "GOOGLE_API_KEY is not set");
assert(KLUSTER_API_KEY, "KLUSTER_API_KEY is not set");
assert(MISTRAL_API_KEY, "MISTRAL_API_KEY is not set");

export const gpt4omini = new ChatOpenAI({
	model: "gpt-4o-mini-2024-07-18",
	temperature: 0,
});

export const llama31withTools = new ChatOpenAI({
	model: "klusterai/Meta-Llama-3.1-405B-Instruct-Turbo", // tools supported
	configuration: {
		baseURL: "https://api.kluster.ai/v1",
	},
	apiKey: KLUSTER_API_KEY,
});

export const llama4Maverick = new ChatOpenAI({
	model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8", // tools supported
	configuration: {
		baseURL: "https://api.kluster.ai/v1",
	},
	apiKey: KLUSTER_API_KEY,
});

export const deepSeekV3 = new ChatOpenAI({
	model: "deepseek-ai/DeepSeek-V3", // tools supported
	configuration: {
		baseURL: "https://api.kluster.ai/v1",
	},
	apiKey: KLUSTER_API_KEY,
});

export const geminiFlash = new ChatGoogleGenerativeAI({
	model: "gemini-2.0-flash",
	temperature: 0.7,
});

export const googleAi = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

export const mistralSmall = new ChatMistralAI({
	apiKey: MISTRAL_API_KEY,
	model: "mistral-small-latest",
	temperature: 0.7,
});
