export type DraftAnswer={score:number|null;note:string};
export function buildAnswerPayload(answers:Record<string,DraftAnswer>){
  return Object.entries(answers).filter(([,a])=>a.score!==null||a.note.trim().length>0).map(([questionId,a])=>({questionId,score:a.score,note:a.note}));
}
export function mergeEvidenceRefresh<T extends {audit:{revision:number}}>(local:T,remote:T):T{
  return {...remote,audit:{...remote.audit,revision:local.audit.revision}};
}
export function shouldConfirmNavigation(dirty:boolean,href:string,currentUrl:string){
  if(!dirty||href.startsWith('#'))return false;
  const current=new URL(currentUrl),target=new URL(href,current);
  return current.origin!==target.origin||current.pathname!==target.pathname||current.search!==target.search;
}
