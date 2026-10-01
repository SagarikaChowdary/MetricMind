import {useMemo,useState} from 'react';
import {ArrowUpDown,Search} from 'lucide-react';
export default function DataTable({ds}){
 const [q,setQ]=useState(''),[col,setCol]=useState(''),[sort,setSort]=useState(null),[page,setPage]=useState(0),size=50;
 const rows=useMemo(()=>{let r=ds.rows;const s=q.toLowerCase();if(s)r=r.filter(x=>(col?[x[col]]:Object.values(x)).some(v=>String(v??'').toLowerCase().includes(s)));
  if(sort){const{k,d}=sort;r=[...r].sort((a,b)=>{const x=a[k],y=b[k];if(x===null)return 1;if(y===null)return-1;return(typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y)))*d})}return r},[ds,q,col,sort]);
 const pages=Math.max(1,Math.ceil(rows.length/size)),p=Math.min(page,pages-1);
 return <div className="card"><div className="tools"><div className="search"><Search size={15}/><input placeholder="Search rows..." value={q} onChange={e=>{setQ(e.target.value);setPage(0)}}/></div>
  <select value={col} onChange={e=>setCol(e.target.value)}><option value="">All columns</option>{ds.cols.map(c=><option key={c.name}>{c.name}</option>)}</select><span className="muted sm">{rows.length.toLocaleString()} matching rows</span></div>
  <div className="tscroll"><table><thead><tr>{ds.cols.map(c=><th key={c.name} onClick={()=>setSort(s=>({k:c.name,d:s?.k===c.name?-s.d:1}))}>{c.name}<ArrowUpDown size={12}/></th>)}</tr></thead>
  <tbody>{rows.slice(p*size,p*size+size).map((r,i)=><tr key={i}>{ds.cols.map(c=><td key={c.name}>{r[c.name]===null?<i className="na">null</i>:String(r[c.name])}</td>)}</tr>)}</tbody></table></div>
  <div className="pager"><button className="btn ghost sm" disabled={p===0} onClick={()=>setPage(p-1)}>Previous</button><span className="muted sm">Page {p+1} of {pages}</span><button className="btn ghost sm" disabled={p>=pages-1} onClick={()=>setPage(p+1)}>Next</button></div></div>;
}
