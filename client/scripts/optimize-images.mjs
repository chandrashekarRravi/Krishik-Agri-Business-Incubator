import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import { promises as fs } from 'fs';
import path from 'path';

const inputDir = path.resolve('public');
const exts = ['.jpg', '.jpeg', '.png', '.svg'];

async function getAllImageFiles(dir) {
  let files = await fs.readdir(dir, { withFileTypes: true });
  let images = [];
  for (let file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      images = images.concat(await getAllImageFiles(res));
    } else if (exts.includes(path.extname(file.name).toLowerCase())) {
      images.push(res);
    }
  }
  return images;
}

async function optimizeImages() {
  const files = await getAllImageFiles(inputDir);
  for (const file of files) {
    const buffer = await fs.readFile(file);
    let plugins = [];
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) plugins.push(imageminMozjpeg({ quality: 75 }));
    if (file.endsWith('.png')) plugins.push(imageminPngquant({ quality: [0.6, 0.8] }));
    if (file.endsWith('.svg')) plugins.push(imageminSvgo());
    if (plugins.length === 0) continue;
    const optimized = await imagemin.buffer(buffer, { plugins });
    if (optimized.length < buffer.length) {
      await fs.writeFile(file, optimized);
      console.log(`Optimized: ${file} (${buffer.length} -> ${optimized.length} bytes)`);
    } else {
      console.log(`No gain: ${file}`);
    }
  }
}

optimizeImages().catch(e => { console.error(e); process.exit(1); }); 