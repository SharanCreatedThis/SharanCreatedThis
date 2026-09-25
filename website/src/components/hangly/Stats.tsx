import { Feather, Orbit, Shapes, Waves } from 'lucide-react';
import { Reveal } from './shared';
// Counted from the artwork that ships, by scripts/generate-stats.mjs. This tile
// read "80+" for a while, which no file in the repository supported.
import { CHARM_TOTAL } from '@/data/stats.generated';
const stats=[{icon:Waves,value:'Thousands',label:'of happy little swings'},{icon:Shapes,value:`${CHARM_TOTAL}`,label:'charms. Endless personality.'},{icon:Orbit,value:'Your style',label:'multiple ropes to make it yours'},{icon:Feather,value:'Light as air',label:'a tiny menu bar companion'}];
export default function Stats(){return <section className="stats wrap" aria-label="Hangly at a glance">{stats.map(({icon:Icon,value,label})=><Reveal className="stat" key={value}><Icon size={19} strokeWidth={1.3}/><strong>{value}</strong><p>{label}</p></Reveal>)}</section>}
