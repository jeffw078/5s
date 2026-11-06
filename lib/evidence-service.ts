import { randomUUID } from 'node:crypto';
import type { Database } from './db';
import { AppError,canEdit,canRead,type Actor } from './domain';
import { compressEvidence } from './images';
import { authorizeMutation } from './authorization';
export class EvidenceService{
  constructor(private db:Database){}
  async add(actor:Actor,auditId:string,sense:number,input:Buffer,description:string){
    if(!Number.isInteger(sense)||sense<1||sense>5||description.length>500)throw new AppError('Senso ou descrição inválidos.');
    const {rows}=await this.db.query('SELECT * FROM sm5s.audits WHERE id=$1',[auditId]);
    if(!rows[0]||!canEdit(actor,rows[0] as any))throw new AppError('Acesso não autorizado.',403);
    const image=await compressEvidence(input);
    return this.db.transaction(async q=>{
      await authorizeMutation(q,actor);
      const a=(await q.query('SELECT * FROM sm5s.audits WHERE id=$1 FOR UPDATE',[auditId])).rows[0];
      if(!a||!canEdit(actor,a as any))throw new AppError('A auditoria não permite anexos.',403);
      const count=(await q.query('SELECT count(*)::integer AS n FROM sm5s.evidence WHERE audit_id=$1 AND sense=$2',[auditId,sense])).rows[0].n;
      if(count>=3)throw new AppError('Limite de 3 fotos por senso atingido.');
      const id=randomUUID();
      await q.query("INSERT INTO sm5s.evidence(id,audit_id,sense,data,mime_type,size,width,height,description,created_by) VALUES($1,$2,$3,$4,'image/webp',$5,$6,$7,$8,$9)",[id,auditId,sense,image.data,image.data.length,image.width,image.height,description,actor.id]);
      await q.query('INSERT INTO sm5s.events(id,audit_id,actor_id,action,detail) VALUES($1,$2,$3,$4,$5)',[randomUUID(),auditId,actor.id,'PHOTO_ADDED',`Senso ${sense}`]);
      return {id,size:image.data.length,width:image.width,height:image.height};
    });
  }
  async read(actor:Actor,id:string){
    const e=(await this.db.query('SELECT e.*,a.auditor_id,a.status,a.source FROM sm5s.evidence e JOIN sm5s.audits a ON a.id=e.audit_id WHERE e.id=$1',[id])).rows[0];
    if(!e||!canRead(actor,e as any))throw new AppError('Evidência não encontrada.',404);return e;
  }
  async remove(actor:Actor,id:string){
    return this.db.transaction(async q=>{
      await authorizeMutation(q,actor);
      const e=(await q.query('SELECT e.id,e.audit_id,a.auditor_id,a.status,a.source FROM sm5s.evidence e JOIN sm5s.audits a ON a.id=e.audit_id WHERE e.id=$1 FOR UPDATE OF a',[id])).rows[0];
      if(!e||!canEdit(actor,e as any))throw new AppError('Acesso não autorizado.',403);
      await q.query('DELETE FROM sm5s.evidence WHERE id=$1',[id]);
      await q.query('INSERT INTO sm5s.events(id,audit_id,actor_id,action,detail) VALUES($1,$2,$3,$4,$5)',[randomUUID(),e.audit_id,actor.id,'PHOTO_REMOVED',id]);return {ok:true};
    });
  }
}
