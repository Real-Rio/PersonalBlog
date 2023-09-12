import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import remarkMermaid from 'astro-diagram/remark-mermaid';

// https://astro.build/config
import preact from "@astrojs/preact";

// https://astro.build/config
import svelte from "@astrojs/svelte";

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  site: 'https://rioblog.fun',
  integrations: [mdx(), sitemap(), tailwind(), preact(), svelte()],
  markdown: {
    remarkPlugins: [remarkMermaid]
  }
});