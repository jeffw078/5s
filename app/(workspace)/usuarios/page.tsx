import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Administration } from '@/components/administration';
export default async function Page(){if((await requireUser()).role!=='MASTER')redirect('/');return <Administration mode="users"/>;}
