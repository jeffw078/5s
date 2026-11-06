import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { compressEvidence } from '../lib/images';
test('foto é recodificada, limitada em dimensões e tamanho e perde metadados',async()=>{
  const original=await sharp({create:{width:2200,height:1600,channels:3,background:'#95c11f'}}).jpeg().withMetadata({exif:{IFD0:{Artist:'Original privado'}}}).toBuffer();
  const r=await compressEvidence(original);const meta=await sharp(r.data).metadata();
  assert.equal(r.mimeType,'image/webp');assert.ok(r.data.length<=460800);assert.ok(r.width<=1400&&r.height<=1400);
  assert.equal(meta.exif,undefined);assert.equal(meta.format,'webp');
});
test('anexo com tipo adulterado ou arquivo excessivo é rejeitado',async()=>{
  await assert.rejects(()=>compressEvidence(Buffer.from('<svg onload="alert(1)"></svg>')),/imagem/);
  await assert.rejects(()=>compressEvidence(Buffer.alloc(2_000_001)),/tamanho/);
});
