import {useState} from 'react';
import {Routes,Route,Link,useLocation} from 'react-router-dom';
import {Menu} from 'lucide-react';
import {Sidebar} from './components/ui.jsx';import AIChat from './components/AIChat.jsx';import ErrorBoundary from './components/ErrorBoundary.jsx';
import {HomePage,UploadPage,PreviewPage,AnalysisPage,DashboardPage,InsightsPage,AboutPage} from './pages/pages.jsx';
export default function App(){
 const [open,setOpen]=useState(false),loc=useLocation();
 return <div className="app"><Sidebar open={open} close={()=>setOpen(false)}/>
  <div className="main"><header className="top"><button className="menu" onClick={()=>setOpen(!open)} aria-label="Menu"><Menu/></button><span className="muted">MetricMind</span></header>
   <main key={loc.pathname} className="page"><Routes><Route path="/" element={<HomePage/>}/><Route path="/upload" element={<UploadPage/>}/><Route path="/preview" element={<PreviewPage/>}/><Route path="/analysis" element={<AnalysisPage/>}/><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/insights" element={<InsightsPage/>}/><Route path="/about" element={<AboutPage/>}/></Routes></main>
   <footer><b>MetricMind</b> · AI-Powered Data Analytics Platform<div><Link to="/about">About</Link> <Link to="/about">Documentation</Link> <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></div><span className="muted sm">© 2026 MetricMind</span></footer></div>
  <ErrorBoundary label="the chat"><AIChat/></ErrorBoundary></div>;
}