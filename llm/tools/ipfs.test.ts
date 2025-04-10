import { describe, test, expect } from "bun:test";
import { upload_to_ipfs } from "./ipfs";

describe("IPFS Upload", () => {
    test("should upload content successfully", async () => {
        const name = "test.txt";
        const content = "Hello, World!";

        const upload = await upload_to_ipfs(name, content);

        expect(upload.id).toBeDefined();
    });
});
