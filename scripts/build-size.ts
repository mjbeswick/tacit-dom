#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getBuildSizes(): void {
  const distPath = path.join(__dirname, '..', 'dist');

  if (!fs.existsSync(distPath)) {
    console.log('❌ No dist folder found');
    return;
  }

  const files = fs.readdirSync(distPath).filter((f: string) => f.endsWith('.js'));

  if (files.length === 0) {
    console.log('❌ No JavaScript files found in dist folder');
    return;
  }

  console.log('\n📦 Build Complete! File sizes:');
  console.log('─'.repeat(40));

  let totalSize = 0;

  files.forEach((file: string) => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalSize += size;

    console.log(`  ${file.padEnd(25)} ${formatBytes(size).padStart(10)}`);
  });

  console.log('─'.repeat(40));
  console.log(`  Total:${' '.repeat(18)} ${formatBytes(totalSize).padStart(10)}\n`);
}

getBuildSizes();
