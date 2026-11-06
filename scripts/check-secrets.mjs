import { readdirSync,readFileSync,statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ignore=new Set(['node_modules','.next','.git','test-results','playwright-report','private']);
const violations=[];
function walk(dir){for(const name of readdirSync(dir)){
  if(ignore.has(name)||name.endsWith('.tsbuildinfo'))continue;
  const path=dir+'/'+name;
  if(statSync(path).isDirectory()){walk(path);continue;}
  if(name.startsWith('.env')&&name!=='.env.example')continue;
  if(!/\.(tsx?|m?js|json|md|ya?ml|sql|txt|tsv|csv|example)$/.test(name))continue;
  const text=readFileSync(path,'utf8');
  if(/npg_[A-Za-z0-9]{8,}/.test(text))violations.push(path+': token Neon');
  for(const match of text.matchAll(/postgres(?:ql)?:\/\/[^\s'"`<>]+/g)){
    try{const url=new URL(match[0]);if(url.password&&!['127.0.0.1','localhost','host'].includes(url.hostname.toLowerCase()))violations.push(path+': conexão com credenciais');}catch{}
  }
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))violations.push(path+': chave privada');
}}
walk('.');
try{const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0');for(const path of tracked)if(path.split('/').some(p=>p.startsWith('.env')&&p!=='.env.example'))violations.push(path+': arquivo de ambiente versionado');}catch{}
if(violations.length){console.error(violations.join('\n'));process.exit(1);}
console.log('Verificação de segredos: nenhum token Neon, conexão privada ou arquivo de ambiente versionado.');
