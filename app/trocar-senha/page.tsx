import { AuthForm } from '@/components/auth-form';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){const u=await currentUser();if(!u)redirect('/login');return <AuthForm change forced={u.must_change_password}/>;}
