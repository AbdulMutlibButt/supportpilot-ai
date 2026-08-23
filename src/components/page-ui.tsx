import { ArrowUpRight } from "lucide-react";
export function PageHead({title,desc,action}:{title:string,desc:string,action?:string}){return <div className="page-head"><div><h1>{title}</h1><p>{desc}</p></div>{action&&<button className="btn-primary">{action}<ArrowUpRight size={15}/></button>}</div>}
export const activity=[['JS','Jamie submitted feedback','“The response was super helpful!”'],['MK','Mina closed a conversation','Billing question · 3m ago'],['AR','Ari published an article','How to update your payment method'],['LC','Leo joined your workspace','Customer Support · 42m ago']];
