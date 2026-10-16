export const SHARED_ALBUM_URL = new URL('./assets/memories/album.json', import.meta.url);
export const MAX_ALBUM_PHOTOS = 24;
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

export function normaliseSharedAlbum(data, manifestURL) {
  if (!data || !Array.isArray(data.photos)) throw new Error('Album cần có danh sách photos.');
  const base = new URL('.', manifestURL), photos = [], issues = [], ids = new Set();
  for (const item of data.photos.slice(0, MAX_ALBUM_PHOTOS)) {
    try {
      if (!item || typeof item.src !== 'string' || !item.src || item.src.length > 240) throw Error();
      if (/^(?:[a-z]+:|\/)/i.test(item.src) || /[?#\\]/.test(item.src)) throw Error();
      const url = new URL(item.src, base), pathname = decodeURIComponent(url.pathname);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== base.origin || !pathname.startsWith(decodeURIComponent(base.pathname))) throw Error();
      if (pathname.split('/').some(part => part === '..') || !/\.(?:jpe?g|png|webp)$/i.test(pathname)) throw Error();
      const id = typeof item.id === 'string' && item.id ? item.id.slice(0, 160) : 'shared:' + item.src;
      if (ids.has(id)) throw Error();
      ids.add(id);
      photos.push({ id, name: String(item.name || 'Khoảnh khắc cùng team').trim().slice(0, 120), url: url.href });
    } catch { issues.push('Một ảnh trong album có đường dẫn hoặc mã ảnh không hợp lệ.'); }
  }
  if (data.photos.length > MAX_ALBUM_PHOTOS) issues.push(`Album chỉ hiển thị tối đa ${MAX_ALBUM_PHOTOS} ảnh.`);
  return { title: String(data.title || 'Album của team').slice(0, 100), photos, issues };
}

export async function loadSharedAlbum({ manifestURL = SHARED_ALBUM_URL, fetchImpl = fetch, decode, timeoutMs = 10000 } = {}) {
  async function request(url, kind) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { signal: controller.signal, cache: kind === 'json' ? 'no-cache' : 'default' });
      if (!response.ok) throw Error('Không tải được album hoặc ảnh.');
      if (kind === 'json') return await response.json();
      const blob = await response.blob();
      if (!blob.size || blob.size > MAX_PHOTO_BYTES || !['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) throw Error('Ảnh không hợp lệ hoặc lớn hơn 20 MB.');
      return blob;
    } finally { clearTimeout(timer); }
  }
  try {
    const album = normaliseSharedAlbum(await request(manifestURL, 'json'), manifestURL), photos = [];
    // Limit concurrent decoding/network requests on mobile devices.
    for (let start = 0; start < album.photos.length; start += 3) {
      const group = await Promise.all(album.photos.slice(start, start + 3).map(async photo => {
        try { return { ...photo, canvas: await decode(await request(photo.url, 'blob')), source: 'shared' }; }
        catch { album.issues.push('Có ảnh của team chưa tải được. Những ảnh còn lại vẫn xem được.'); return null; }
      }));
      photos.push(...group.filter(Boolean));
    }
    return { title: album.title, photos, issues: album.issues };
  } catch { return { title: 'Album của team', photos: [], issues: ['Chưa tải được album của team. Bạn vẫn có thể chọn ảnh riêng.'] }; }
}

export function findMemoryPhoto(photos, gift, fallbackIndex) {
  if (gift?.photoId) return photos.find(photo => photo.id === gift.photoId);
  if (gift?.photoName) return photos.find(photo => photo.name === gift.photoName);
  return photos[fallbackIndex];
}
