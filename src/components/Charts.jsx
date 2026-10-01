import {useRef} from 'react';
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,AreaChart,Area,PieChart,Pie,Cell,ScatterChart,Scatter,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts';
import {Download} from 'lucide-react';
const COL=['#5C7C89','#8fb0be','#2f6379','#c5d8e0','#46899f','#e6eef2','#3b6577','#a9c1cc','#6b93a3','#1F4959','#7fa3b3','#d9e6ec'];
const ax={stroke:'#9fb6c0',fontSize:11};
export function ChartView({type,data,x,y,height=280,downloadable,legend=true}){
 const ref=useRef();
 if(!data||!data.length)return <div className="muted pad">No plottable data for this selection.</div>;
 const tip={contentStyle:{background:'#011425',border:'1px solid #1F4959',borderRadius:8}};
 const grid=<CartesianGrid stroke="#12354a" strokeDasharray="3 3"/>;
 const cart=C=>(<ResponsiveContainer width="100%" height={height}><C data={data}>{grid}<XAxis dataKey="name" {...ax}/><YAxis {...ax}/><Tooltip {...tip}/></C></ResponsiveContainer>);
 let c;
 if(type==='bar'||type==='histogram')c=<ResponsiveContainer width="100%" height={height}><BarChart data={data}>{grid}<XAxis dataKey="name" {...ax}/><YAxis {...ax}/><Tooltip {...tip}/><Bar dataKey="value" fill="#5C7C89" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>;
 else if(type==='line')c=<ResponsiveContainer width="100%" height={height}><LineChart data={data}>{grid}<XAxis dataKey="name" {...ax}/><YAxis {...ax}/><Tooltip {...tip}/><Line dataKey="value" stroke="#8fb0be" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>;
 else if(type==='area')c=<ResponsiveContainer width="100%" height={height}><AreaChart data={data}>{grid}<XAxis dataKey="name" {...ax}/><YAxis {...ax}/><Tooltip {...tip}/><Area dataKey="value" stroke="#8fb0be" fill="#5C7C89" fillOpacity={.25}/></AreaChart></ResponsiveContainer>;
 else if(type==='scatter')c=<ResponsiveContainer width="100%" height={height}><ScatterChart>{grid}<XAxis dataKey="x" name={x} type="number" {...ax}/><YAxis dataKey="y" name={y} type="number" {...ax}/><Tooltip {...tip}/><Scatter data={data} fill="#8fb0be"/></ScatterChart></ResponsiveContainer>;
 else c=<ResponsiveContainer width="100%" height={height}><PieChart><Tooltip {...tip}/>{legend&&<Legend/>}<Pie data={data} dataKey="value" nameKey="name" innerRadius={type==='doughnut'?'52%':0} outerRadius="78%" paddingAngle={2}>{data.map((_,i)=><Cell key={i} fill={COL[i%COL.length]} stroke="none"/>)}</Pie></PieChart></ResponsiveContainer>;
 const dl=()=>{const s=ref.current.querySelector('svg');if(!s)return;const b=new Blob([new XMLSerializer().serializeToString(s)],{type:'image/svg+xml'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='metricmind-chart.svg';a.click()};
 return <div ref={ref}>{c}{downloadable&&<button className="btn ghost sm" onClick={dl}><Download size={14}/>Download chart</button>}</div>;
}
