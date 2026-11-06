export type Role='MASTER'|'ADMIN'|'AUDITOR';
export type Status='PLANNED'|'IN_PROGRESS'|'REVIEW'|'FINALIZED';
export type Actor={id:string;role:Role|string;auth_version?:number;session?:{hash:string}};
export type AuditAccess={auditor_id:string|null;status:string;source:string};
export type User=Actor & {name:string;email:string;role:Role;must_change_password:boolean;active:boolean};
export class AppError extends Error {constructor(message:string,public status=400){super(message);}}
export const STATUS_LABELS:Record<string,string>={PLANNED:'Planejada',IN_PROGRESS:'Em andamento',REVIEW:'Em revisão',FINALIZED:'Finalizada'};
export function previousMonth(period:string){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw new AppError('Período inválido.');
  const [y,m]=period.split('-').map(Number);return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`;
}
export function calculateScores(answers:{sense:number;score:number|null}[]){
  const senses:Record<number,number|null>={};
  for(let s=1;s<=5;s++){
    const values=answers.filter(a=>a.sense===s&&a.score!==null).map(a=>a.score as number);
    senses[s]=values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*100)/100:null;
  }
  const all=Object.values(senses);
  return {senses,overall:all.every(v=>v!==null)?Math.round((all as number[]).reduce((a,b)=>a+b,0)/5*100)/100:null};
}
export function canRead(actor:Actor,a:AuditAccess){return actor.role!=='AUDITOR'||a.auditor_id===actor.id;}
export function canEdit(actor:Actor,a:AuditAccess){
  return a.source==='LIVE'&&['PLANNED','IN_PROGRESS'].includes(a.status)&&(actor.role==='MASTER'||a.auditor_id===actor.id);
}
export function requireManager(actor:Actor){if(!['MASTER','ADMIN'].includes(actor.role))throw new AppError('Acesso restrito à gestão.',403);}
export function requireMaster(actor:Actor){if(actor.role!=='MASTER')throw new AppError('Acesso restrito ao Master.',403);}
export function assertTransition(from:string,to:string,actor:Actor,auditor:string|null,reason=''){
  if(from==='FINALIZED')throw new AppError('Auditorias finalizadas são imutáveis.',409);
  if(to==='REVIEW'&&['PLANNED','IN_PROGRESS'].includes(from)){
    if(actor.id!==auditor&&actor.role!=='MASTER')throw new AppError('Somente o auditor designado pode enviar.',403);return;
  }
  if(from==='REVIEW'&&['FINALIZED','IN_PROGRESS'].includes(to)){
    requireManager(actor);
    if(actor.id===auditor)throw new AppError('A revisão deve ser realizada por outro gestor.',403);
    if(to==='IN_PROGRESS'&&reason.trim().length<5)throw new AppError('Informe o motivo da devolução (mínimo 5 caracteres).');return;
  }
  throw new AppError('Transição de etapa inválida.',409);
}
export function scoreLabel(score:number|null|undefined){return score===null||score===undefined?'Sem avaliação':`${Number(score).toLocaleString('pt-BR',{maximumFractionDigits:1})}%`;}
export function validDate(input:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input))return false;
  const d=new Date(`${input}T12:00:00Z`);return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===input;
}
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());}
