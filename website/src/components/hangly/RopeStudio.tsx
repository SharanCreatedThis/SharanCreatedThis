import { HANGLY_ROPES } from '@/lib/hangly-product';
import { Label, Reveal } from './shared';

export default function RopeStudio() {
  return <section id="rope-styles" className="rope-studio section wrap" aria-labelledby="rope-studio-title">
    <Reveal className="section-heading"><div><Label>NINE WAYS TO HANG ON.</Label><h2 id="rope-studio-title">Rope studio<span className="orange">.</span></h2></div><p>Materials give each charm a different kind of presence.</p></Reveal>
    <ol className="rope-list">{HANGLY_ROPES.map((rope, index) => <li key={rope.name}><span className={`rope-swatch rope-${index + 1}`} aria-hidden="true"/><div><strong>{rope.name}</strong><span>{rope.material}</span></div><em>{rope.personality}</em></li>)}</ol>
  </section>;
}
