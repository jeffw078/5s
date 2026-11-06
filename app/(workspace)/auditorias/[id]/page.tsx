import { AuditDetail } from '@/components/audit-detail';
import { requireUser } from '@/lib/auth';
export default async function Page({params}:{params:Promise<{id:string}>}){const [user,{id}]=await Promise.all([requireUser(),params]);return <AuditDetail id={id} user={user}/>;}
