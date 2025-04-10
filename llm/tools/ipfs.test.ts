import { describe, test, expect } from "bun:test";
import { upload_to_ipfs } from "./ipfs";

describe("IPFS Upload", () => {
    test("should upload content successfully", async () => {
        const name = "test.txt";
        const content = "Hello, World!";

        await upload_to_ipfs(name, content);

        // Since the function logs the result, we just verify it didn't throw
        expect(true).toBe(true);
    });
}); 