import assert from "node:assert";
import { input, select } from "@inquirer/prompts";
import { say } from "cfonts";
import terminalImage from "terminal-image";
import { promptDreamer } from "./dreamer";
import { promptStoryteller } from "./storyteller";

export type AGENTS =
	| "necromancer"
	| "storyteller"
	| "recruiter"
	| "invoker"
	| "dreamer";

async function main() {
	say("COBALT", {
		font: "3d",
		gradient: ["green", "magenta"],
		background: "blackBright",
		env: "node",
	});

	const answer = await select<AGENTS>({
		message: "Choose your agent",
		choices: [
			{
				name: "necromancer",
				value: "necromancer",
				description: "The evil mastermind pulling all the strings.",
			},
			{
				name: "storyteller",
				value: "storyteller",
				description:
					"The true neutral chronicler narrating the plight of heroes.",
			},
			{
				name: "recruiter",
				value: "recruiter",
				description: "The stalwart local recruiting the brave and foolhardy.",
			},
			{
				name: "invoker",
				value: "invoker",
				description:
					"The enigmatic mystic conjuring foes from the great beyond.",
			},
			{
				name: "dreamer",
				value: "dreamer",
				description:
					"The dreamer whose dreams become the reality for the rest of us.",
			},
		],
	});

	const prompt = await input({
		message: "What is your message?",
	});

	switch (answer) {
		case "necromancer": {
			break;
		}

		case "dreamer": {
			const resp = await promptDreamer(prompt);
			const imageBase64 = resp.generatedImages?.[0]?.image?.imageBytes;
			assert(imageBase64, "No image generated!");

			const imageData = Buffer.from(imageBase64, "base64");

			await Bun.write("./dream.png", imageData);
			const imageInTerminal = await terminalImage.buffer(imageData, {
				width: "50%",
			});
			console.log(imageInTerminal);
			break;
		}
		case "storyteller": {
			const resp = await promptStoryteller(prompt);
			console.log(resp);
			break;
		}
		case "recruiter": {
			break;
		}
		case "invoker": {
			break;
		}

		default:
			throw new Error("Invalid Choice!");
	}
}

main();
