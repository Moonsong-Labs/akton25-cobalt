import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { heroSchema, rollRandomHeroStats } from "./recruiter";

describe("Recruiter", () => {
	test("roll random hero", async () => {
		const result = rollRandomHeroStats();
		const hero = {
			name: "Random Hero",
			...result,
		};
		expect(heroSchema.safeParse(hero).success).toBe(true);
	});

	test("hero needs name", async () => {
		const result = rollRandomHeroStats();
		const hero = {
			...result,
		};
		expect(heroSchema.safeParse(hero).success).toBe(false);
	});
});
