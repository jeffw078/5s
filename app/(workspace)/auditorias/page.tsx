import { requireUser } from '@/lib/auth';
import { Audits } from '@/components/audits';
export default async function Page(){return <Audits user={await requireUser()}/>;}
