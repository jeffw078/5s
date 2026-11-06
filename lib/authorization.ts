import type { Queryable } from './db';
import { AppError,type Actor } from './domain';
/** Lock the same user row changed by resets/deactivation until the write commits. */
export async function authorizeMutation(q:Queryable,actor:Actor){
  const user=(await q.query('SELECT id,role,active,auth_version,must_change_password FROM sm5s.users WHERE id=$1 FOR SHARE',[actor.id])).rows[0];
  if(!user||!user.active||user.role!==actor.role||(actor.auth_version!==undefined&&actor.auth_version!==user.auth_version))throw new AppError('Acesso revogado ou sessão expirada. Entre novamente.',401);
  if(actor.session){
    if(user.must_change_password)throw new AppError('Altere a senha temporária para continuar.',428);
    const session=(await q.query('SELECT token_hash FROM sm5s.sessions WHERE token_hash=$1 AND user_id=$2 AND auth_version=$3 AND expires_at>now() FOR SHARE',[actor.session.hash,actor.id,user.auth_version])).rows[0];
    if(!session)throw new AppError('Sessão expirada. Entre novamente.',401);
  }
}
