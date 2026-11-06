import { loadEnvConfig } from '@next/env';
import { readFileSync,readdirSync } from 'node:fs';
import { getDatabase,closeDatabase } from '../lib/db';
loadEnvConfig(process.cwd());
async function main(){
  const db=getDatabase();
  await db.transaction(async q=>{for(const name of readdirSync('migrations').filter(n=>n.endsWith('.sql')).sort())await q.query(readFileSync('migrations/'+name,'utf8'));});
  console.log('Migrações aplicadas: schema sm5s. Outros schemas preservados.');
}
main().catch(e=>{console.error('Falha na migração:',e.code??e.name);process.exitCode=1;}).finally(closeDatabase);
