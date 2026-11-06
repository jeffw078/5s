import { loadEnvConfig } from '@next/env';
import { readFileSync,writeFileSync } from 'node:fs';
import { parseHistory } from '../lib/history-import';
import { Service } from '../lib/service';
import { getDatabase,closeDatabase } from '../lib/db';
loadEnvConfig(process.cwd());
async function main(){
  const args=process.argv.slice(2);const path=args.find(a=>!a.startsWith('--'))??'data/historico-original.tsv';
  const text=readFileSync(path,'utf8');const p=parseHistory(text);
  writeFileSync('data/validacao-historico.json',JSON.stringify(p,null,2));
  console.log(JSON.stringify({total:p.total,validos:p.rows.length,duplicados:p.duplicates.length,inconsistencias:p.errors.length,avisos:p.warnings.length}));
  if(!args.includes('--commit')){console.log('Prévia gerada. Nenhuma gravação no banco. Use --commit para importar; --valid-only permite separar registros inconsistentes.');return;}
  const db=getDatabase();const actor=(await db.query("SELECT id,role FROM sm5s.users WHERE email=$1 AND role='MASTER' AND active",[(process.env.MASTER_EMAIL??'jeffersonw078@gmail.com').toLowerCase()])).rows[0];
  if(!actor)throw new Error('Crie o Master antes de importar.');
  console.log(JSON.stringify(await new Service(db).importHistory(actor as any,text,args.includes('--valid-only'))));
}
main().catch(e=>{console.error('Importação não concluída:',e.code??e.message?.replace(/postgres(?:ql)?:\/\/\S+/g,'[REDACTED]'));process.exitCode=1;}).finally(closeDatabase);
