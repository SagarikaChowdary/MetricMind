import {Link,NavLink} from 'react-router-dom';
import {Home,Upload,Table2,BarChart3,LayoutDashboard,Sparkles,Info,AlertTriangle,Database,Loader2} from 'lucide-react';
import {useData} from '../store.jsx';
export const NAV=[['/',Home,'Home'],['/upload',Upload,'Upload Dataset'],['/preview',Table2,'Data Preview'],['/analysis',BarChart3,'Analysis'],['/dashboard',LayoutDashboard,'Dashboard'],['/insights',Sparkles,'AI Insights'],['/about',Info,'About']];
export function Sidebar({open,close}){const {ds}=useData();return(
 <aside className={'sidebar'+(open?' open':'')}>
  <div className="logo"><span className="mark"><BarChart3 size={18}/></span>MetricMind</div>
  <nav>{NAV.map(([to,I,l])=><NavLink key={to} to={to} end={to==='/'} onClick={close}><I size={18}/>{l}</NavLink>)}</nav>
  <div className="status"><div className="row"><Database size={14}/><b>{ds?'Dataset loaded':'No dataset'}</b><i className={'dot'+(ds?' on':'')}/></div>
   {ds&&<><div className="name" title={ds.name}>{ds.name}</div><div className="muted">{ds.rows.length.toLocaleString()} rows · {ds.cols.length} columns</div></>}</div>
 </aside>)}
export const KPICard=({label,value,sub,icon:I})=><div className="card kpi">{I&&<I size={18} className="kicon"/>}<div className="muted">{label}</div><div className="kval">{value}</div>{sub&&<div className="muted sm">{sub}</div>}</div>;
export const ChartCard=({title,children,actions})=><div className="card chartcard"><div className="ch"><h3>{title}</h3>{actions}</div>{children}</div>;
export const InsightCard=({title,items,icon:I=Sparkles})=><div className="card"><h3 className="ih"><I size={16}/>{title}</h3><ul className="ins">{items.map((t,i)=><li key={i}>{t}</li>)}</ul></div>;
export const LoadingState=({text})=><div className="loading"><Loader2 className="spin" size={22}/><span>{text}</span><div className="skel"/></div>;
export const ErrorMessage=({text,onClose})=>text?<div className="err"><AlertTriangle size={16}/>{text}{onClose&&<button onClick={onClose}>×</button>}</div>:null;
export const EmptyState=()=><div className="card empty"><Database size={36}/><h2>No Dataset Loaded</h2><p>Upload a dataset to start analyzing your data.</p><Link className="btn" to="/upload">Upload Dataset</Link></div>;
export const Guard=({children})=>{const {ds,busy}=useData();return busy?<LoadingState text={busy}/>:ds?children:<EmptyState/>};
