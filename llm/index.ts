import { say } from "cfonts";
import { select } from "@inquirer/prompts";

export type AGENTS = "necromancer"| "storyteller" | "recruiter" | "invoker"

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
    ],
  });
  
  switch (answer){
    case "necromancer" :{
      
      
      break
    }
    case "storyteller" :{
      break
    }
    case "recruiter" :{
      break
    }
    case "invoker" :{
      break
    }
    
    default: throw new Error("Invalid Choice!")
    
  }
}

main();
