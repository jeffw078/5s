import sharp from 'sharp';
import { AppError } from './domain';
export async function compressEvidence(input:Buffer){
  if(!input.length||input.length>2_000_000)throw new AppError('Arquivo ultrapassa o tamanho permitido. Compacte a foto antes de enviar.');
  try{
    const meta=await sharp(input,{limitInputPixels:40_000_000,animated:false}).metadata();
    if(!['jpeg','png','webp'].includes(meta.format??'')||(meta.pages??1)>1)throw new Error('format');
    let data:Buffer=Buffer.alloc(0),width=0,height=0;
    for(const quality of [78,64,48,32]){
      const result=await sharp(input,{limitInputPixels:40_000_000}).rotate().resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality}).toBuffer({resolveWithObject:true});
      data=result.data;width=result.info.width;height=result.info.height;if(data.length<=460800)break;
    }
    if(data.length>460800)throw new AppError('A foto não pôde ser compactada. Envie uma imagem menor.');
    return {data,width,height,mimeType:'image/webp' as const};
  }catch(e){if(e instanceof AppError)throw e;throw new AppError('Envie uma imagem JPEG, PNG ou WebP válida.');}
}
