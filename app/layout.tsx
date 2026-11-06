import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Auditoria 5S | SteelMast',template:'%s | SteelMast 5S'},description:'Planejamento, avaliação e evolução do programa 5S SteelMast.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
