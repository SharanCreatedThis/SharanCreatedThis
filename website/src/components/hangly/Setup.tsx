import { MonitorCog, Accessibility, RefreshCw, Gauge } from 'lucide-react';
import { Label, Reveal } from './shared';
const points = [
  [MonitorCog, 'Multi-monitor support', 'Choose where Hangly lives. Your setup can stay exactly how you like it.'],
  [Accessibility, 'Accessibility controls', 'Comfortable motion and interaction controls that respect your preferences.'],
  [RefreshCw, 'Silent updates', 'New versions arrive quietly, without turning your workspace into a task.'],
  [Gauge, 'Native performance', 'Built for desktop platforms so it can stay light in the background.'],
] as const;
export default function Setup() { return <section id="setup" className="setup section wrap" aria-labelledby="setup-title"><Reveal className="section-heading"><div><Label>MADE FOR THE DESKTOP YOU ALREADY HAVE.</Label><h2 id="setup-title">Works with<br/><span className="muted-heading">your setup.</span></h2></div><p>Support that is visible in the product, not hidden in a footnote.</p></Reveal><div className="setup-grid">{points.map(([Icon,title,copy])=><Reveal key={title} className="setup-item"><Icon size={20}/><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></section>; }
