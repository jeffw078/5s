import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Importer } from '@/components/importer';
export default async function Page(){if((await requireUser()).role!=='MASTER')redirect('/');return <Importer/>;}
