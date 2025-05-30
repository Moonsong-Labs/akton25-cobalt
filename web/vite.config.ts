import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import { defineConfig } from "vite";
import type { UserConfig } from "vite";

const config: UserConfig = {
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        typescript: true,
      }),
    }),
  ],
};

export default defineConfig(config);
