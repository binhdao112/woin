import { createServer } from 'node:http';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
};

async function inventory(directory, prefix = '', files = new Map()) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + item.name, absolute = path.join(directory, item.name);
    if (item.isSymbolicLink()) throw new Error(`Pages artifact contains a symbolic link: ${relative}`);
    if (item.isDirectory()) await inventory(absolute, relative + '/', files);
    else files.set(relative, absolute);
  }
  return files;
}

function references(source, extension) {
  const patterns = extension === '.html' ? [/\b(?:src|href)\s*=\s*["']([^"']+)["']/g]
    : ['.js', '.mjs'].includes(extension) ? [
      /\b(?:import|export)\s+(?:[^'";]+?\s+from\s*)?['"]([^'"]+)['"]/g,
      /new\s+URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g,
    ] : extension === '.css' ? [/url\(\s*["']?([^"')\s]+)["']?\s*\)/g] : [];
  return patterns.flatMap(pattern => [...source.matchAll(pattern)].map(match => match[1]));
}

// Serve the exact artifact at a project subpath, even on case-insensitive Macs.
// This catches paths that work at localhost / but break at github.io/woin/.
export async function verifyPages(directory, basePath = '/woin/') {
  const root = directory instanceof URL ? fileURLToPath(directory) : path.resolve(directory);
  const files = await inventory(root);
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const relative = pathname.startsWith(basePath) ? decodeURIComponent(pathname.slice(basePath.length)) || 'index.html' : '';
    const target = files.get(relative);
    if (!target) { response.writeHead(404); response.end('Not found'); return; }
    const extension = path.extname(relative);
    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream' });
    response.end(await readFile(target));
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const queue = [new URL(basePath, origin)], checked = new Set();
  try {
    while (queue.length) {
      const url = queue.shift();
      url.search = ''; url.hash = '';
      if (checked.has(url.href)) continue;
      if (!url.pathname.startsWith(basePath)) throw new Error(`Asset ${url.pathname} is outside project path ${basePath}`);
      checked.add(url.href);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url.pathname} returned HTTP ${response.status}`);
      const extension = url.pathname.endsWith('/') ? '.html' : path.extname(url.pathname);
      if (types[extension] && !response.headers.get('content-type')?.startsWith(types[extension])) throw new Error(`Wrong content type for ${url.pathname}`);
      if (!['.html', '.js', '.mjs', '.css'].includes(extension)) { await response.arrayBuffer(); continue; }
      for (const reference of references(await response.text(), extension)) {
        if (/^(?:https?:|data:|blob:|mailto:|#)/i.test(reference)) continue;
        const linked = new URL(reference, url);
        if (linked.origin === origin) queue.push(linked);
      }
    }
    return { basePath, files: checked.size };
  } finally {
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await verifyPages(new URL('../dist/', import.meta.url));
    console.log(`GitHub Pages smoke check passed: ${result.files} resources at ${result.basePath}`);
  } catch (error) {
    console.error(error.message); process.exitCode = 1;
  }
}
