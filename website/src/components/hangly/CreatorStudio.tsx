import { ArrowUpRight, Layers, MoveUpRight, PenTool } from 'lucide-react';
import { Charm, DownloadButton, Label, Reveal } from './shared';

export default function CreatorStudio() {
  return <section id="create" className="creator-studio section wrap" aria-labelledby="creator-studio-title">
    <Reveal className="product-highlights">
      <article className="highlight-card physics-highlight"><div className="highlight-visual"><div className="feature-hanging"><span className="thread"/><Charm name="nimbuMirchi" alt="Nimbu mirchi charm swinging naturally"/></div></div><div className="highlight-copy"><MoveUpRight size={19}/><h2>Natural physics<span className="orange">.</span></h2><p>Weight, momentum, and a response when you nudge it. Real-time rope physics.</p><a href="#demo">See it move <ArrowUpRight size={15}/></a></div></article>
      <article className="highlight-card custom-highlight"><div className="highlight-visual custom-highlight-visual"><div className="mini-upload"><Charm name="karuppuStatue" alt="Custom artwork"/></div><span>→</span><div className="mini-result"><span className="thread"/><Charm name="karuppuStatue" alt="Custom hanging charm"/></div></div><div className="highlight-copy"><PenTool size={19}/><h2 id="creator-studio-title">Create a charm<span className="orange">.</span></h2><p>Photos, art, logos, inside jokes, and memories — made into something you can keep close.</p><DownloadButton label="Create your own"/></div></article>
      <article className="highlight-card collect-highlight"><div className="highlight-visual collect-visual"><div><span className="thread"/><Charm name="nazar" alt="Nazar charm"/></div><div><span className="thread"/><Charm name="spiderMan" alt="Spider-Man charm"/></div><div><span className="thread"/><Charm name="vinayagarCoin" alt="Vinayagar charm"/></div></div><div className="highlight-copy"><Layers size={19}/><h2>A world to collect<span className="orange">.</span></h2><p>Lucky charms, favourite characters, and symbols that say something about you.</p><a href="#collections">Explore collections <ArrowUpRight size={15}/></a></div></article>
    </Reveal>
  </section>;
}
