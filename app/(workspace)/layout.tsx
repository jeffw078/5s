import { requireUser } from '@/lib/auth';
import { Shell } from '@/components/shell';
import { UnsavedProvider } from '@/components/unsaved-guard';
export const dynamic='force-dynamic';
export default async function Layout({children}:{children:React.ReactNode}){const u=await requireUser();return <UnsavedProvider><Shell user={u}>{children}</Shell></UnsavedProvider>;}
