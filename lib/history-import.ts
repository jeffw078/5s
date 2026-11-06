import { parse } from 'csv-parse/sync';
import { validDate } from './domain';
export type ImportRow={line:number;date:string;period:string;sense:number;score:number;sector:string;unit:string;auditor:string;key:string};
export type Issue={line:number;code:string;message:string};
export type ImportPlan={total:number;rows:ImportRow[];duplicates:Issue[];errors:Issue[];warnings:Issue[]};
export const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const months=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const names=['seiri','seiton','seiso','seiketsu','shitsuke'];
export function parseHistory(text:string):ImportPlan{
  const p:ImportPlan={total:0,rows:[],duplicates:[],errors:[],warnings:[]};
  if(Buffer.byteLength(text,'utf8')>3_000_000){p.errors.push({line:0,code:'SIZE',message:'Arquivo deve ter até 3 MB.'});return p;}
  const first=text.replace(/^\uFEFF/,'').split(/\r?\n/)[0]??'';
  const delimiter=first.includes('\t')?'\t':first.includes(';')?';':',';
  let data:string[][];
  try{data=parse(text,{bom:true,delimiter,skip_empty_lines:true,relax_column_count:false,trim:true});}
  catch{p.errors.push({line:0,code:'FORMAT',message:'Arquivo CSV/TSV malformado: confira colunas, delimitador e aspas.'});return p;}
  if(data.length<2){p.errors.push({line:1,code:'EMPTY',message:'Arquivo sem registros.'});return p;}
  const h=data[0].map(normalize);
  const expected=[['data da auditoria','data'],['mes auditoria','mes'],['ano auditoria','ano'],['senso'],['pontuacao'],['setor'],['unidade'],['auditor']];
  if(h.length!==8||!expected.every((a,i)=>a.includes(h[i]))){p.errors.push({line:1,code:'HEADER',message:'Colunas esperadas: Data da auditoria, Mês Auditoria, Ano Auditoria, Senso, Pontuação, Setor, Unidade, Auditor.'});return p;}
  const seen=new Map<string,ImportRow>();const blocked=new Set<string>();
  p.total=data.length-1;
  data.slice(1).forEach((v,i)=>{
    const line=i+2;
    const issue=(code:string,message:string)=>p.errors.push({line,code,message});
    const [dateRaw,month,year,senseRaw,scoreRaw,sectorRaw,unitRaw,auditorRaw]=v;
    const br=dateRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const date=br?`${br[3]}-${br[2]}-${br[1]}`:dateRaw;
    if(!validDate(date)||date<'2000-01-01'||date>'2100-12-31'){issue('DATE','Data de auditoria inválida.');return;}
    const yr=date.slice(0,4),mo=Number(date.slice(5,7));
    if(!year||year==='#VALOR!'||year==='#VALUE!')p.warnings.push({line,code:'YEAR_INFERRED',message:`Ano inferido da data válida: ${yr}.`});
    else if(year!==yr){issue('YEAR','Ano informado difere da data.');return;}
    if(normalize(month)!==months[mo-1]&&Number(month)!==mo){issue('MONTH','Mês informado difere da data.');return;}
    const sense=names.findIndex(n=>normalize(senseRaw).startsWith(n))+1;
    if(!sense){issue('SENSE','Senso não reconhecido.');return;}
    const score=Number(scoreRaw.replace(',','.'));
    if(!scoreRaw.trim()||!Number.isFinite(score)||score<0||score>100){issue('SCORE','Pontuação deve estar entre 0 e 100.');return;}
    const [sector,unit,auditor]=[sectorRaw,unitRaw,auditorRaw].map(s=>s.trim().replace(/\s+/g,' '));
    if(!sector||!unit||!auditor||[sector,unit,auditor].some(s=>s.length>160)){issue('REQUIRED','Setor, unidade e auditor são obrigatórios e devem ter até 160 caracteres.');return;}
    const key=[date,normalize(unit),normalize(sector),sense].join('|');
    const r={line,date,period:date.slice(0,7),sense,score,sector,unit,auditor,key};
    const before=seen.get(key);
    if(blocked.has(key)){issue('CONFLICT','Chave já possui conflito; registro separado para correção.');return;}
    if(before){
      if(before.score===score&&normalize(before.auditor)===normalize(auditor))p.duplicates.push({line,code:'DUPLICATE',message:`Duplicado idêntico da linha ${before.line}; será ignorado.`});
      else{issue('CONFLICT',`Conflito com linha ${before.line}: notas ou auditores divergentes. Ambas as versões foram separadas para correção.`);p.errors.push({line:before.line,code:'CONFLICT',message:`Conflito com linha ${line}.`});blocked.add(key);seen.delete(key);}return;
    }
    seen.set(key,r);
  });
  p.rows=[...seen.values()];
  const auditAuthors=new Map<string,Set<string>>();
  for(const r of p.rows){const key=[r.date,normalize(r.unit),normalize(r.sector)].join('|');const authors=auditAuthors.get(key)??new Set();authors.add(normalize(r.auditor));auditAuthors.set(key,authors);}
  p.rows=p.rows.filter(r=>{const key=[r.date,normalize(r.unit),normalize(r.sector)].join('|');if(auditAuthors.get(key)!.size<=1)return true;p.errors.push({line:r.line,code:'AUDITOR_CONFLICT',message:'Auditores distintos na mesma data/unidade/setor. Registros separados para correção da autoria.'});return false;});
  const sectors=new Map<string,Set<string>>();
  for(const r of p.rows){const k=normalize(r.unit)+'|'+normalize(r.sector).replace(/s$/,'');const vals=sectors.get(k)??new Set();vals.add(r.sector);sectors.set(k,vals);}
  for(const vals of sectors.values())if(vals.size>1)p.warnings.push({line:0,code:'NAME_VARIANT',message:`Grafias semelhantes mantidas separadas: ${[...vals].join(' / ')}.`});
  return p;
}
