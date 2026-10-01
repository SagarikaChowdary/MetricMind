import {useRef,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {UploadCloud,FileSpreadsheet,Rows3,Columns3,AlertCircle,Copy,Sigma,Sparkles,TrendingUp,ShieldCheck,Lightbulb,Zap,Gauge,BarChart3} from 'lucide-react';
import {useData} from '../store.jsx';import {fmt,smartKpis} from '../utils/data.js';
import {KPICard,ChartCard,InsightCard,Guard,LoadingState,ErrorMessage} from '../components/ui.jsx';
import {ChartView} from '../components/Charts.jsx';import DataTable from '../components/DataTable.jsx';import ChartBuilder from '../components/ChartBuilder.jsx';

const demo=[{name:'Q1',value:30},{name:'Q2',value:48},{name:'Q3',value:41},{name:'Q4',value:66}];
const mix=[{name:'Electronics',value:34},{name:'Furniture',value:26},{name:'Apparel',value:22},{name:'Stationery',value:18}];
export function HomePage(){return <>
 <section className="hero"><div><h1>MetricMind</h1><h2>AI-Powered Data Analytics Platform</h2>
  <p>Upload your dataset, uncover meaningful patterns, create interactive dashboards, and generate AI-powered insights — all in one place.</p>
  <div className="cta"><Link className="btn" to="/upload">Get Started</Link><Link className="btn ghost" to="/analysis">Explore Analytics</Link></div></div></section>
 <section className="card showcase">
  <div className="kgrid"><KPICard label="Total records" value="1,250"/><KPICard label="Revenue" value="₹2.4L"/><KPICard label="Avg. order value" value="₹1,920"/><KPICard label="Data quality" value="98%"/></div>
  <div className="pgrid">
   <div className="mini"><h4>Revenue by quarter</h4><ChartView type="bar" data={demo} height={210}/></div>
   <div className="mini"><h4>Growth trend</h4><ChartView type="line" data={demo} height={210}/></div>
   <div className="mini"><h4>Category share</h4><ChartView type="doughnut" data={mix} height={210}/></div></div>
  <div className="aip"><Sparkles size={14}/>AI insight: Electronics leads revenue at 34%. (Illustrative preview. Load a dataset for real numbers.)</div></section>
 <section className="features">{[[BarChart3,'Smart Data Analysis','Automatically understand dataset structure, columns, missing values, and statistics.'],[Gauge,'Interactive Dashboards','Generate charts and KPI visualizations from uploaded data.'],[Sparkles,'AI-Powered Insights','Turn complex data into simple natural-language insights.'],[ShieldCheck,'Data Quality','Detect missing values, duplicates, and unusual values.'],[Zap,'Fast Analytics','Analyze datasets directly in the browser.']].map(([I,t,d])=><div className="card feat" key={t}><I size={22}/><h3>{t}</h3><p className="muted">{d}</p></div>)}</section></>}

export function UploadPage(){
 const {ds,busy,error,setError,loadFile,loadSample,clear}=useData(),nav=useNavigate(),[over,setOver]=useState(false),[file,setFile]=useState(null),inp=useRef();
 const pick=f=>{setError('');if(!f)return;if(!/\.(csv|xlsx|xls|json)$/i.test(f.name)){setFile(null);setError('Unsupported file format. Please upload CSV, XLSX, or JSON.');return}setFile(f)};
 const load=async()=>{if(await loadFile(file)){setFile(null);nav('/preview')}};
 if(busy)return <LoadingState text={busy}/>;
 return <div><h1 className="pt">Upload dataset</h1><ErrorMessage text={error} onClose={()=>setError('')}/>
  <div className={'drop'+(over?' over':'')} onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);pick(e.dataTransfer.files[0])}} onClick={()=>inp.current.click()}>
   <UploadCloud size={40}/><h3>Drop your dataset here</h3><p className="muted">or browse files · CSV, XLSX, JSON</p>
   <input ref={inp} type="file" hidden accept=".csv,.xlsx,.xls,.json" onChange={e=>{pick(e.target.files[0]);e.target.value=''}}/></div>
  {file&&<div className="card meta"><FileSpreadsheet/><div><b>{file.name}</b><div className="muted sm">{file.name.split('.').pop().toUpperCase()} · {(file.size/1024).toFixed(1)} KB</div></div>
   <button className="btn" onClick={load}>Load Dataset</button><button className="btn ghost" onClick={()=>setFile(null)}>Remove Dataset</button></div>}
  <div className="or"><button className="btn ghost" onClick={async()=>{if(await loadSample())nav('/dashboard')}}>Try Sample Dataset</button></div>
  {ds&&<div className="card meta"><FileSpreadsheet/><div><b>{ds.name}</b><div className="muted sm">Currently loaded · {ds.rows.length.toLocaleString()} rows · {ds.cols.length} columns · {(ds.size/1024).toFixed(1)} KB</div></div>
   <Link className="btn" to="/preview">View data</Link><button className="btn ghost" onClick={clear}>Remove Dataset</button></div>}</div>}

export const PreviewPage=()=><Guard><PV/></Guard>;
function PV(){const {ds}=useData();return <div><h1 className="pt">{ds.name}</h1>
 <div className="kgrid"><KPICard icon={Rows3} label="Rows" value={ds.rows.length.toLocaleString()}/><KPICard icon={Columns3} label="Columns" value={ds.cols.length}/><KPICard icon={AlertCircle} label="Missing values" value={ds.missing}/><KPICard icon={Copy} label="Duplicate rows" value={ds.dup}/></div>
 <p className="muted">{ds.numeric} numeric · {ds.cols.length-ds.numeric} other columns. Showing 50 rows per page.</p><DataTable ds={ds}/></div>}

export const AnalysisPage=()=><Guard><AN/></Guard>;
function AN(){const {ds}=useData(),nums=ds.cols.filter(c=>c.type==='number'),cats=ds.cols.filter(c=>c.type!=='number'&&!c.empty);return <div><h1 className="pt">Analysis</h1>
 <div className="kgrid"><KPICard label="Total rows" value={ds.rows.length.toLocaleString()}/><KPICard label="Total columns" value={ds.cols.length}/><KPICard label="Missing values" value={ds.missing}/><KPICard label="Duplicate rows" value={ds.dup} sub={ds.emptyCols.length?`Empty columns: ${ds.emptyCols.join(', ')}`:'No empty columns'}/></div>
 <ChartBuilder ds={ds}/>
 <h2>Numeric columns</h2>{nums.length?<div className="card tscroll"><table><thead><tr>{['Column','Mean','Median','Min','Max','Std dev','Sum'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{nums.filter(c=>c.stats).map(c=><tr key={c.name}><td>{c.name}</td>{['mean','median','min','max','std','sum'].map(k=><td key={k}>{fmt(c.stats[k])}</td>)}</tr>)}</tbody></table></div>:<ErrorMessage text="No numeric columns were detected for statistical analysis."/>}
 <h2>Categorical columns</h2><div className="cgrid">{cats.map(c=><div className="card" key={c.name}><b>{c.name}</b><div className="muted sm">{c.unique} unique · most frequent: {c.top}</div>{c.freq.slice(0,5).map(([v,n])=><div className="bar" key={v}><span>{v}</span><i style={{width:n/c.freq[0][1]*100+'%'}}/><em>{n}</em></div>)}</div>)}</div>
 <h2>Column types and quality</h2><div className="card tscroll"><table><thead><tr><th>Column</th><th>Type</th><th>Missing</th></tr></thead><tbody>{ds.cols.map(c=><tr key={c.name}><td>{c.name}</td><td>{c.type}</td><td>{c.missing}</td></tr>)}</tbody></table></div></div>}

export const DashboardPage=()=><Guard><DB/></Guard>;
function DB(){const {ds}=useData(),nums=ds.cols.filter(c=>c.type==='number'&&c.stats),main=nums.find(c=>/revenue|sales|amount/i.test(c.name))||nums[0];
 return <div><h1 className="pt">Analytics dashboard</h1><p className="muted">{ds.name} · Last updated {new Date(ds.loadedAt).toLocaleString()}</p>
 <div className="kgrid">{smartKpis(ds).map(k=><KPICard key={k.label} {...k}/>)}</div>
 <div className="dgrid">{ds.charts.map(c=><ChartCard key={c.title} title={c.title}><ChartView {...c} downloadable/></ChartCard>)}
  <ChartCard title="Data quality"><ChartView type="bar" height={260} data={ds.cols.map(c=>({name:c.name,value:c.missing}))}/></ChartCard></div>
 <h2>Statistical summary</h2><div className="card tscroll"><table><thead><tr><th>Column</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th></tr></thead><tbody>{nums.map(c=><tr key={c.name}><td>{c.name}</td>{['mean','median','min','max'].map(k=><td key={k}>{fmt(c.stats[k])}</td>)}</tr>)}</tbody></table></div></div>}

export const InsightsPage=()=><Guard><IN/></Guard>;
function IN(){const {ds}=useData(),i=ds.insights;return <div><h1 className="pt">AI data insights</h1><p className="muted">Generated from {ds.name} using statistical rules. Set VITE_AI_ENDPOINT to connect an external model for chat.</p>
 <div className="cgrid"><InsightCard title="Key insights" items={i.key} icon={Lightbulb}/><InsightCard title="Trends" items={i.trends} icon={TrendingUp}/><InsightCard title="Anomalies" items={i.anomalies} icon={AlertCircle}/><InsightCard title="Data quality" items={i.quality} icon={ShieldCheck}/><InsightCard title="Recommendations" items={i.recs} icon={Sigma}/></div></div>}

export const AboutPage=()=><div className="about"><h1 className="pt">About MetricMind</h1><p>MetricMind is an AI-powered data analytics platform designed to simplify data exploration, visualization, and insight generation.</p>
 <h2>What is MetricMind?</h2><p className="muted">A browser-based workspace that profiles your data, builds dashboards, and explains findings in plain language. Files never leave your device.</p>
 <h2>Key features</h2><ul><li>CSV, XLSX and JSON upload with type detection</li><li>Searchable, sortable data preview</li><li>Statistics, data-quality checks, and a chart builder</li><li>Auto-generated dashboard and rule-based insights</li><li>Ask MetricMind chat assistant</li></ul>
 <h2>Technology stack</h2><p className="muted">React, React Router, Context API, Recharts, Lucide, PapaParse, SheetJS, Vite.</p>
 <h2>How it works</h2><ol><li>Upload or load the sample dataset.</li><li>MetricMind parses it and profiles every column.</li><li>Charts and insights are computed from that profile.</li><li>All pages share one dataset until you remove it.</li></ol>
 <h2>Future enhancements</h2><ul><li>Server-side AI models for deeper analysis</li><li>Multi-sheet workbooks and dataset joins</li><li>Saved dashboards and PDF export</li></ul></div>;