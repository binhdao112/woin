import test from 'node:test';
import assert from 'node:assert/strict';
const api=()=>import('../dist/checkin-recorder.js');
function fixture({throws=false,empty=false}={}){
 let stopped=0,instance;const stream={getTracks:()=>[{stop(){stopped++;}}]};
 class Recorder{static isTypeSupported(type){return type==='video/webm';}constructor(s,options){if(throws)throw Error('encoder');assert.equal(s,stream);this.mimeType=options.mimeType;this.state='inactive';this.events={};instance=this;}addEventListener(name,fn){this.events[name]=fn;}start(){this.state='recording';}stop(){this.state='inactive';if(!empty)this.events.dataavailable({data:new Blob(['video'],{type:this.mimeType})});this.events.stop();}}
 return {Recorder,canvas:{captureStream(fps){assert.equal(fps,24);return stream;}},stopped:()=>stopped,instance:()=>instance};
}
test('video chooses a supported format and unsupported browsers keep PNG/screen recording as fallback',async()=>{
 const {selectClipFormat,createCheckinRecorder}=await api();assert.equal(selectClipFormat(null),null);assert.equal(selectClipFormat({isTypeSupported:()=>false}),null);assert.equal(selectClipFormat({isTypeSupported:()=>{throw Error('API');}}),null);assert.equal(selectClipFormat({isTypeSupported:t=>t==='video/mp4'}).extension,'mp4');
 assert.equal(createCheckinRecorder({canvas:{},MediaRecorderImpl:null}).start(),false);
});
test('an eight-second clip completes once, with the actual MIME type and every track stopped',async()=>{
 const {createCheckinRecorder}=await api(),f=fixture(),done=[],states=[];
 const rec=createCheckinRecorder({canvas:f.canvas,MediaRecorderImpl:f.Recorder,onComplete:value=>done.push(value),onState:value=>states.push(value)});
 assert.equal(rec.start(),true);assert.equal(rec.start(),false);rec.tick(NaN);rec.tick(-1);rec.tick(4);assert.equal(done.length,0);rec.tick(4);rec.tick(100);
 assert.equal(done.length,1);assert.equal(done[0].extension,'webm');assert.equal(done[0].blob.type,'video/webm');assert.ok(done[0].blob.size>0);assert.equal(f.stopped(),1);assert.equal(rec.busy(),false);assert.ok(states.some(s=>s.status==='recording'&&s.progress===.5));
});
test('closing/cancelling a clip produces no download, frees the stream, and a later recording works',async()=>{
 const {createCheckinRecorder}=await api(),f=fixture(),done=[];const rec=createCheckinRecorder({canvas:f.canvas,MediaRecorderImpl:f.Recorder,onComplete:v=>done.push(v)});
 rec.start();rec.tick(2);rec.cancel();rec.cancel();assert.equal(done.length,0);assert.equal(f.stopped(),1);rec.start();rec.tick(8);assert.equal(done.length,1);assert.equal(f.stopped(),2);
});
test('constructor failures, encoder errors and empty recordings release resources and reset busy state',async()=>{
 const {createCheckinRecorder}=await api();
 for(const options of [{throws:true},{empty:true},{}]){const f=fixture(options),errors=[];const rec=createCheckinRecorder({canvas:f.canvas,MediaRecorderImpl:f.Recorder,onError:e=>errors.push(e)});rec.start();if(!options.throws){if(options.empty)rec.tick(8);else f.instance().events.error({error:Error('lost encoder')});}assert.equal(rec.busy(),false);assert.equal(f.stopped(),1);assert.equal(errors.length,1);}
});

test('MP4 prefers an explicit H264 encoder over the browser default codec for social sharing',async()=>{
 const {selectClipFormat}=await api();const type=selectClipFormat({isTypeSupported:mime=>mime.startsWith('video/mp4')});
 assert.equal(type.extension,'mp4');assert.match(type.mimeType,/avc1/);
});
