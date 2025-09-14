import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless'; // o 'edge' si prefieres

export default defineConfig({
  output: 'server',            // <- necesario para endpoints dinámicos (POST)
  adapter: vercel(),           // <- crea las Serverless Functions en Vercel
});
