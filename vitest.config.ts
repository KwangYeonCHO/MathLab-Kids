import fs from 'fs';
import { defineConfig } from 'vitest/config';
import path from 'path';

// Windows 네트워크/가상 드라이브(RaiDrive/Dokan) 상에서 fs.realpathSync.native ENOENT 버그 방지
if (process.platform === 'win32') {
  try {
    fs.realpathSync.native = fs.realpathSync;
  } catch {}
}

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
