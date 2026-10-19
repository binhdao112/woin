export async function decodeCheckinPhoto(file,{bitmap=(...args)=>createImageBitmap(...args),canvas=()=>document.createElement('canvas')}={}){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||!file.size||file.size>20*1024*1024)throw Error('Chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 20 MB nhé.');
 const image=await bitmap(file,{imageOrientation:'from-image'});
 try{
  if(!image.width||!image.height)throw Error('Không đọc được kích thước ảnh.');
  const scale=Math.min(1,1600/Math.max(image.width,image.height)),result=canvas();
  result.width=Math.max(1,Math.round(image.width*scale));result.height=Math.max(1,Math.round(image.height*scale));
  result.getContext('2d').drawImage(image,0,0,result.width,result.height);return result;
 }finally{image.close();}
}

export function createCheckinPhotoPicker({decode=decodeCheckinPhoto,onPhoto,onState}){
 let active=false,version=0,busy=false;
 function state(message=''){onState({busy,message});}
 function reset(){version++;busy=false;state();}
 return {open(){active=true;reset();},close(){active=false;reset();},reset,busy:()=>busy,
  async select(file){
   if(!file||!active)return false;const request=++version;busy=true;state('Đang chuẩn bị ảnh riêng…');
   try{const photo=await decode(file);if(!active||request!==version)return false;onPhoto(photo);busy=false;state('Ảnh riêng đã sẵn sàng · Tải PNG hoặc chụp check-in nhé.');return true;}
   catch(error){if(active&&request===version){busy=false;state(error.message||'Không đọc được ảnh. Hãy thử ảnh khác.');}return false;}
  }
 };
}
