import { MonitorCog, Accessibility, RefreshCw, Gauge } from 'lucide-react';
import { Label, Reveal } from './shared';
const points = [
  [MonitorCog, 'Multi-monitor support', 'Choose which display Hangly hangs on. Your setup stays exactly how you like it.'],
  [Accessibility, 'Gentle by design', 'Hangly follows your Reduce Motion setting, and clicks pass straight through to your desktop everywhere but the charm.'],
  [RefreshCw, 'One-press updates', 'Hangly checks every hour. When a new version is out, a card under your charm offers it: one press, and Hangly updates and restarts by itself.'],
  [Gauge, 'Native performance', 'Built for desktop platforms so it can stay light in the background.'],
] as const;
export default function Setup() { return <section id="setup" className="setup section wrap" aria-labelledby="setup-title"><Reveal className="section-heading"><div><Label>MADE FOR THE DESKTOP YOU ALREADY HAVE.</Label><h2 id="setup-title">Works with<br/><span className="muted-heading">your setup.</span></h2></div><p>Support that is visible in the product, not hidden in a footnote.</p></Reveal><div className="setup-grid">{points.map(([Icon,title,copy])=><Reveal key={title} className="setup-item"><Icon size={20}/><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></section>; }
