import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'github-pages',base:'/charlie-card-map/',publicDir:'../public',plugins:[react()],define:{'process.env.NEXT_PUBLIC_ASSET_BASE':JSON.stringify('/charlie-card-map/'),'process.env.NEXT_PUBLIC_API_BASE':JSON.stringify('https://charlie-card-hunt-boston.warmmaple17.chatgpt.site')},build:{outDir:'../dist-pages',emptyOutDir:true}});
