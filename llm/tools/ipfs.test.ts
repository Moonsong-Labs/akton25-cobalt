import { describe, expect, test } from "bun:test";
import { upload_image_to_ipfs, upload_json_to_ipfs } from "./ipfs";
import "dotenv/config";

const gatewayUrl =
	`https://${process.env.GATEWAY_URL}/ipfs/` ||
	"https://gateway.pinata.cloud/ipfs/";

describe("IPFS Upload", () => {
	test("should upload content successfully", async () => {
		// upload json content
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

		// test by fetching the content from IPFS
		const response = await fetch(`${gatewayUrl}${upload.cid}`);
		const data = await response.json();
		expect(data).toEqual(content);
	});

	test("should upload image successfully", async () => {
		// read image from assets
		const bunFile = Bun.file("assets/hero.png");
		const arrayBuffer = await bunFile.arrayBuffer();
		const imageFile = new File([arrayBuffer], "hero.png", {
			type: "image/png",
		});
		const upload = await upload_image_to_ipfs(imageFile);
		expect(upload.id).toBeDefined();

		// test by fetching the content from IPFS
		const response = await fetch(`${gatewayUrl}${upload.cid}`);
		const data = await response.arrayBuffer();
		expect(data).toEqual(await imageFile.arrayBuffer());
	});
});
