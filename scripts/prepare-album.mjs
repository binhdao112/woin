import { readdir, readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAX_ALBUM_PHOTOS, MAX_PHOTO_BYTES } from '../dist/memory-album.js';

export async function prepareAlbum({ sourceDirectory, targetDirectory, title = 'Khoảnh khắc cùng team' }) {
  const entries = (await readdir(sourceDirectory, { withFileTypes: true })).filter(entry => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }));
  if (!entries.length) throw Error('Thư mục chưa có ảnh JPG, PNG hoặc WebP.');
  if (entries.length > MAX_ALBUM_PHOTOS) throw Error(`Hãy chọn tối đa ${MAX_ALBUM_PHOTOS} ảnh cho album.`);
  const images = [];
  for (const entry of entries) {
    const bytes = await readFile(path.join(sourceDirectory, entry.name)), extension = path.extname(entry.name).toLowerCase().replace('.jpeg', '.jpg');
    const valid = extension === '.png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : extension === '.jpg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!valid || bytes.length > MAX_PHOTO_BYTES) throw Error(`Ảnh không hợp lệ hoặc lớn hơn 20 MB: ${entry.name}`);
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16), id = 'team-' + hash;
    if (!images.some(image => image.id === id)) images.push({ id, name: path.basename(entry.name, path.extname(entry.name)).replace(/[_]+/g, ' ').slice(0, 120), src: './photos/photo-' + hash + extension, bytes });
  }
  // Validate every file before changing the published manifest. Original photos
  // stay byte-for-byte intact; decoding/resizing happens in the viewer.
  await mkdir(path.join(targetDirectory, 'photos'), { recursive: true });
  for (const image of images) await writeFile(path.join(targetDirectory, image.src), image.bytes);
  const manifest = { version: 1, title, photos: images.map(({ id, name, src }) => ({ id, name, src })) };
  const temporary = path.join(targetDirectory, '.album.json.tmp');
  await writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n');
  await rename(temporary, path.join(targetDirectory, 'album.json'));
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw Error('Cách dùng: npm run album -- "/đường/dẫn/thư-mục-ảnh" ["Tên album"]');
    const result = await prepareAlbum({ sourceDirectory: path.resolve(process.argv[2]), targetDirectory: fileURLToPath(new URL('../dist/assets/memories/', import.meta.url)), title: process.argv[3] });
    console.log(`Đã chuẩn bị ${result.photos.length} ảnh. Commit dist/assets/memories/ rồi xuất bản lại website.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
