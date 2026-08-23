"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import {usePathname} from "next/navigation";
import {BarChart3,Bell,BookOpen,Inbox,LayoutDashboard,LogOut,Menu,Moon,Search,Settings,Sparkles,Sun,Users} from "lucide-react";
import {useEffect,useState} from "react";
const items=[['/dashboard','Overview',LayoutDashboard],['/dashboard/conversations','Conversations',Inbox],['/dashboard/knowledge','Knowledge Base',BookOpen],['/dashboard/analytics','Analytics',BarChart3],['/dashboard/team','Team',Users],['/dashboard/settings','Settings',Settings]] as const;
export function DashboardShell({children}:{children:React.ReactNode}){
 const path=usePathname(),[dark,setDark]=useState(false);
 useEffect(()=>setDark(localStorage.theme==='dark'||(!('theme' in localStorage)&&matchMedia('(prefers-color-scheme: dark)').matches)),[]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark);localStorage.theme=dark?'dark':'light'},[dark]);
 return <div className="app-shell"><aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark"><Sparkles size={18}/></span>SupportPilot <b>AI</b></Link><nav className="side-nav">{items.map(([href,label,Icon])=><Link key={href} href={href} className={`nav-link ${path===href?'active':''}`}><Icon size={17}/>{label}</Link>)}</nav><div className="workspace"><div className="avatar">AM</div><div><b>Alex Morgan</b><span>Northstar Workspace</span></div></div></aside><section className="app-main"><header className="topbar"><div className="search"><button className="icon-button mobile-menu"><Menu size={18}/></button><Search size={16}/><span>Search conversations, articles, people…</span></div><div className="top-actions"><button aria-label="Toggle theme" className="icon-button" onClick={()=>setDark(!dark)}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button><button aria-label="Notifications" className="icon-button"><Bell size={17}/></button><form action="/logout" method="post"><button aria-label="Log out" className="icon-button" type="submit"><LogOut size={17}/></button></form></div></header>{children}</section></div>
}
