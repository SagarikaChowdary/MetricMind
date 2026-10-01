import {useState,useMemo} from 'react';
import {chartData} from '../utils/data.js';
import {ChartCard} from './ui.jsx';import {ChartView} from './Charts.jsx';
const TYPES=[['bar','Bar Chart'],['line','Line Chart'],['pie','Pie Chart'],['doughnut','Doughnut Chart'],['scatter','Scatter Plot'],['histogram','Histogram'],['area','Area Chart']];
export default function ChartBuilder({ds}){
 const nums=ds.cols.filter(c=>c.type==='number');
 const [type,setType]=useState('bar'),[x,setX]=useState(ds.cols[0].name),[y,setY]=useState(nums[0]?.name||'(count)'),[applied,setApplied]=useState(null);
 const generate=()=>setApplied({type,x,y});
 const data=useMemo(()=>applied?chartData(ds,applied.type,applied.x,applied.y):null,[applied,ds]);
 const sel=(v,f,opts)=><select value={v} onChange={e=>f(e.target.value)}>{opts}</select>;
 return <ChartCard title="Chart builder">
  <div className="controls">
   <label>Chart type{sel(type,setType,TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>))}</label>
   <label>{type==='histogram'?'Column':'X axis'}{sel(x,setX,ds.cols.map(c=><option key={c.name}>{c.name}</option>))}</label>
   {type!=='histogram'&&<label>Y axis{sel(y,setY,[<option key="c">(count)</option>,...nums.map(c=><option key={c.name}>{c.name}</option>)])}</label>}
   <button className="btn" onClick={generate}>Generate Chart</button></div>
  {applied?<ChartView {...applied} data={data} downloadable height={320}/>:<div className="muted pad">Choose columns and select Generate Chart.</div>}
 </ChartCard>;
}
