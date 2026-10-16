import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const campusURL = new URL('../dist/campus.js', import.meta.url);

// A missing module is the intended RED: this is a new, runnable Three.js scene.
async function campus() { return import(campusURL.href); }

test('the campus has eight reachable outdoor destinations and a connected walking route', async () => {
  const { CAMPUS_STOPS, getCampusRoute } = await campus();
  assert.equal(CAMPUS_STOPS.length, 8);
  for (const point of CAMPUS_STOPS) {
    assert.equal(point.length, 3);
    assert.equal(point[1], 0);
    assert.ok(point.every(Number.isFinite));
  }
  for (const [from, to] of [[0, 7], [7, 0], [2, 5], [4, 4]]) {
    const route = getCampusRoute(from, to);
    assert.deepEqual(route.at(-1), CAMPUS_STOPS[to]);
    assert.equal(route.length, Math.max(1, Math.abs(to - from)));
    for (const point of route) assert.ok(CAMPUS_STOPS.some(stop => stop.every((v, i) => v === point[i])));
  }
  for (const invalid of [-1, 8, 1.2, NaN, '2']) assert.deepEqual(getCampusRoute(invalid, 1), []);
});

test('a real scene exposes selectable numbered destinations and collection-based progress', async () => {
  const { createCampus } = await campus();
  const view = createCampus();
  assert.ok(view.group.isGroup);
  assert.equal(view.clickables.length, 8);
  assert.deepEqual(view.clickables.map(item => item.userData.stop), [0,1,2,3,4,5,6,7]);
  view.updateProgress(new Map(), 0);
  assert.deepEqual(view.markers.map(marker => marker.userData.state), ['active','locked','locked','locked','locked','locked','locked','locked']);
  view.updateProgress(new Map([[0, {}], [1, {}]]), 1);
  assert.deepEqual(view.markers.map(marker => marker.userData.state), ['collected','active','available','locked','locked','locked','locked','locked']);
  view.updateProgress(new Map(Array.from({length:7},(_, i)=>[i, {}])), 7);
  assert.deepEqual(view.markers.map(marker => marker.userData.state), [...Array(7).fill('collected'), 'active']);
  let meshCount = 0;
  view.group.traverse(node => { if (node.isMesh) { meshCount++; assert.ok(node.geometry); } });
  assert.ok(meshCount > 40, 'the preview contains actual architecture and landscape geometry');
});

test('campus navigation is the default and the existing cloud world stays selectable', async () => {
  const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(app, /from ['"]\.\/campus\.js['"]/);
  assert.match(app, /getCampusRoute\(index,\s*i\)/, 'walking follows the campus route rather than crossing buildings');
  assert.match(html, /href="\?world=campus"/);
  assert.match(html, /href="\?world=cloud"/);
});
