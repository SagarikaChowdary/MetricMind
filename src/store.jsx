import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {parseFile,buildDataset,sampleDataset} from './utils/data.js';
const Ctx=createContext(),KEY='metricmind.session';
export const useData=()=>useContext(Ctx);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
export function DataProvider({children}){
 const [ds,setDs]=useState(null),[busy,setBusy]=useState(''),[error,setError]=useState('');
 useEffect(()=>{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s)setDs(buildDataset(s.name,s.rows,s.size))}catch{}},[]);
 const commit=d=>{setDs(d);try{const s=JSON.stringify({name:d.name,size:d.size,rows:d.rows});s.length<3e6?localStorage.setItem(KEY,s):localStorage.removeItem(KEY)}catch{}};
 const run=async(label,fn)=>{setError('');try{setBusy(label);await delay(250);commit(await fn());return true}catch(e){setError(e.message);return false}finally{setBusy('')}};
 const loadFile=useCallback(f=>run('Analyzing data...',async()=>buildDataset(f.name,await parseFile(f),f.size)),[]);
 const loadSample=useCallback(()=>run('Generating dashboard...',async()=>sampleDataset()),[]);
 const clear=()=>{setDs(null);setError('');try{localStorage.removeItem(KEY)}catch{}};
 return <Ctx.Provider value={{ds,busy,error,setError,loadFile,loadSample,clear}}>{children}</Ctx.Provider>;
}
