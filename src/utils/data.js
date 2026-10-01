import Papa from 'papaparse';import * as XLSX from 'xlsx';
const empty=v=>v===null||v===undefined||String(v).trim()==='';
const num=v=>typeof v==='number'?v:(!empty(v)&&!isNaN(Number(String(v).replace(/[,₹$]/g,''))))?Number(String(v).replace(/[,₹$]/g,'')):NaN;
export const fmt=n=>n==null||isNaN(n)?'–':Math.abs(n)>=1000?n.toLocaleString('en-IN',{maximumFractionDigits:0}):(+n.toFixed(2)).toString();
export async function parseFile(file){
 const ext=file.name.split('.').pop().toLowerCase();let rows;
 try{
  if(ext==='csv')rows=await new Promise((ok,no)=>Papa.parse(file,{header:true,skipEmptyLines:true,dynamicTyping:true,complete:r=>ok(r.data),error:no}));
  else if(ext==='xlsx'||ext==='xls'){const wb=XLSX.read(await file.arrayBuffer());rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:null})}
  else if(ext==='json'){const j=JSON.parse(await file.text());rows=Array.isArray(j)?j:Object.values(j).find(Array.isArray)||[j]}
  else throw new Error('fmt');
 }catch(e){throw new Error(e.message==='fmt'?'Unsupported file format. Please upload CSV, XLSX, or JSON.':"We couldn't read this file. Please check the file format.")}
 rows=rows.filter(r=>r&&typeof r==='object');
 if(!rows.length)throw new Error('The uploaded dataset does not contain any records.');
 return rows;
}
export function buildDataset(name,rows,size=0){
 const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
 rows=rows.map(r=>Object.fromEntries(keys.map(k=>[k,empty(r[k])?null:r[k]])));
 const total0=rows.length,kept=rows.filter(r=>!Object.values(r).some(v=>typeof v==='string'&&/^\s*(grand\s*|sub\s*)?totals?\s*$/i.test(v)));
 if(kept.length)rows=kept;const removedTotals=total0-rows.length;
 const cols=keys.map(k=>{
  const vals=rows.map(r=>r[k]),f=vals.filter(v=>v!==null),n=f.length;let type='string';
  if(n){
   if(f.every(v=>typeof v==='boolean'||/^(true|false)$/i.test(v)))type='boolean';
   else if(f.filter(v=>!isNaN(num(v))).length/n>=.9)type='number';
   else if(f.filter(v=>typeof v==='string'&&/\d/.test(v)&&/[-\/]/.test(v)&&!isNaN(Date.parse(v))).length/n>=.9)type='date';
  }
  const col={name:k,type,missing:vals.length-n,empty:n===0};
  if(type==='number'){const a=f.map(num).filter(x=>!isNaN(x)).sort((x,y)=>x-y),s=a.reduce((p,c)=>p+c,0),m=s/a.length;
   col.stats={mean:m,median:a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2,min:a[0],max:a[a.length-1],sum:s,std:Math.sqrt(a.reduce((p,c)=>p+(c-m)**2,0)/a.length),count:a.length};
   col.invalid=n-a.length}
  else{const c={};f.forEach(v=>c[v]=(c[v]||0)+1);const fr=Object.entries(c).sort((a,b)=>b[1]-a[1]);col.unique=fr.length;col.top=fr[0]?.[0];col.freq=fr.slice(0,10)}
  return col});
 const seen=new Set();let dup=0;rows.forEach(r=>{const s=JSON.stringify(r);seen.has(s)?dup++:seen.add(s)});
 const ds={name,size,rows,cols,removedTotals,loadedAt:new Date().toISOString(),dup,missing:cols.reduce((a,c)=>a+c.missing,0),
  numeric:cols.filter(c=>c.type==='number').length,emptyCols:cols.filter(c=>c.empty).map(c=>c.name)};
 ds.charts=autoCharts(ds);ds.insights=makeInsights(ds);return ds;
}
const catCols=ds=>ds.cols.filter(c=>c.type==='string'&&c.unique>1&&c.unique<=20);
export function chartData(ds,type,x,y){
 const rows=ds.rows,X=ds.cols.find(c=>c.name===x),Y=y&&y!=='(count)'?ds.cols.find(c=>c.name===y):null;
 if(type==='histogram'){const a=rows.map(r=>num(r[x])).filter(v=>!isNaN(v));if(!a.length)return[];const mn=Math.min(...a),mx=Math.max(...a),b=Math.min(10,Math.max(3,Math.ceil(Math.sqrt(a.length)))),w=(mx-mn)/b||1;
  const bins=Array.from({length:b},(_,i)=>({name:fmt(mn+i*w),value:0}));a.forEach(v=>bins[Math.min(b-1,Math.floor((v-mn)/w))].value++);return bins}
 if(type==='scatter')return rows.map(r=>({x:num(r[x]),y:num(r[y])})).filter(p=>!isNaN(p.x)&&!isNaN(p.y)).slice(0,1000);
 const g={};rows.forEach(r=>{if(r[x]===null)return;const k=String(r[x]);g[k]=g[k]||[0,0];g[k][1]++;if(Y){const v=num(r[y]);if(!isNaN(v))g[k][0]+=v}});
 let out=Object.entries(g).map(([name,[s,c]])=>({name,value:+(Y?s:c).toFixed(2)}));
 if(X?.type==='date')out.sort((a,b)=>Date.parse(a.name)-Date.parse(b.name));
 else if(X?.type==='number')out.sort((a,b)=>a.name-b.name);
 else out.sort((a,b)=>b.value-a.value);
 return out.slice(0,X?.type==='date'?60:12);
}
export function autoCharts(ds){
 const C=[],nums=ds.cols.filter(c=>c.type==='number'&&!c.empty),dates=ds.cols.filter(c=>c.type==='date'),cats=catCols(ds);
 const main=nums.find(c=>/revenue|sales|amount|total|price/i.test(c.name))||nums[0];
 if(dates[0]&&main)C.push({title:`${main.name} trend`,type:'line',x:dates[0].name,y:main.name});
 if(main)cats.slice(0,3).forEach(c=>C.push({title:`${main.name} by ${c.name}`,type:'bar',x:c.name,y:main.name}));
 if(cats[0])C.push({title:`${cats[0].name} distribution`,type:'doughnut',x:cats[0].name,y:'(count)'});
 nums.slice(0,2).forEach(c=>C.push({title:`${c.name} distribution`,type:'histogram',x:c.name}));
 return C.slice(0,6).map(c=>({...c,data:chartData(ds,c.type,c.x,c.y)}));
}
function corr(ds,a,b){const p=ds.rows.map(r=>[num(r[a]),num(r[b])]).filter(([x,y])=>!isNaN(x)&&!isNaN(y));if(p.length<5)return 0;
 const mx=p.reduce((s,q)=>s+q[0],0)/p.length,my=p.reduce((s,q)=>s+q[1],0)/p.length;let n=0,dx=0,dy=0;p.forEach(([x,y])=>{n+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2});return dx&&dy?n/Math.sqrt(dx*dy):0}
export function makeInsights(ds){
 const I={key:[],trends:[],anomalies:[],quality:[],recs:[]},nums=ds.cols.filter(c=>c.type==='number'&&!c.empty);
 const main=nums.find(c=>/revenue|sales|amount|total/i.test(c.name))||nums[0];
 I.key.push(`The dataset has ${ds.rows.length.toLocaleString()} records across ${ds.cols.length} columns (${ds.numeric} numeric).`);
 if(main)I.key.push(`Total ${main.name} is ${fmt(main.stats.sum)} with an average of ${fmt(main.stats.mean)} per record.`);
 catCols(ds).slice(0,3).forEach(c=>{
  const t=ds.rows.length-c.missing,[v,n]=c.freq[0];I.key.push(`"${v}" is the most frequent ${c.name} and accounts for ${(n/t*100).toFixed(0)}% of records.`);
  if(main){const d=chartData(ds,'bar',c.name,main.name);if(d.length>1)I.key.push(`${d[0].name} has the highest ${main.name} by ${c.name} (${fmt(d[0].value)}), ${(d[0].value/main.stats.sum*100).toFixed(0)}% of the total.`)}});
 const dc=ds.cols.find(c=>c.type==='date');
 if(dc&&main){const d=chartData(ds,'line',dc.name,main.name);if(d.length>=4){const h=Math.floor(d.length/2),a=d.slice(0,h).reduce((p,c)=>p+c.value,0),b=d.slice(h).reduce((p,c)=>p+c.value,0);
  if(a)I.trends.push(`${main.name} ${b>=a?'increased':'decreased'} by ${Math.abs((b-a)/a*100).toFixed(0)}% in the second half of the period (${d[h].name} onward) versus the first.`);
  const pk=d.reduce((p,c)=>c.value>p.value?c:p);I.trends.push(`Peak ${main.name} occurred on ${pk.name} (${fmt(pk.value)}).`)}}
 for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++){const r=corr(ds,nums[i].name,nums[j].name);if(Math.abs(r)>=.6)I.trends.push(`${nums[i].name} and ${nums[j].name} are ${r>0?'positively':'negatively'} correlated (r = ${r.toFixed(2)}).`)}
 if(!I.trends.length)I.trends.push('No strong time trends or correlations were detected.');
 nums.forEach(c=>{const{mean,std}=c.stats;if(std){const o=ds.rows.filter(r=>Math.abs(num(r[c.name])-mean)>3*std).length;if(o)I.anomalies.push(`${c.name} has ${o} unusual value(s) more than 3 standard deviations from the mean.`)}if(c.invalid)I.anomalies.push(`${c.name} contains ${c.invalid} non-numeric value(s).`)});
 if(!I.anomalies.length)I.anomalies.push('No statistical outliers were detected.');
 if(ds.removedTotals)I.quality.push(`Removed ${ds.removedTotals} summary row(s) such as "Grand Total" so totals are not double counted.`);
 I.quality.push(`The dataset contains ${ds.missing} missing value(s) and ${ds.dup} duplicate row(s).`);
 ds.cols.filter(c=>c.missing>0).sort((a,b)=>b.missing-a.missing).slice(0,3).forEach(c=>I.quality.push(`${c.name} is missing ${c.missing} value(s) (${(c.missing/ds.rows.length*100).toFixed(1)}%).`));
 if(ds.emptyCols.length)I.quality.push(`Empty columns: ${ds.emptyCols.join(', ')}.`);
 if(ds.dup)I.recs.push('Remove duplicate rows before reporting totals.');
 if(ds.missing)I.recs.push('Fill or exclude missing values in the columns listed under Data Quality.');
 if(ds.emptyCols.length)I.recs.push('Drop empty columns to simplify analysis.');
 if(!I.anomalies[0].startsWith('No'))I.recs.push('Review outlier records; they may be errors or high-value cases.');
 if(!nums.length)I.recs.push('No numeric columns were detected for statistical analysis.');
 if(!I.recs.length)I.recs.push('Data looks clean. Explore breakdowns in the Chart Builder.');
 return I;
}
// Gemini integration: set VITE_GEMINI_API_KEY in .env (see .env.example). Falls back to rule-based answers.
function datasetContext(ds){
 const main=ds.cols.find(c=>c.type==='number'&&/revenue|sales|amount|total/i.test(c.name))||ds.cols.find(c=>c.type==='number');
 const cols=ds.cols.map(c=>({name:c.name,type:c.type,missing:c.missing,...(c.stats?{mean:c.stats.mean,median:c.stats.median,min:c.stats.min,max:c.stats.max,sum:c.stats.sum}:{unique:c.unique,top_values:c.freq?.slice(0,8)})}));
 const groups=main?Object.fromEntries(catCols(ds).slice(0,4).map(c=>[`${main.name} by ${c.name}`,chartData(ds,'bar',c.name,main.name)])):{};
 const dates=ds.cols.find(c=>c.type==='date'),trend=dates&&main?chartData(ds,'line',dates.name,main.name).slice(-24):null;
 return JSON.stringify({name:ds.name,rows:ds.rows.length,duplicates:ds.dup,missing:ds.missing,columns:cols,group_totals:groups,trend,insights:ds.insights,sample_rows:ds.rows.slice(0,8)});
}
export async function askAI(q,ds){
 const key=import.meta.env.VITE_GEMINI_API_KEY;
 if(!key)return ruleAnswer(q,ds);
 const models=[...new Set([import.meta.env.VITE_GEMINI_MODEL,'gemini-2.5-flash','gemini-2.5-flash-lite'].filter(Boolean))];
 const body=JSON.stringify({systemInstruction:{parts:[{text:'You are MetricMind, a data analyst assistant. Answer ONLY from the dataset summary provided. Be concise (under 120 words), use exact numbers from the summary, and say so if the data cannot answer the question.\n\nDATASET SUMMARY:\n'+datasetContext(ds)}]},contents:[{role:'user',parts:[{text:q}]}],generationConfig:{temperature:.2,maxOutputTokens:2048}});
 let last='';
 for(const model of models){ // tries the next model when one is busy, slow or unavailable
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),20000);
  try{
   const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json','x-goog-api-key':key},body});
   const j=await r.json();
   if(r.ok){const t=j.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('');if(t)return t;last='Empty response';continue}
   last=j.error?.message||'Request failed';
   if([400,401,403].includes(r.status)&&!/model/i.test(last))break; // key problem: other models will fail too
  }catch(e){last=e.name==='AbortError'?'request timed out':String(e.message)}
  finally{clearTimeout(tm)}
 }
 return `Gemini could not answer (${last.slice(0,140)}). Built-in analysis: `+ruleAnswer(q,ds);
}
export function ruleAnswer(q,ds){
 const s=q.toLowerCase().replace(/[?!.,]/g,' '),w=re=>re.test(s),nums=ds.cols.filter(c=>c.type==='number'&&c.stats),strs=ds.cols.filter(c=>c.type==='string'&&c.unique>1);
 const named=ds.cols.filter(c=>new RegExp('\\b'+c.name.toLowerCase().replace(/[^a-z0-9 ]/g,'.')+'s?\\b').test(s));
 const money=nums.find(c=>/revenue|sales|amount|total|income/i.test(c.name))||nums[0];
 const num=named.find(c=>c.type==='number')||(w(/\b(sales?|money|income|earnings?)\b/)?money:null)||money;
 const cat=named.find(c=>c.type==='string')||(w(/\bcategor/)&&strs.find(c=>/categor/i.test(c.name)))||(w(/\bregion|area/)&&strs.find(c=>/region|area/i.test(c.name)))||null;
 const sw=s.match(/\b(sales?|revenue|money|income|earnings?|profit)\b/);
 if(sw&&!named.some(c=>c.type==='number')&&!nums.some(c=>/revenue|sales|amount|income|profit/i.test(c.name)))return `This dataset has no ${sw[1]} column. Numeric columns: ${nums.map(c=>c.name).join(', ')||'none'}. Try asking about one of those.`;
 if(w(/\b(data quality|quality|clean|health)\b/))return ds.insights.quality.join(' ');
 if(w(/\b(missing|null|blank|empty)\b/))return ds.missing?`There are ${ds.missing} missing values: `+ds.cols.filter(c=>c.missing).map(c=>`${c.name} (${c.missing})`).join(', ')+'.':'There are no missing values.';
 if(w(/\bduplicates?\b/))return `There are ${ds.dup} duplicate rows.`;
 if(w(/\b(trend|over time|growth)\b/))return ds.insights.trends.join(' ');
 if(w(/\b(insights?|summary|summari[sz]e|overview|important|describe)\b/))return [...ds.insights.key.slice(0,4),...ds.insights.trends.slice(0,1)].join(' ');
 if(w(/\bhow many\b/)&&named.length&&named[0].type==='string')return `${named[0].name} has ${named[0].unique} unique values.`;
 if(w(/\b(rows?|records?|entries)\b/))return `The dataset has ${ds.rows.length.toLocaleString()} rows.`;
 if(w(/\b(columns?|fields?)\b/))return `There are ${ds.cols.length} columns: ${ds.cols.map(c=>`${c.name} (${c.type})`).join(', ')}.`;
 const grp=(c,low)=>{const d=chartData(ds,'bar',c.name,num.name);return d.length?{...(low?d[d.length-1]:d[0])}:null};
 const hi=w(/\b(highest|top|best|most|largest|biggest|max|maximum)\b/),lo=w(/\b(lowest|least|worst|smallest|min|minimum)\b/);
 if((hi||lo)&&num){const c=cat||(w(/\b(which|what|who)\b/)||w(/\bby\b/)?strs[0]:null);
  if(c){const r=grp(c,lo);if(r)return `${r.name} has the ${lo?'lowest':'highest'} total ${num.name} by ${c.name} (${fmt(r.value)}).`}
  return `The ${lo?'lowest':'highest'} ${num.name} is ${fmt(lo?num.stats.min:num.stats.max)}.`}
 if(w(/\b(average|mean|avg)\b/)&&num)return `The average ${num.name} is ${fmt(num.stats.mean)}.`;
 if(w(/\b(total|sum)\b/)&&num)return `The total ${num.name} is ${fmt(num.stats.sum)}.`;
 if(w(/\bmedian\b/)&&num)return `The median ${num.name} is ${fmt(num.stats.median)}.`;
 if(named[0]){const c=named[0];return c.stats?`${c.name}: mean ${fmt(c.stats.mean)}, median ${fmt(c.stats.median)}, min ${fmt(c.stats.min)}, max ${fmt(c.stats.max)}, total ${fmt(c.stats.sum)}.`:`${c.name} has ${c.unique??0} unique values. Most frequent: ${c.top}.`}
 const ex=nums[0]?.name||'a column',ec=strs[0]?.name||'a column';return `I can answer questions like: average ${ex}, total ${ex}, which ${ec} has the highest ${ex}, are there missing values, data quality, show the trend, or key insights.`;
}
export function sampleDataset(){
 const P=[['Laptop','Electronics',55000],['Smartphone','Electronics',28000],['Headphones','Electronics',3500],['Office Chair','Furniture',7500],['Desk','Furniture',12000],['Notebook Set','Stationery',450],['Pen Pack','Stationery',200],['Running Shoes','Apparel',4200],['Jacket','Apparel',3800]];
 const R=['North','South','East','West'],U=['Aarav','Diya','Rohan','Meera','Kabir','Ananya','Vikram','Isha'];let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 const rows=Array.from({length:72},(_,i)=>{const p=P[Math.floor(rnd()*P.length)],q=1+Math.floor(rnd()*6),d=new Date(2025,0,1+i*5);
  return{Date:d.toISOString().slice(0,10),Product:p[0],Category:p[1],Region:R[Math.floor(rnd()*4)],Quantity:q,Price:p[2],Revenue:q*p[2],Customer:U[Math.floor(rnd()*8)],Rating:i%17===0?null:+(3+rnd()*2).toFixed(1)}});
 return buildDataset('Sales Analytics (sample)',rows);
}

export function smartKpis(ds){
 const nums=ds.cols.filter(c=>c.type==='number'&&c.stats),cats=ds.cols.filter(c=>c.type==='string'&&c.unique>1&&c.unique<=20);
 const main=nums.find(c=>/revenue|sales|amount|total/i.test(c.name))||nums[0],K=[{label:'Total records',value:ds.rows.length.toLocaleString()}];
 if(main){K.push({label:`Total ${main.name}`,value:fmt(main.stats.sum)},{label:`Average ${main.name}`,value:fmt(main.stats.mean),sub:`Median ${fmt(main.stats.median)}`});
  const topOf=c=>{const d=chartData(ds,'bar',c.name,main.name);return d.length>1?{n:d[0].name,p:Math.round(d[0].value/main.stats.sum*100)}:null};
  const cat=cats.find(c=>/categor|type|segment/i.test(c.name))||cats[0],reg=cats.find(c=>/region|area|city|state|country/i.test(c.name)&&c!==cat);
  const tc=cat&&topOf(cat),tr=reg&&topOf(reg);
  if(tc)K.push({label:`Top ${cat.name}`,value:tc.n,sub:`${tc.p}% of ${main.name}`});
  if(tr)K.push({label:`Top ${reg.name}`,value:tr.n,sub:`${tr.p}% of ${main.name}`});
  const dc=ds.cols.find(c=>c.type==='date');
  if(dc){const d=chartData(ds,'line',dc.name,main.name);if(d.length>=4){const h=Math.floor(d.length/2),a=d.slice(0,h).reduce((p,c)=>p+c.value,0),b=d.slice(h).reduce((p,c)=>p+c.value,0);if(a)K.push({label:'Growth',value:`${b>=a?'+':'-'}${Math.abs((b-a)/a*100).toFixed(0)}%`,sub:'Second half vs first half'})}}}
 const units=nums.find(c=>/quantity|units|qty/i.test(c.name));if(units)K.push({label:`Total ${units.name}`,value:fmt(units.stats.sum)});
 const rate=nums.find(c=>/rating|score/i.test(c.name));if(rate)K.push({label:`Average ${rate.name}`,value:fmt(rate.stats.mean)});
 const cust=ds.cols.find(c=>c.type==='string'&&/customer|client|user/i.test(c.name));if(cust)K.push({label:`Unique ${cust.name}s`,value:cust.unique});
 const cells=ds.rows.length*ds.cols.length;K.push({label:'Data completeness',value:`${(100-ds.missing/cells*100).toFixed(1)}%`,sub:`${ds.missing} missing values`});
 return K.slice(0,10);
}