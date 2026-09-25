import { Feather, Orbit, Shapes, Waves } from 'lucide-react';
import { Reveal } from './shared';
// Counted from the artwork that ships, by scripts/generate-stats.mjs. This tile
// This is a hero tile, so it carries the marketing figure rather than the
// exact one. Both come from HANGLY_STATS; neither is written here.
import { HANGLY_STATS } from '@/lib/stats/hangly';
const stats=[{icon:Waves,value:'Thousands',label:'of happy little swings'},{icon:Shapes,value:HANGLY_STATS.marketingCharmCount,label:'charms. Endless personality.'},{icon:Orbit,value:'Your style',label:'multiple ropes to make it yours'},{icon:Feather,value:'Light as air',label:'a tiny menu bar companion'}];
export default function Stats(){return <section className="stats wrap" aria-label="Hangly at a glance">{stats.map(({icon:Icon,value,label})=><Reveal className="stat" key={value}><Icon size={19} strokeWidth={1.3}/><strong>{value}</strong><p>{label}</p></Reveal>)}</section>}
