import { ArrowUpRight, Github, Instagram, Linkedin, Palette, Youtube, type LucideIcon } from 'lucide-react';
import { Label, Reveal, Parallax } from './shared';
import CoffeeSupport from './CoffeeSupport';

type Social = { label: string; detail: string; href: string; Icon?: LucideIcon; brandIcon?: boolean };
const socials: Social[] = [
  { label: 'Instagram', detail: '@sharan.created.this', href: 'https://www.instagram.com/sharan.created.this/', Icon: Instagram },
  { label: 'TheStudio', detail: 'sharancreatedthis.in', href: 'https://sharancreatedthis.in/', brandIcon: true },
  { label: 'GitHub', detail: 'SharanCreatedThis', href: 'https://github.com/SharanCreatedThis', Icon: Github },
  { label: 'LinkedIn', detail: 'sharan-created-this', href: 'https://www.linkedin.com/in/sharan-created-this/', Icon: Linkedin },
  { label: 'Behance', detail: 'sharancreatedthis', href: 'https://www.behance.net/sharancreatedthis', Icon: Palette },
  { label: 'YouTube', detail: '@sharancreatedthis1', href: 'https://www.youtube.com/@sharancreatedthis1', Icon: Youtube },
];

export default function Creator() {
  return <section id="about" className="creator section wrap"><Reveal className="creator-grid"><Parallax className="creator-portrait" distance={24}><img className="creator-photo" src="/creator-sharan.png" alt="Sharan, creator of Hangly" width={1684} height={2528} loading="lazy"/><span className="portrait-caption">A HUMAN BEHIND THE PIXELS.</span></Parallax><div className="creator-copy"><Label>BUILT INDEPENDENTLY. IN INDIA.</Label><h2>Could a desktop feel<br/>a little more personal?</h2><p className="creator-byline">Built by Sharan.created.this <span>↗</span></p><p>Hangly started with a simple idea: a desktop can carry a little more of the things that matter to you.</p><p>Built independently. Actively maintained. Continuously updated.</p><div className="creator-socials" aria-label="Follow Sharan Created This">{socials.map(({ label, detail, href, Icon, brandIcon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">{brandIcon ? <span className="creator-studio-mark" aria-hidden="true"/> : Icon && <Icon size={18}/>}<span><strong>{label}</strong><small>{detail}</small></span><ArrowUpRight size={15}/></a>)}</div><CoffeeSupport/></div></Reveal></section>;
}
