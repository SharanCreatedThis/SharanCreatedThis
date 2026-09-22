"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Instagram, Linkedin } from "lucide-react";
import { profile } from "@/data/portfolio";

export function EditorialHero() {
  const portrait = useRef<HTMLImageElement>(null);
  const [portraitReady, setPortraitReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = portrait.current;
    if (!image) return;

    // Keep the server-rendered image hidden until its pixels are decoded.
    // This also handles cached images without restarting a visible portrait.
    image.decode().catch(() => {}).then(() => {
      if (!cancelled) setPortraitReady(true);
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className="editorial-hero"
      aria-label="Sharan, creative technologist"
    >
      <div className="editorial-frame">
        <div className="editorial-white-panel" aria-hidden="true" />
        <div className="editorial-ribbons" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <noscript>
          <style>{`.editorial-hero .editorial-portrait img { opacity: 1 !important; }`}</style>
        </noscript>
        <div className="editorial-portrait">
          <img
            ref={portrait}
            data-ready={portraitReady}
            src="/portfolio/sharan-white-suit.webp"
            alt="Sharan, filmmaker, designer and product builder"
            width={1757}
            height={2220}
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="editorial-intro">
          <span className="editorial-pill">Sharan · Creative Technologist</span>
          <h1>
            <span className="editorial-title-line">Sharan</span>{" "}
            <span className="editorial-title-line">created</span>{" "}
            <span className="editorial-title-line">this.</span>
          </h1>
          <Link className="editorial-button" href="/portfolio">
            Explore my world <ArrowUpRight size={16} />
          </Link>
        </div>
        <aside className="editorial-note">
          <span className="editorial-mini-pill">ONE MIND</span>
          <h2>
            A filmmaker’s eye.
            <br />A designer’s instinct.
            <br />
            <span>A builder’s curiosity.</span>
            <br />
            Always creating.
          </h2>
          <p>
            Films. Photography.
            <br />
            Design. Software.
            <br />
            One connected creative world.
          </p>
        </aside>
        <div className="editorial-stats">
          <div>
            <span>
              Stories created <i><ArrowUpRight className="inline-arrow" aria-hidden="true" /></i>
            </span>
            <strong>
              180<span>+</span>
            </strong>
            <small>Films & videos</small>
          </div>
          <div>
            <span>
              Across India <i><ArrowUpRight className="inline-arrow" aria-hidden="true" /></i>
            </span>
            <strong>
              20<span>+</span>
            </strong>
            <small>States explored</small>
          </div>
        </div>
        <div className="editorial-socials">
          <a
            href={profile.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <Instagram size={16} />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
          <a
            href={profile.behance}
            target="_blank"
            rel="noreferrer"
            aria-label="Behance"
          >
            <span>Bē</span>
          </a>
        </div>
        <Link href="/about" className="editorial-quote">
          <div className="editorial-quote-author">
            <img src={profile.portrait} alt="" width={900} height={1351} />
            <span>
              Sharan<small>Creator & builder</small>
            </span>
            <ArrowUpRight size={17} />
          </div>
          <p>
            “Different mediums.
            <br />
            Same restless mind.”
          </p>
          <span className="editorial-quote-link">
            The story behind the work <ArrowUpRight className="inline-arrow" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
}
