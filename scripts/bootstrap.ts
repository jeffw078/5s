import { loadEnvConfig } from '@next/env';
import { randomUUID } from 'node:crypto';
import { getDatabase,closeDatabase } from '../lib/db';
import { hashPassword } from '../lib/security';
loadEnvConfig(process.cwd());
async function main(){
  const email=(process.env.MASTER_EMAIL??'jeffersonw078@gmail.com').toLowerCase().trim();
  if(!process.env.MASTER_TEMP_PASSWORD)throw new Error('MASTER_TEMP_PASSWORD obrigatória: 12+ caracteres, letras e números.');
  const hash=await hashPassword(process.env.MASTER_TEMP_PASSWORD);
  const {rows}=await getDatabase().query("INSERT INTO sm5s.users(id,email,name,role,password_hash,temporary_expires_at) VALUES($1,$2,'Jefferson Willian','MASTER',$3,now()+interval '72 hours') ON CONFLICT(email) DO NOTHING RETURNING id",[randomUUID(),email,hash]);
  console.log(rows.length?'Master criado. Senha temporária expira em 72h e exige troca no primeiro acesso.':'E-mail já cadastrado; nenhuma senha foi alterada.');
}
main().catch(e=>{console.error('Bootstrap não concluído:',e.code??e.message?.replace(/postgres(?:ql)?:\/\/\S+/g,'[REDACTED]'));process.exitCode=1;}).finally(closeDatabase);
