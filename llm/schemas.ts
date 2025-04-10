import { z } from "zod";

export const heroSchema = z.object({
	name: z.string().min(2).max(100).describe("The name of the hero."),
	content: z.object({
    strength: z.number().min(1).max(20).describe("The strength of the hero."),
	dexterity: z.number().min(1).max(20).describe("The dexterity of the hero."),
	constitution: z
		.number()
		.min(1)
		.max(20)
		.describe("The constitution of the hero."),
	intelligence: z
		.number()
		.min(1)
		.max(20)
		.describe("The intelligence of the hero."),
			wisdom: z.number().min(1).max(20).describe("The wisdom of the hero."),
			charisma: z.number().min(1).max(20).describe("The charisma of the hero."),
		})
		.describe("The stats of the hero."),
});

export type Hero = z.infer<typeof heroSchema>; 