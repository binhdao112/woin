import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64');
async function dirs(t){const root=await mkdtemp(path.join(tmpdir(),'woin-host-album-'));t.after(()=>rm(root,{recursive:true,force:true}));const input=path.join(root,'input'),output=path.join(root,'output');await mkdir(input);await mkdir(output);return {input,output};}

test('host import creates a deployable manifest with stable safe paths and original captions',async t=>{
 const {prepareAlbum}=await import('../scripts/prepare-album.mjs');const {input,output}=await dirs(t);
 await writeFile(path.join(input,'01 Cả team.png'),png);await writeFile(path.join(input,'notes.txt'),'not a photo');
 const first=await prepareAlbum({sourceDirectory:input,targetDirectory:output,title:'Khoảnh khắc của team'});
 const second=await prepareAlbum({sourceDirectory:input,targetDirectory:output,title:'Khoảnh khắc của team'});
 assert.equal(first.photos.length,1);assert.equal(first.photos[0].name,'01 Cả team');assert.deepEqual(first,second);
 assert.match(first.photos[0].src,/^\.\/photos\/[a-z0-9-]+\.png$/);
 assert.deepEqual(await readFile(path.join(output,first.photos[0].src)),png);
 assert.deepEqual(JSON.parse(await readFile(path.join(output,'album.json'),'utf8')),first);
});

test('invalid photos leave the previous host manifest unchanged',async t=>{
 const {prepareAlbum}=await import('../scripts/prepare-album.mjs');const {input,output}=await dirs(t);
 await writeFile(path.join(output,'album.json'),'previous');await writeFile(path.join(input,'bad.png'),'not a PNG');
 await assert.rejects(prepareAlbum({sourceDirectory:input,targetDirectory:output}),/ảnh|image|PNG/i);
 assert.equal(await readFile(path.join(output,'album.json'),'utf8'),'previous');
});
