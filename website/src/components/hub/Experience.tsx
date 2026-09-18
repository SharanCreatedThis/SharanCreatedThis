"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, ArrowRight, X, ScanFace, Plus } from "lucide-react";
import {
  profile,
  projects,
  categories,
  metrics,
  journey,
} from "@/data/portfolio";
import { HanglyPreview } from "./HanglyPreview";
import { products } from "@/data/products";

export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span /> {children}
    </div>
  );
}
export { EditorialHero as Hero } from "./EditorialHero";

const worlds = [
  {
    name: "Films",
    tag: "STORIES THAT STAY.",
    text: "People. Places. Perspectives. Finding the extraordinary in the real.",
    href: "/portfolio",
    className: "film-world",
  },
  {
    name: "Photography",
    tag: "A DIFFERENT WAY OF SEEING.",
    text: "A moment held still. A feeling that keeps moving.",
    href: "/portfolio?category=Photography",
    className: "photo-world",
  },
  {
    name: "Design",
    tag: "INTENTION IN EVERY DETAIL.",
    text: "Visual identities and experiences built around a point of view.",
    href: "/portfolio?category=Creative%20Direction",
    className: "design-world",
  },
  {
    name: "Products",
    tag: "IDEAS YOU CAN INTERACT WITH.",
    text: "Thoughtful software. A little curiosity, made tangible.",
    href: "/products",
    className: "product-world",
  },
];
export function Worlds() {
  const [active, setActive] = useState(0);
  return (
    <section id="worlds" className="section worlds">
      <div className="world-content">
        <Reveal>
          <div className="section-heading">
            <div>
              <Label>01 / MY WORLD</Label>
              <h2>
                Different mediums.
                <br />
                <span className="muted">Same restless mind.</span>
              </h2>
            </div>
            <p>
              I follow the idea.
              <br />
              Wherever it takes me.
            </p>
          </div>
        </Reveal>
        <div className="world-tabs" role="tablist" aria-label="Creative worlds">
          {worlds.map((w, i) => (
            <button
              key={w.name}
              id={`world-tab-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-controls="world-panel"
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (active + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                  setActive(next);
                  document.getElementById(`world-tab-${next}`)?.focus();
                }
              }}
            >
              <span>0{i + 1}</span>
              {w.name}
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            id="world-panel"
            role="tabpanel"
            aria-labelledby={`world-tab-${active}`}
            className={`world-panel ${worlds[active].className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="world-art" aria-hidden="true">
              {active === 0 ? (
                <>
                  <img
                    className="world-photo"
                    src="/portfolio/lapse.jpg"
                    alt="Lapse, Malayalam short film"
                    loading="lazy"
                  />
                  <span className="frame-corner" />
                  <span className="timecode">REC • 00:01:24:08</span>
                </>
              ) : active === 1 ? (
                <img
                  className="world-photo"
                  src="/portfolio/photography-03.webp"
                  alt="Photography by Sharan"
                  loading="lazy"
                />
              ) : active === 2 ? (
                <span className="design-letter">
                  Aa<span><ArrowUpRight className="inline-arrow" aria-hidden="true" /></span>
                </span>
              ) : (
                <div className="product-orbits">
                  <ScanFace size={100} />
                </div>
              )}
            </div>
            <div className="world-description">
              <Label>{worlds[active].tag}</Label>
              <h3>
                {worlds[active].name}
                <span className="red">.</span>
              </h3>
              <p>{worlds[active].text}</p>
              <Link className="text-link" href={worlds[active].href}>
                Enter this world <ArrowUpRight size={18} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(value);
  useEffect(() => {
    if (!inView || reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1300, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduced]);
  return (
    <span ref={ref}>
      {count}
      <i>{suffix}</i>
    </span>
  );
}
export function Numbers() {
  return (
    <section className="section numbers">
      <Reveal>
        <div className="section-heading">
          <div>
            <Label>02 / THE WORK, IN NUMBERS</Label>
            <h2>
              Curiosity. <span className="muted">In motion.</span>
            </h2>
          </div>
          <span className="small-note">A FEW MILESTONES ALONG THE WAY</span>
        </div>
        <div className="metrics">
          {metrics.map((m, i) => (
            <div className="metric" key={m.label}>
              <span className="metric-index">0{i + 1} /</span>
              <Counter value={m.value} suffix={m.suffix} />
              <p>{m.label}</p>
              <div className="metric-bars" aria-hidden="true">
                {Array.from({ length: 20 }, (_, j) => (
                  <i
                    key={j}
                    style={{
                      height: `${14 + ((j * 13 + i * 7) % 33)}px`,
                      opacity: j < 14 ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
export function Journey() {
  return (
    <section className="section journey">
      <Reveal>
        <div className="section-heading">
          <div>
            <Label>03 / THE EVOLUTION</Label>
            <h2>
              Never just <span className="muted">one thing.</span>
            </h2>
          </div>
          <p>
            A creative journey.
            <br />
            Still being written.
          </p>
        </div>
      </Reveal>
      <div
        className="journey-track"
        tabIndex={0}
        aria-label="Career journey, scroll horizontally"
      >
        {journey.map((j, i) => (
          <article key={j.title}>
            <div className="journey-line">
              <span>0{i + 1}</span>
              <Plus size={16} />
            </div>
            <h3>{j.title}</h3>
            <p>{j.text}</p>
            {i === 4 && (
              <span className="current-tag">THE CURRENT CHAPTER</span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
export function Work({ filterable = false }: { filterable?: boolean }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(
    null,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (filterable) {
      const category = new URLSearchParams(window.location.search).get(
        "category",
      );
      if (category && categories.includes(category)) setFilter(category);
    }
  }, [filterable]);
  useEffect(() => {
    if (selected) {
      trigger.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
        trigger.current?.focus();
      };
    }
  }, [selected]);
  const visible = projects.filter(
    (p) =>
      filter === "All" ||
      p.category === filter ||
      (filter === "Films" && p.type === "Film"),
  );
  return (
    <section className={filterable ? "work-list" : "section work-list"}>
      {!filterable && (
        <Reveal>
          <div className="section-heading">
            <div>
              <Label>04 / SELECTED WORK</Label>
              <h2>
                Made to <span className="muted">mean something.</span>
              </h2>
            </div>
            <Link className="text-link" href="/portfolio">
              View all work <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      )}
      {filterable && (
        <div className="filters" aria-label="Filter portfolio">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <motion.div layout className="project-grid">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.button
              layout
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`project-card cover-${p.tone}`}
              onClick={() => setSelected(p)}
            >
              <div className="project-cover">
                {p.image ? (
                  <img src={p.image} alt="" loading="lazy" />
                ) : (
                  <>
                    <div className="cover-geometry" />
                    <span className="cover-number">
                      SCT / 0{projects.indexOf(p) + 1}
                    </span>
                    <span className="cover-title">{p.title}</span>
                    <span className="cover-caption">
                      PROJECT STUDY / TYPOGRAPHIC COVER
                    </span>
                  </>
                )}
                <span className="project-open">
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <div className="project-meta">
                <div>
                  <h3>{p.title}</h3>
                  <span>
                    {p.category} / {p.type}
                  </span>
                </div>
                <span>0{projects.indexOf(p) + 1}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      {!visible.length && (
        <div className="empty-state">
          <h3>A new perspective is on its way.</h3>
          <p>
            Photography selections are being curated. Explore the films in the
            meantime.
          </p>
          <button className="button" onClick={() => setFilter("All")}>
            View all work <ArrowRight size={16} />
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="project-dialog"
        aria-labelledby="project-dialog-title"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            dialog.current?.close();
            setSelected(null);
          }
        }}
      >
        {selected && (
          <div>
            <button
              className="dialog-close"
              aria-label="Close project"
              onClick={() => {
                dialog.current?.close();
                setSelected(null);
              }}
            >
              <X />
            </button>
            <Label>{selected.category}</Label>
            <h2 id="project-dialog-title">{selected.title}</h2>
            <p>From Sharan’s selected body of work.</p>
            {selected.image && (
              <img
                className="dialog-image"
                src={selected.image}
                alt={selected.title}
              />
            )}
            {!selected.url && (
              <p className="muted">
                The full project and film are being prepared for this portfolio.
              </p>
            )}
            {selected.url ? (
              <a
                className="button button-red"
                href={selected.url}
                target="_blank"
                rel="noreferrer"
              >
                {selected.category === "Photography"
                  ? "View photography"
                  : "Watch the film"}{" "}
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <Link
                className="button button-red"
                href="/contact"
                onClick={() => {
                  dialog.current?.close();
                  setSelected(null);
                }}
              >
                Ask about this project <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
export function ProductShowcase({ full = false }: { full?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <section
      className={full ? "product-showcase full" : "section product-showcase"}
    >
      {!full && (
        <Reveal>
          <div className="section-heading">
            <div>
              <Label>05 / BUILT FROM CURIOSITY</Label>
              <h2>
                Beyond the frame.
                <br />
                <span className="muted">Into your everyday.</span>
              </h2>
            </div>
            <p>
              Small ideas. Real software.
              <br />
              Made for your Mac.
            </p>
          </div>
        </Reveal>
      )}
      <div className="product-grid">
        {products.map((product, i) => (
          <motion.article
            key={product.id}
            className={`gateway ${product.id}`}
            onPointerMove={(event) => {
              if (reduced || event.pointerType !== "mouse") return;
              const box = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty(
                "--tilt-x",
                `${((event.clientY - box.top) / box.height - 0.5) * -8}deg`,
              );
              event.currentTarget.style.setProperty(
                "--tilt-y",
                `${((event.clientX - box.left) / box.width - 0.5) * 8}deg`,
              );
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.setProperty("--tilt-x", "0deg");
              event.currentTarget.style.setProperty("--tilt-y", "0deg");
            }}
            whileHover={reduced ? undefined : { y: -6 }}
          >
            <div className="gateway-top">
              <span>INDEPENDENT SOFTWARE</span>
              <span>macOS <ArrowUpRight className="inline-arrow" aria-hidden="true" /></span>
            </div>
            <div className="product-visual">
              {i === 0 ? (
                <HanglyPreview />
              ) : (
                <div className="vision-demo">
                  <div className="island">
                    <span className="scan-light" />
                    <ScanFace size={39} />
                    <span className="island-dot" />
                  </div>
                  <div className="face-orbit orbit-one" />
                  <div className="face-orbit orbit-two" />
                  <span className="vision-caption">
                    A familiar face. A seamless hello.
                  </span>
                </div>
              )}
            </div>
            <div className="gateway-content">
              <span className="small-note">
                {i === 0 ? "A LITTLE DESKTOP DELIGHT" : "THE NEXT WAY IN"}
              </span>
              <h3>
                {product.title}
                <span className="red">.</span>
              </h3>
              <p>{product.description}</p>
              <Link className="button" href={product.link}>
                Explore {product.title} <ArrowUpRight size={17} />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
export function ContactCTA() {
  return (
    <section className="section contact-cta">
      <Label>06 / THE NEXT CHAPTER</Label>
      <h2>
        Have an idea?
        <br />
        Let’s make it <em>real.</em>
      </h2>
      <Link
        className="contact-arrow"
        href="/contact"
        aria-label="Start a conversation"
      >
        <ArrowUpRight />
      </Link>
      <div className="cta-bottom">
        <p>A film. A brand. A product. Something entirely new.</p>
        <Link href="/contact">Let’s create something together <ArrowUpRight className="inline-arrow" aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
