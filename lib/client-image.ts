export async function preparePhoto(file:File):Promise<Blob>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Selecione uma imagem JPEG, PNG ou WebP.');
  if(file.size>20_000_000)throw new Error('A foto original deve ter até 20 MB.');
  const bitmap=await createImageBitmap(file);
  try{
    if(bitmap.width*bitmap.height>40_000_000)throw new Error('A resolução da imagem é muito grande.');
    const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Não foi possível processar a imagem neste navegador.');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    for(const quality of [0.78,0.62,0.46,0.3]){
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));
      if(blob&&blob.size<=460800)return blob;
    }
    throw new Error('A foto não pôde ser compactada. Selecione uma imagem menor.');
  }finally{bitmap.close();}
}
