import {Component} from 'react';
export default class ErrorBoundary extends Component{
 state={err:null};
 static getDerivedStateFromError(err){return{err}}
 componentDidCatch(err,info){console.error('MetricMind error:',err,info)}
 render(){
  if(!this.state.err)return this.props.children;
  const msg=String(this.state.err?.message||this.state.err);
  return <div style={{margin:'1rem',padding:'1rem',border:'1px solid #1F4959',borderRadius:12,background:'#05192b',color:'#fff',maxWidth:560}}>
   <b>Something went wrong{this.props.label?` in ${this.props.label}`:''}.</b>
   <p style={{color:'#9fb6c0',wordBreak:'break-word'}}>{msg}</p>
   <button className="btn" onClick={()=>this.setState({err:null})}>Try again</button></div>}
}