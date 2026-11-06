'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname,useRouter } from 'next/navigation';
import { LayoutDashboard,ClipboardCheck,Upload,Building2,Users,LogOut,Menu,X,ChevronRight,Leaf,LockKeyhole } from 'lucide-react';
import type { User } from '@/lib/domain';
import { api } from './shared';
import { useUnsavedGuard } from './unsaved-guard';
const links=[{href:'/dashboard',label:'Visão geral',icon:LayoutDashboard,roles:['MASTER','ADMIN']},{href:'/auditorias',label:'Auditorias',icon:ClipboardCheck,roles:['MASTER','ADMIN','AUDITOR']},{href:'/importacao',label:'Importar histórico',icon:Upload,roles:['MASTER']},{href:'/cadastros',label:'Unidades e setores',icon:Building2,roles:['MASTER']},{href:'/usuarios',label:'Usuários e acessos',icon:Users,roles:['MASTER']}];
export function Shell({user,children}:{user:User;children:React.ReactNode}){
  const pathname=usePathname(),router=useRouter();const [open,setOpen]=useState(false),[leaving,setLeaving]=useState(false);
  const current=links.find(l=>pathname.startsWith(l.href));
  const guard=useUnsavedGuard();
  async function logout(){if(!guard.confirmLeave())return;setLeaving(true);try{await api('auth/logout',{});guard.setDirty(false);router.push('/login');router.refresh();}catch{setLeaving(false);}}
  return <div className="app-frame">
    {open&&<button className="nav-shade" aria-label="Fechar menu" onClick={()=>setOpen(false)}/>}
    <aside className={'sidebar '+(open?'open':'')}>
      <Link href="/" className="brand"><img src="/logo.svg" alt="SteelMast" width="172" height="32"/><span>PROGRAMA DE EXCELÊNCIA</span></Link>
      <div className="product"><span className="product-symbol">5S</span><div><strong>Auditoria 5S</strong><span>Organizar. Cuidar. Evoluir.</span></div></div>
      <div className="nav-caption">ESPAÇO DE TRABALHO</div>
      <nav aria-label="Navegação principal">{links.filter(l=>l.roles.includes(user.role)).map(l=><Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className={pathname.startsWith(l.href)?'active':''}><l.icon size={19}/>{l.label}{pathname.startsWith(l.href)&&<ChevronRight size={15} className="nav-arrow"/>}</Link>)}</nav>
      <div className="sidebar-bottom"><div className="culture"><Leaf size={22}/><strong>A excelência começa aqui.</strong><p>Pequenas atitudes.<br/>Evolução todos os dias.</p></div><div className="user-box"><span className="avatar">{user.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</span><div><strong>{user.name}</strong><span>{user.role==='MASTER'?'Master':user.role==='ADMIN'?'Administrador':'Auditor'}</span></div><button onClick={logout} disabled={leaving} title="Sair" aria-label="Sair"><LogOut size={18}/></button></div></div>
    </aside>
    <div className="app-main"><header className="topbar"><button className="mobile-menu" aria-label="Abrir menu" onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button><div className="breadcrumb">SteelMast <ChevronRight size={13}/><span>{current?.label??'Auditorias'}</span></div><div className="topbar-right"><span className="workspace-tag"><span/>Programa 5S</span><Link href="/trocar-senha" aria-label="Alterar minha senha" title="Alterar minha senha" className="topbar-lock"><LockKeyhole size={18}/></Link></div></header><main className="page-content">{children}</main><footer className="app-footer"><span>STEELMAST · Gestão e melhoria contínua</span><span>Auditoria 5S</span></footer></div>
  </div>;
}
