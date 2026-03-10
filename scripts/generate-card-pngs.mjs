import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = path.join(process.cwd(), 'img/jeux52cartes');
const targetDir = path.join(process.cwd(), 'public/cards');
const targetWidth = 213;
const targetHeight = 288;

await fs.promises.mkdir(targetDir, { recursive: true });

const files = (await fs.promises.readdir(sourceDir))
  .filter((file) => file.endsWith('.gif'))
  .sort();

for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file.replace(/\.gif$/i, '.png'));

  await sharp(sourcePath, { animated: false })
    .resize(targetWidth, targetHeight, {
      fit: 'fill',
      kernel: sharp.kernel.nearest
    })
    .png()
    .toFile(targetPath);
}

console.log(`Generated ${files.length} PNG cards in ${targetDir}`);
