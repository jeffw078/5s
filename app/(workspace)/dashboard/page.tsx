import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/dashboard';
export default async function Page(){const u=await requireUser();if(u.role==='AUDITOR')redirect('/auditorias');return <Dashboard/>;}
