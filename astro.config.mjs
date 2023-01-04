/*
 * @Author: Rio
 * @Date: 2022-12-30 21:28:33
 * @LastEditTime: 2023-01-01 20:01:38
 * @FilePath: \Blog\astro-modern-personal-website\astro.config.mjs
 * @Description: 
 */
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import preact from "@astrojs/preact";

// https://astro.build/config
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: 'https://rioblog.fun',
  integrations: [mdx(), sitemap(), tailwind(), preact(), svelte()]
});