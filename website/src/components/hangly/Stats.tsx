import { Feather, Orbit, Shapes, Waves } from 'lucide-react';
import { Reveal } from './shared';
const stats=[{icon:Waves,value:'Thousands',label:'of happy little swings'},{icon:Shapes,value:'30+',label:'charms. Endless personality.'},{icon:Orbit,value:'Your style',label:'multiple ropes to make it yours'},{icon:Feather,value:'Light as air',label:'a tiny menu bar companion'}];
export default function Stats(){return <section className="stats wrap" aria-label="Hangly at a glance">{stats.map(({icon:Icon,value,label})=><Reveal className="stat" key={value}><Icon size={19} strokeWidth={1.3}/><strong>{value}</strong><p>{label}</p></Reveal>)}</section>}
