import { ArrowUpRight, Instagram } from 'lucide-react';
import { Label, Reveal, Parallax } from './shared';
import CoffeeSupport from './CoffeeSupport';

export default function Creator() {
  return (
    <section id="about" className="creator section wrap">
      <Reveal className="creator-grid">
        <Parallax className="creator-portrait" distance={24}>
          <img className="creator-photo" src="/creator-sharan.png" alt="Sharan, creator of Hangly" width={1684} height={2528} loading="lazy" />
          <span className="portrait-caption">A HUMAN BEHIND THE PIXELS.</span>
        </Parallax>
        <div className="creator-copy">
          <Label>MADE WITH FEELING. IN INDIA.</Label>
          <h2>Small details.<br />A lot of heart.</h2>
          <p className="creator-byline">Created by Sharan <span>↗</span></p>
          <p>Designer, filmmaker and creator who loves building delightful digital experiences.</p>
          <p>Hangly is a little reminder that the things we use every day can make us feel something, too.</p>
          <a className="instagram-link" href="https://www.instagram.com/sharan.created.this/" target="_blank" rel="noopener noreferrer">
            <Instagram size={18} /><span>Follow on Instagram<small>@sharan.created.this</small></span><ArrowUpRight size={20} />
          </a>
          <CoffeeSupport />
        </div>
      </Reveal>
    </section>
  );
}
