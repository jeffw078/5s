'use client';
import { createContext,useCallback,useContext,useEffect,useState } from 'react';
import { shouldConfirmNavigation } from '@/lib/audit-draft';
const Guard=createContext<{dirty:boolean;setDirty:(value:boolean)=>void;confirmLeave:()=>boolean}>({dirty:false,setDirty:(_value:boolean)=>{},confirmLeave:()=>true});
export const useUnsavedGuard=()=>useContext(Guard);
export function UnsavedProvider({children}:{children:React.ReactNode}){
  const [dirty,setDirty]=useState(false);
  const confirmLeave=useCallback(()=>!dirty||window.confirm('Há alterações não salvas. Deseja sair sem salvá-las?'),[dirty]);
  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const anchor=(event.target as Element)?.closest?.('a[href]') as HTMLAnchorElement|null;
      if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
      if(shouldConfirmNavigation(dirty,anchor.href,window.location.href)&&!confirmLeave()){event.preventDefault();event.stopPropagation();}
    };
    document.addEventListener('click',click,true);return()=>document.removeEventListener('click',click,true);
  },[dirty,confirmLeave]);
  return <Guard.Provider value={{dirty,setDirty,confirmLeave}}>{children}</Guard.Provider>;
}
