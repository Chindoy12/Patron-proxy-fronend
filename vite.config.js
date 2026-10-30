import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { devGatewayPlugin } from './server/devGatewayPlugin.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), devGatewayPlugin(env)],
  };
});
