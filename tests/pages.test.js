import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

async function fixture(t, files) {
  const directory = await mkdtemp(path.join(tmpdir(), 'woin-pages-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const [name, contents] of Object.entries(files)) {
    const target = path.join(directory, name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  return directory;
}
async function checker() { return import('../scripts/check-pages.mjs'); }

const site = {
  'index.html': '<link href="./style.css" rel="stylesheet"><script type="module" src="./app.js"></script><a href="?world=cloud">Cloud</a>',
  'style.css': 'body{background:url("./assets/bg.png")}',
  'app.js': 'import { ok } from "./lib.js"; const image = new URL("./assets/bg.png", import.meta.url);',
  'lib.js': 'export const ok = true;',
  'assets/bg.png': Buffer.from([137,80,78,71,13,10,26,10]),
};

test('Pages smoke check follows modules, styles and artwork below a project subpath', async t => {
  const { verifyPages } = await checker();
  const result = await verifyPages(await fixture(t, site));
  assert.equal(result.basePath, '/woin/');
  assert.equal(result.files, 5);
});

test('Pages smoke check rejects links that escape the repository subpath', async t => {
  const { verifyPages } = await checker();
  const directory = await fixture(t, { ...site, 'index.html': '<script type="module" src="/app.js"></script>' });
  await assert.rejects(verifyPages(directory), /outside.*\/woin\//i);
});

test('Pages smoke check catches missing and case-mismatched module files', async t => {
  const { verifyPages } = await checker();
  const directory = await fixture(t, { ...site, 'app.js': 'import "./LIB.js";' });
  await assert.rejects(verifyPages(directory), /LIB\.js.*404/);
});

test('Pages smoke check validates the actual dist artifact including floral artwork', async () => {
  const { verifyPages } = await checker();
  const result = await verifyPages(new URL('../dist/', import.meta.url));
  assert.ok(result.files >= 12);
});


test('Pages smoke check follows host album images and catches a missing shared photo', async t => {
  const { verifyPages } = await checker();
  const directory = await fixture(t, { ...site, 'app.js': 'new URL("./assets/memories/album.json", import.meta.url)', 'assets/memories/album.json': JSON.stringify({photos:[{src:"./missing.png",name:"Team"}]}) });
  await assert.rejects(verifyPages(directory), /missing\.png.*404/);
});
