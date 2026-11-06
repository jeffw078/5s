import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDatabase } from './db';
import { Authentication } from './auth-service';
import type { User } from './domain';
export const COOKIE='sm5s_session';
export async function currentUser():Promise<User|null>{
  const token=(await cookies()).get(COOKIE)?.value;
  if(!token)return null;
  try{return await new Authentication(getDatabase()).getUser(token);}catch{return null;}
}
export async function requireUser(){const user=await currentUser();if(!user)redirect('/login');if(user.must_change_password)redirect('/trocar-senha');return user;}
