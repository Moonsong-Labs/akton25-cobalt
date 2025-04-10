import { describe, test, expect } from "bun:test";
import { upload_to_ipfs } from "./ipfs";

describe("IPFS Upload", () => {
  test("should upload content successfully", async () => {
    const name = "hero.json";
    const content = {
      name: "Hero",
      description: "Hero is a hero",
      image: "https://example.com/hero.png",
      attributes: [
        {
          attack: "Hero",
          value: "Hero",
        },
      ],
    };

    const upload = await upload_to_ipfs(name, content);

    expect(upload.id).toBeDefined();
  });
});
