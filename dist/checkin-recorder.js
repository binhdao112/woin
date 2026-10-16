const formats=[{mimeType:'video/mp4',extension:'mp4'},{mimeType:'video/webm;codecs=vp9',extension:'webm'},{mimeType:'video/webm;codecs=vp8',extension:'webm'},{mimeType:'video/webm',extension:'webm'}];
export function selectClipFormat(Recorder){for(const type of formats){try{if(Recorder?.isTypeSupported?.(type.mimeType))return {...type};}catch{}}return null;}
export function createCheckinRecorder({canvas,MediaRecorderImpl=globalThis.MediaRecorder,onComplete=()=>{},onError=()=>{},onState=()=>{}}){
 let session=null;
 function release(s){if(s.released)return;s.released=true;s.stream?.getTracks().forEach(track=>track.stop());}
 function cancel(){if(!session)return;const s=session;session=null;s.cancelled=true;try{if(s.recorder?.state==='recording')s.recorder.stop();}catch{}release(s);onState({status:'idle',progress:0});}
 function fail(s,error){if(session!==s)return;cancel();onError(error||Error('Không tạo được video.'));}
 return {busy:()=>!!session,cancel,start(){
  if(session)return false;const format=selectClipFormat(MediaRecorderImpl);if(!format||typeof canvas?.captureStream!=='function')return false;
  const s={...format,elapsed:0,chunks:[],cancelled:false,released:false};session=s;
  try{s.stream=canvas.captureStream(24);s.recorder=new MediaRecorderImpl(s.stream,{mimeType:format.mimeType,videoBitsPerSecond:4500000});
   s.recorder.addEventListener('dataavailable',event=>{if(!s.cancelled&&event.data?.size)s.chunks.push(event.data);});
   s.recorder.addEventListener('error',event=>fail(s,event.error));
   s.recorder.addEventListener('stop',()=>{release(s);if(session!==s||s.cancelled)return;session=null;const mimeType=s.recorder.mimeType||s.mimeType,blob=new Blob(s.chunks,{type:mimeType});onState({status:'idle',progress:1});if(blob.size)onComplete({blob,mimeType,extension:mimeType.includes('mp4')?'mp4':'webm'});else onError(Error('Video chưa có hình ảnh.'));});
   s.recorder.start();onState({status:'recording',progress:0});return true;
  }catch(error){fail(s,error);return false;}
 },tick(dt){if(!session||session.finishing||!Number.isFinite(dt)||dt<=0)return;const s=session;s.elapsed=Math.min(8,s.elapsed+dt);onState({status:'recording',progress:s.elapsed/8});if(s.elapsed>=8){s.finishing=true;onState({status:'finishing',progress:1});try{s.recorder.stop();}catch(error){fail(s,error);}}}};
}
