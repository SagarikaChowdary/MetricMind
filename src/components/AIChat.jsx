import {useState,useRef,useEffect} from 'react';
import {MessageCircle,X,Send} from 'lucide-react';
import {useData} from '../store.jsx';import {askAI} from '../utils/data.js';
export default function AIChat(){
 const {ds}=useData(),[open,setOpen]=useState(false),[q,setQ]=useState(''),[wait,setWait]=useState(false),[msgs,setMsgs]=useState([{r:'ai',t:'Ask me about the loaded dataset: averages, top categories, missing values, trends.'}]),end=useRef();
 useEffect(()=>{end.current?.scrollIntoView?.({block:'end'})},[msgs,open,wait]);
 const send=async e=>{e.preventDefault();const t=q.trim();if(!t||wait)return;setQ('');setMsgs(m=>[...m,{r:'me',t}]);setWait(true);
  let a;try{a=ds?await askAI(t,ds):'Load a dataset first (Upload Dataset or Try Sample Dataset), then ask me about it.'}catch(err){console.error(err);a='Sorry, I could not answer that. Try rephrasing, for example "What is the average revenue?"'}
  setWait(false);setMsgs(m=>[...m,{r:'ai',t:a||'I could not find an answer to that.'}])};
 return <>{open&&<div className="chat"><div className="chead">Ask MetricMind<button onClick={()=>setOpen(false)}><X size={16}/></button></div>
  <div className="cbody">{msgs.map((m,i)=><div key={i} className={'msg '+m.r}>{String(m.t)}</div>)}{wait&&<div className="msg ai">Thinking...</div>}<div ref={end}/></div>
  <form onSubmit={send}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="What is the average sales?"/><button type="submit" className="btn" aria-label="Send" disabled={wait}><Send size={15}/></button></form></div>}
  <button className="fab" onClick={()=>setOpen(!open)}><MessageCircle size={18}/>Ask MetricMind</button></>;
}