import { describe, test, expect } from "bun:test";
import { upload_json_to_ipfs, upload_image_to_ipfs } from "./ipfs";

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

        const upload = await upload_json_to_ipfs(name, content);

        expect(upload.id).toBeDefined();
    });

    test("should upload image successfully", async () => {
        // read image from assets
        const bunFile = Bun.file("assets/hero.png");
        const arrayBuffer = await bunFile.arrayBuffer();
        const imageFile = new File([arrayBuffer], "hero.png", { type: "image/png" });

        const upload = await upload_image_to_ipfs(imageFile);

        expect(upload.id).toBeDefined();
    });
});
