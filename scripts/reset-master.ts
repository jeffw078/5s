import { loadEnvConfig } from '@next/env';
import { getDatabase,closeDatabase } from '../lib/db';
import { hashPassword } from '../lib/security';
loadEnvConfig(process.cwd());
async function main(){
  if(!process.env.MASTER_TEMP_PASSWORD)throw new Error('Defina MASTER_TEMP_PASSWORD com uma senha temporária nova.');
  const hash=await hashPassword(process.env.MASTER_TEMP_PASSWORD);
  await getDatabase().transaction(async q=>{
    const {rows}=await q.query("UPDATE sm5s.users SET password_hash=$2,must_change_password=true,temporary_expires_at=now()+interval '72 hours',active=true,auth_version=auth_version+1 WHERE email=$1 AND role='MASTER' RETURNING id",[(process.env.MASTER_EMAIL??'jeffersonw078@gmail.com').toLowerCase(),hash]);
    if(!rows[0])throw new Error('Master não encontrado. Execute db:bootstrap para criar o acesso inicial.');
    await q.query('DELETE FROM sm5s.sessions WHERE user_id=$1',[rows[0].id]);
  });
  console.log('Master redefinido. Sessões revogadas; nova senha temporária expira em 72h e exige troca.');
}
main().catch(e=>{console.error('Recuperação não concluída:',e.code??e.message);process.exitCode=1;}).finally(closeDatabase);
