import { Feather, Palette, Shapes, Users } from 'lucide-react';
import { Reveal } from './shared';
import { HANGLY_STATS } from '@/lib/stats/hangly';
const stats=[
 {icon:Shapes,value:`${HANGLY_STATS.marketingCharmCount} charms`,label:'a little collection for every mood'},
 {icon:Users,value:`${HANGLY_STATS.marketingUserCount} users`,label:'making their desktops feel like home'},
 {icon:Palette,value:'Your style',label:'make every hanging charm feel like yours'},
 {icon:Feather,value:'Light as air',label:'a tiny companion that stays out of the way'},
];
export default function Stats(){return <section className="stats wrap" aria-label="Hangly at a glance">{stats.map(({icon:Icon,value,label})=><Reveal className="stat" key={value}><Icon size={19} strokeWidth={1.3}/><strong>{value}</strong><p>{label}</p></Reveal>)}</section>}
