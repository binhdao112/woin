import * as T from './three.module.js';
import { canVisitStation } from './journey.js';

// An illustrated campus, inspired by public exterior photographs; not a floor plan.
export const CAMPUS_STOPS = Object.freeze([
  [-11, 0, 6], [-5, 0, 2], [0, 0, -3], [7, 0, -2],
  [11, 0, 4], [6, 0, 8], [0, 0, 9], [-5, 0, 8],
].map(point => Object.freeze(point)));

export function getCampusRoute(from, to) {
  if (![from, to].every(n => Number.isInteger(n) && n >= 0 && n < CAMPUS_STOPS.length)) return [];
  if (from === to) return [CAMPUS_STOPS[to].slice()];
  const step = Math.sign(to - from), route = [];
  for (let i = from + step; i !== to + step; i += step) route.push(CAMPUS_STOPS[i].slice());
  return route;
}

export function createCampus({ label } = {}) {
  const group = new T.Group();
  group.name = 'VNG Campus · illustrated homebase';
  const palette = {
    white: 0xf5f3e9, trim: 0xffffff, glass: 0x496c75, frame: 0xb2c7c5,
    concrete: 0xd8d8c8, stone: 0xeae4d3, soil: 0xb8c7a0, lawn: 0x93b47f,
    leaf: 0x4d805c, lightLeaf: 0x7da56d, trunk: 0x8b7961, orange: 0xe86b3a,
    solar: 0x344b60, solarLine: 0x6f8c9a, water: 0x75b8b5,
    rose: 0xe4a4ae, butter: 0xf3ca78, purple: 0xb09ac8, dark: 0x3f585a,
  };
  const materials = Object.fromEntries(Object.entries(palette).map(([key, color]) => [key, new T.MeshStandardMaterial({ color, roughness: key === 'glass' ? .25 : .85 })]));
  const boxGeometry = new T.BoxGeometry(1, 1, 1), foliageGeometry = new T.IcosahedronGeometry(1, 1);
  const cylinderGeometry = new T.CylinderGeometry(1, 1, 1, 10);
  const batches = new Map();
  const transform = new T.Object3D();
  function instance(geometry, material, position, scale, rotation = 0) {
    const key = geometry.uuid + material.uuid;
    if (!batches.has(key)) batches.set(key, { geometry, material, transforms: [] });
    transform.position.set(...position); transform.scale.set(...scale); transform.rotation.set(0, rotation, 0); transform.updateMatrix();
    batches.get(key).transforms.push(transform.matrix.clone());
  }
  function box(w, h, d, material, x, y, z, rotation = 0) {
    instance(boxGeometry, materials[material], [x, y, z], [w, h, d], rotation);
  }
  function cylinder(r, h, material, x, y, z) {
    instance(cylinderGeometry, materials[material], [x, y, z], [r, h, r]);
  }
  function tree(x, z, scale = 1) {
    cylinder(.075 * scale, 1.3 * scale, 'trunk', x, .65 * scale, z);
    instance(foliageGeometry, materials.leaf, [x, 1.8 * scale, z], [.65 * scale, .85 * scale, .65 * scale]);
    instance(foliageGeometry, materials.lightLeaf, [x + .18 * scale, 2.15 * scale, z], [.55 * scale, .6 * scale, .5 * scale]);
    cylinder(.65 * scale, .12, 'stone', x, .06, z);
  }
  function sign(text, size, x, y, z, color) {
    if (!label) return;
    const sprite = label(text, size, color);
    sprite.position.set(x, y, z); group.add(sprite);
  }
  function path(a, b, width = 1.15, material = 'stone') {
    const dx = b[0] - a[0], dz = b[2] - a[2], length = Math.hypot(dx, dz);
    box(width, .045, length, material, (a[0] + b[0]) / 2, .025, (a[2] + b[2]) / 2, Math.atan2(dx, dz));
  }
  function bench(x, z, rotation = 0) {
    const local = (dx, y, dz) => [x + dx * Math.cos(rotation) + dz * Math.sin(rotation), y, z - dx * Math.sin(rotation) + dz * Math.cos(rotation)];
    box(1.5, .13, .5, 'trunk', ...local(0, .48, 0), rotation);
    box(1.5, .45, .09, 'trunk', ...local(0, .78, -.22), rotation);
    for (const side of [-.55, .55]) box(.09, .45, .4, 'dark', ...local(side, .22, 0), rotation);
  }
  function planter(x, z, width = 2, y = .3) {
    box(width, .35, .5, 'white', x, y, z);
    box(width - .12, .28, .4, 'leaf', x, y + .25, z);
    for (let i = 0; i < Math.round(width * 2); i++) {
      const dx = -width / 2 + .2 + i * .5;
      instance(foliageGeometry, materials.lightLeaf, [x + dx, y + .48, z], [.22, .25, .25]);
    }
  }
  function office(cx, cz, w, d, h) {
    box(w, h, d, 'white', cx, h / 2, cz);
    // Long shaded glazing strips and projecting white floor plates.
    for (const floor of [0, 1, 2]) {
      const y = .65 + floor * 1.22;
      box(w + .06, .78, d + .04, 'glass', cx, y, cz);
      box(w + .35, .14, d + .35, 'trim', cx, y + .48, cz);
      for (let x = cx - w / 2 + .4; x < cx + w / 2; x += .8) {
        box(.045, .8, .06, 'frame', x, y, cz + d / 2 + .04);
        box(.045, .8, .06, 'frame', x, y, cz - d / 2 - .04);
      }
      for (let z = cz - d / 2 + .4; z < cz + d / 2; z += .8) {
        for (const side of [-1, 1]) box(.06, .8, .045, 'frame', cx + side * (w / 2 + .04), y, z);
      }
    }
    box(w + .45, .25, d + .45, 'trim', cx, h, cz);
    // Parapets and photovoltaic fields give the roof its recognizable silhouette.
    for (const side of [-1, 1]) {
      box(w + .4, .45, .13, 'white', cx, h + .28, cz + side * d / 2);
      box(.13, .45, d + .4, 'white', cx + side * w / 2, h + .28, cz);
    }
    for (let x = cx - w / 2 + .9; x < cx + w / 2 - .4; x += 1.05) {
      for (let z = cz - d / 2 + .9; z < cz + d / 2 - .5; z += 1.55) {
        box(.9, .055, 1.35, 'solar', x, h + .18, z);
        box(.035, .065, 1.35, 'solarLine', x, h + .19, z);
        box(.9, .065, .025, 'solarLine', x, h + .19, z);
      }
    }
  }

  // A single landscaped site, with a river promenade and an entry boulevard.
  box(34, .65, 28, 'concrete', 0, -.37, 0);
  box(33.7, .08, 27.7, 'lawn', 0, -.015, 0);
  box(34, .06, 2.1, 'water', 0, -.06, 12.8);
  box(34, .07, .55, 'stone', 0, .015, 11.25);
  box(3, .065, 25, 'concrete', -14.8, .015, -1);
  for (let z = -11; z < 10; z += 2) box(.08, .01, .85, 'butter', -14.8, .055, z);
  // Two low-rise wings frame a large open courtyard.
  office(-10, -4, 7.4, 12, 4.1);
  office(2.5, -8.6, 16.6, 5.8, 4.15);
  box(4.1, .2, 2, 'trim', -4.5, 3, -8.6);
  for (const x of [-5.9, -3.1]) cylinder(.08, 3, 'white', x, 1.5, -8.6);
  // Entry canopy and an orange VNG wordmark on the front office wing.
  box(7.5, .17, 2.1, 'white', -10, 2.5, 3.1);
  for (const x of [-13.3, -6.7]) cylinder(.075, 2.5, 'dark', x, 1.25, 3.9);
  sign('VNG', .9, -10, 3.5, 2.45, '#db572b');
  sign('CAMPUS', .22, -10, 2.85, 2.45, '#3b585c');
  // Green steps/terraces peel away from the east wing, facing the garden.
  for (let tier = 0; tier < 5; tier++) {
    const z = -5.2 + tier * .7, h = 2.8 - tier * .48;
    box(8.4, h, .72, 'concrete', 5.8, h / 2, z);
    box(8.4, .1, .68, 'white', 5.8, h + .04, z);
    for (const x of [2.1, 9.5]) planter(x, z, .8, h + .2);
  }
  // The connecting spine never crosses an office volume.
  for (let i = 0; i < CAMPUS_STOPS.length - 1; i++) path(CAMPUS_STOPS[i], CAMPUS_STOPS[i + 1]);
  path(CAMPUS_STOPS[7], CAMPUS_STOPS[0]);
  for (let i = 0; i < 4; i++) box(2.6, .1, .25, 'white', -11, .05, 4.2 + i * .4);
  // Café and striped terrace, under a light pergola.
  box(2.7, .9, .8, 'trunk', -4.5, .45, .3);
  box(2.9, .12, 1, 'white', -4.5, .97, .3);
  box(.55, .5, .5, 'dark', -4, 1.27, .3);
  for (let i = 0; i < 3; i++) cylinder(.11, .2, 'white', -5.4 + i * .35, 1.13, .65);
  for (const x of [-6.2, -2.8]) cylinder(.055, 2.5, 'dark', x, 1.25, -.4);
  for (let i = 0; i < 8; i++) box(.44, .08, 2, i % 2 ? 'white' : 'rose', -6 + i * .44, 2.55, .1);
  // Round communal idea table and trees in the courtyard.
  cylinder(1.1, .1, 'white', -.1, .75, -4.5); cylinder(.12, .75, 'dark', -.1, .37, -4.5);
  for (const [x, z] of [[-1.3, -4.5], [1.1, -4.5]]) cylinder(.25, .45, 'trunk', x, .23, z);
  tree(-2.5, -3.3, .85); tree(1.3, -1, .8); tree(-1.7, -.6, .6);
  // Wellbeing garden and reflecting pool.
  box(3, .08, 2.5, 'stone', 12, .05, 1);
  box(2.6, .08, 2.1, 'water', 12, .1, 1);
  bench(12.2, 6, -.4); tree(13.2, 3.6, .9); tree(9.4, 5.7, .7);
  // A cheerful gratitude mailbox and open-air photo exhibition.
  cylinder(.09, .7, 'dark', 6, .35, 6.9); box(.85, .75, .55, 'orange', 6, 1.04, 6.9);
  box(.48, .05, .03, 'dark', 6, 1.12, 7.19);
  for (let i = 0; i < 3; i++) {
    const x = -1.5 + i * 1.5;
    box(1.05, 1.25, .08, 'white', x, 1.45, 10.2);
    box(.85, .8, .03, i % 2 ? 'rose' : 'purple', x, 1.55, 10.26);
    cylinder(.035, 1, 'dark', x, .5, 10.2);
  }
  // The final check-in garden: a sculptural 20/10 arch, flowers and celebration.
  for (const x of [-6.3, -3.7]) cylinder(.065, 2.2, 'orange', x, 1.1, 9.6);
  const arch = new T.Mesh(new T.TorusGeometry(1.3, .065, 8, 32, Math.PI), materials.orange);
  arch.position.set(-5, 2.2, 9.6); group.add(arch);
  sign('20 / 10', .4, -5, 2.35, 9.8, '#b65e49');
  for (let i = 0; i < 8; i++) {
    const x = -7 + i * .55, z = 10.3 + (i % 2) * .3;
    cylinder(.02, .45, 'leaf', x, .23, z);
    instance(foliageGeometry, materials[i % 2 ? 'rose' : 'butter'], [x, .54, z], [.18, .16, .18]);
  }
  // A few colleagues, conversation corners, and a generous perimeter of trees.
  for (const [x, z, color] of [[-8, 5, 'orange'], [-3.4, 1.6, 'purple'], [3.7, .5, 'rose'], [8, 7, 'butter']]) {
    cylinder(.13, .48, color, x, .45, z);
    instance(foliageGeometry, materials.stone, [x, .85, z], [.17, .17, .17]);
    for (const dx of [-.07, .07]) box(.075, .23, .1, 'dark', x + dx, .12, z);
  }
  for (const [x, z] of [[-16, -10], [-16, -5], [-16, 0], [-16, 7], [-12, 10], [-8.5, 10.5], [5, 10.5], [10, 10.5], [15, 9], [15, -3], [14, -8], [-4, -12.5], [2, -12.5], [9, -12.5]]) tree(x, z, .8);
  for (const [x, z] of [[-2, 4], [4, 4], [8, 1]]) { planter(x, z); bench(x, z + .8); }
  // Instance repeated façade, solar, furniture and tree geometry to keep draw calls low.
  for (const { geometry, material, transforms } of batches.values()) {
    const batch = new T.InstancedMesh(geometry, material, transforms.length);
    transforms.forEach((matrix, index) => batch.setMatrixAt(index, matrix));
    batch.castShadow = true; batch.receiveShadow = true; batch.computeBoundingSphere(); group.add(batch);
  }
  const clickables = [], markers = [];
  CAMPUS_STOPS.forEach((position, index) => {
    const marker = new T.Group(); marker.position.set(...position);
    const material = new T.MeshStandardMaterial({ color: 0xd5d7c7, roughness: .8 });
    const pad = new T.Mesh(new T.CylinderGeometry(.7, .7, .09, 32), material);
    pad.position.y = .09; pad.userData.stop = index; pad.receiveShadow = true; marker.add(pad); clickables.push(pad);
    const ring = new T.Mesh(new T.TorusGeometry(.82, .035, 6, 32), material);
    ring.rotation.x = -Math.PI / 2; ring.position.y = .13; marker.add(ring);
    group.add(marker); markers.push(marker);
    sign(String(index + 1).padStart(2, '0'), .24, position[0], .72, position[2], '#36554f');
  });
  function updateProgress(collection, current) {
    markers.forEach((marker, index) => {
      const state = index === current ? 'active' : collection.has(index) ? 'collected' : canVisitStation(index, collection) ? 'available' : 'locked';
      marker.userData.state = state;
      marker.children[0].material.color.set({ active: 0xf1b05a, collected: 0x6a9f86, available: 0xffdfac, locked: 0xd5d7c7 }[state]);
    });
  }
  return { group, clickables, markers, updateProgress };
}
