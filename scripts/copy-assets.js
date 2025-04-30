// scripts/copy-assets.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function copyFiles() {
  const sourceDir = path.resolve(__dirname, '../src');
  const destDir = path.resolve(__dirname, '../dist');

  try {
    // Копируем стили
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(
      path.join(sourceDir, 'style.css'),
      path.join(destDir, 'style.css')
    );
    console.log('CSS files copied successfully!');

    // Копируем все .d.ts файлы
    const dtsFiles = await fs.readdir(sourceDir);
    for (const file of dtsFiles) {
      if (file.endsWith('.d.ts')) {
        await fs.copyFile(
          path.join(sourceDir, file),
          path.join(destDir, file)
        );
      }
    }
    if (dtsFiles.length) console.log('.d.ts files copied successfully!');
  } catch (err) {
    console.error('Error copying CSS:', err);
  }
}

copyFiles();
