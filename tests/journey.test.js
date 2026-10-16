import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
import * as policy from '../dist/journey.js';

test('the main button opens the uncollected gift instead of leaving the first station', () => {
  const calls = [];
  const context = {
    index: 0, arrival: true, moving: false, keepsakeCollection: new Map(),
    getPrimaryAction: policy.getPrimaryAction,
    go: station => calls.push(['move', station]),
    openKeepsake: station => calls.push(['collect', station]),
    openMemories: () => calls.push(['collect', 6]),
    openWish: () => calls.push(['wish']),
    updateUI() {},
    $: () => ({ hidden: false }),
  };
  const start = source.indexOf('function advanceJourney(');
  const advance = start < 0 ? '' : source.slice(start, source.indexOf('\nfunction updateUI', start));
  const handler = source.match(/\$\('#next'\)\.onclick=([\s\S]*?);document\.querySelectorAll/)[1];
  vm.runInNewContext(`${advance}\n(${handler})()`, context);
  assert.deepEqual(calls, [['collect', 0]]);
});

test('progress counts actual souvenirs and finds holes in an older saved journey', () => {
  assert.equal(typeof policy.getJourneyProgress, 'function', 'a single collection-based progress policy is required');
  const progress = policy.getJourneyProgress(new Map([[0, {}], [2, {}], [6, {}], [99, {}]]));
  assert.equal(progress.count, 3);
  assert.equal(progress.firstMissing, 1);
  assert.equal(progress.complete, false);
});

test('every station requires its gift before the following station becomes available', () => {
  assert.equal(typeof policy.canVisitStation, 'function', 'navigation must share the collection policy');
  const gifts = new Map();
  for (let station = 0; station < 7; station++) {
    assert.equal(policy.canVisitStation(station, gifts), true);
    assert.equal(policy.canVisitStation(station + 1, gifts), false);
    assert.deepEqual(policy.getPrimaryAction(station, gifts), { type: 'collect', station });
    gifts.set(station, {});
    assert.equal(policy.canVisitStation(station + 1, gifts), true);
    assert.deepEqual(policy.getPrimaryAction(station, gifts), { type: 'move', station: station + 1 });
  }
  assert.equal(policy.getJourneyProgress(gifts).count, 7);
  assert.equal(policy.getJourneyProgress(gifts).complete, true);
  assert.deepEqual(policy.getPrimaryAction(7, gifts), { type: 'wish' });
});

test('invalid destinations are refused and incomplete older journeys return to their missing gift', () => {
  assert.equal(typeof policy.canVisitStation, 'function');
  for (const station of [-1, 8, 0.5, NaN, '1']) assert.equal(policy.canVisitStation(station, new Map()), false);
  assert.deepEqual(policy.getPrimaryAction(7, new Map([[0, {}], [2, {}]])), { type: 'move', station: 1 });
});
