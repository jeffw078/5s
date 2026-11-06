import { scrypt,randomBytes,createHash,timingSafeEqual } from 'node:crypto';
import { AppError } from './domain';
export function validatePassword(password:string){
  if(password.length<12||password.length>128||!/[a-zA-Z]/.test(password)||!/[0-9]/.test(password))throw new AppError('Use de 12 a 128 caracteres, incluindo letras e números.');
}
const derive=(p:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(p,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024},(err,b)=>err?reject(err):resolve(b)));
export async function hashPassword(password:string){validatePassword(password);const salt=randomBytes(24).toString('hex');return `scrypt$${salt}$${(await derive(password,salt)).toString('hex')}`;}
export async function verifyPassword(password:string,encoded:string){
  if(password.length>128)return false;
  const [algorithm,salt,hash]=encoded.split('$');
  if(algorithm!=='scrypt'||!salt||!/^[a-f0-9]{128}$/.test(hash??''))return false;
  try{return timingSafeEqual(await derive(password,salt),Buffer.from(hash,'hex'));}catch{return false;}
}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export const randomToken=()=>randomBytes(32).toString('base64url');
