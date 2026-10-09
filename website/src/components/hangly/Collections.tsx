"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Charm, Label, Reveal } from "./shared";
import { CHARM_COLLECTIONS } from "@/data/charms.generated";

/**
 * Each shipped category's line on its card. The categories and their charms come from the shipped catalogue
 * (charms.generated.ts, written from charm-library.shipped.json at build time), so the strip shows what the app
 * ships and nothing else. Only the words are written here; a category with none gets a plain card.
 */
const COPY: Record<string, { eyebrow: string; description: string; filter?: Filter; className?: string }> = {
  protection: { eyebrow: "GOOD ENERGY, ALWAYS.", description: "A little luck. A little protection. A feeling of home.", filter: "Luck & spirit", className: "protection" },
  luck: { eyebrow: "A LITTLE GOOD FORTUNE.", description: "Daruma, Maneki-neko and the horseshoe, for luck that hangs around.", filter: "Luck & spirit" },
  ritual: { eyebrow: "FROM HOMES EVERYWHERE.", description: "A temple bell and a straw himmeli, quiet things from home.", filter: "Luck & spirit" },
  classic: { eyebrow: "SIMPLE, ALWAYS.", description: "A circle, a star, a heart, a diamond and a camera. Nothing more to it." },
  tamilSpiritual: { eyebrow: "ROOTED IN SOMETHING DEEPER.", description: "Vel, Vinayagar, Om, the rudraksha, the cross, the crescent and more, for every faith.", filter: "Luck & spirit", className: "tamil" },
  marvel: { eyebrow: "YOUR EVERYDAY SUPERPOWER.", description: "For the hero behind the screen.", filter: "Pop culture", className: "marvel" },
  dc: { eyebrow: "A LITTLE MORE LEGENDARY.", description: "Iconic symbols. Extraordinary company.", filter: "Pop culture", className: "dc" },
  friends: { eyebrow: "I'LL BE THERE FOR YOU.", description: "The one with your favourite everyday keepsakes.", filter: "Pop culture", className: "friends" },
  breakingBad: { eyebrow: "TREAD LIGHTLY.", description: "A little danger. A lot of story.", filter: "Pop culture", className: "breaking-bad" },
  strangerThings: { eyebrow: "A LITTLE UPSIDE DOWN.", description: "For late-night mysteries and the bravest of friends.", filter: "Pop culture", className: "stranger-things" },
  harryPotter: { eyebrow: "MISCHIEF MANAGED.", description: "The boy who lived, his friends, and a Golden Snitch to chase.", filter: "Pop culture", className: "harry-potter" },
  gameOfThrones: { eyebrow: "WINTER IS COMING.", description: "Starks, Targaryens, Lannisters, and the Iron Throne itself.", filter: "Pop culture", className: "got" },
  onePiece: { eyebrow: "SET SAIL.", description: "Luffy and the Straw Hat crew, ready for the Grand Line.", filter: "Anime & cartoons", className: "one-piece" },
  naruto: { eyebrow: "BELIEVE IT.", description: "Naruto, Sasuke, Kakashi, Kurama and the Sharingan.", filter: "Anime & cartoons", className: "naruto" },
  attackOnTitan: { eyebrow: "DEDICATE YOUR HEART.", description: "Eren, Mikasa, Levi and the Survey Corps.", filter: "Anime & cartoons", className: "aot" },
  pokemon: { eyebrow: "GOTTA HANG 'EM ALL.", description: "Pikachu, the Kanto starters, Mewtwo and a Poké Ball.", filter: "Anime & cartoons", className: "pokemon" },
  ben10: { eyebrow: "IT'S HERO TIME.", description: "Ben, the Omnitrix and the aliens inside it.", filter: "Anime & cartoons", className: "ben10" },
  bts: { eyebrow: "SEVEN LITTLE REASONS TO SMILE.", description: "A little purple in your everyday.", filter: "Music", className: "bts" },
  musicLegends: { eyebrow: "TURN THE VOLUME UP.", description: "A little music for every moment on your desktop.", filter: "Music", className: "singers" },
  footballLegends: { eyebrow: "FOR THE LOVE OF THE GAME.", description: "A little piece of match day, always within reach.", filter: "Sports & style", className: "football" },
  airJordan: { eyebrow: "LACE UP.", description: "Eight Air Jordans, from the Chicago 1 to the Concord 11.", filter: "Sports & style", className: "jordan" },
};

const FILTERS = ["All", "Luck & spirit", "Pop culture", "Anime & cartoons", "Music", "Sports & style", "Custom"] as const;
type Filter = (typeof FILTERS)[number];

export const collections = CHARM_COLLECTIONS.map((category) => ({
  name: category.name,
  eyebrow: COPY[category.id]?.eyebrow ?? "",
  description: COPY[category.id]?.description ?? "",
  className: COPY[category.id]?.className ?? "",
  filter: COPY[category.id]?.filter,
  charms: category.charms,
}));
// The same 161 charms ship on macOS and Windows (2.3.1), from one catalogue.
const curatedCollections = collections.map(collection => ({ ...collection, availability: "Both" as const }));
export default function Collections() {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState<Filter>("All");
  const visibleCollections = filter === "All" ? curatedCollections : curatedCollections.filter(collection => collection.filter === filter);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const reduced = useReducedMotion();
  function move(direction: number) {
    const next = Math.max(
      0,
      Math.min(visibleCollections.length - 1, active + direction),
    );
    setActive(next);
    const el = rail.current?.children[next] as HTMLElement | undefined;
    if (el && rail.current)
      rail.current.scrollTo({
        left: el.offsetLeft - rail.current.offsetLeft,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  return (
    <section id="collections" className="collections section">
      <Reveal className="section-heading wrap">
        <div>
          <Label>FIND YOUR LITTLE OBSESSION.</Label>
          <h2>
            A charm for
            <br />
            every personality<span className="orange">.</span>
          </h2>
        </div>
        <div className="collection-intro">
          <p>
            Some carry luck. Some carry stories.
            <br />
            Find the ones that feel like you.
          </p>
          <div className="rail-controls">
            <button
              aria-label="Previous collection"
              onClick={() => move(-1)}
              disabled={active === 0}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              aria-label="Next collection"
              onClick={() => move(1)}
              disabled={active === visibleCollections.length - 1}
            >
              <ArrowRight size={18} />
            </button>
            <span>
              {String(active + 1).padStart(2, "0")} <i>/ {String(visibleCollections.length).padStart(2, "0")}</i>
            </span>
          </div>
        </div>
      </Reveal>
      <div className="collection-filters wrap" role="group" aria-label="Filter charm collections">{FILTERS.map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => { setFilter(item); setActive(0); requestAnimationFrame(() => rail.current?.scrollTo({ left: 0, behavior: 'smooth' })); }}>{item}</button>)}</div>
      {filter === "Custom" ? <div className="custom-collection-note wrap"><strong>Make your own.</strong><span>Creator Studio turns an image, artwork, logo, or memory into a charm for your desktop.</span><a href="#create">Open Creator Studio <ArrowUpRight size={15}/></a></div> : <div
        className="collection-rail"
        ref={rail}
        onScroll={() => {
          if (!rail.current) return;
          const first = rail.current.children[0] as HTMLElement;
          const second = rail.current.children[1] as HTMLElement | undefined;
          const width = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
          const atEnd =
            rail.current.scrollLeft + rail.current.clientWidth >=
            rail.current.scrollWidth - 3;
          setActive(
            atEnd
              ? visibleCollections.length - 1
              : Math.min(
                  visibleCollections.length - 1,
                  Math.round(rail.current.scrollLeft / width),
                ),
          );
        }}
      >
        {visibleCollections.map((collection, i) => (
          <motion.article
            className={`collection-card ${collection.className}`}
            key={collection.name}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            tabIndex={0}
            aria-label={`${collection.name} collection`}
          >
            <div className="collection-top">
              <span>COLLECTION {String(i + 1).padStart(2, "0")}</span>
              <span>AVAILABLE ON {collection.availability.toUpperCase()}</span>
            </div>
            <div className="collection-preview">
              {(previews[collection.name]
                ? [
                    collection.charms.find(
                      ([name]) => name === previews[collection.name],
                    )!,
                  ]
                : collection.charms.slice(0, 3)
              ).map(([name, alt]) => (
                <div key={name}>
                  <span className="collection-cord" />
                  <Charm name={name} alt={alt} />
                </div>
              ))}
            </div>
            <div className="collection-copy">
              <p>{collection.eyebrow}</p>
              <h3>
                {collection.name}
                <ArrowUpRight size={23} />
              </h3>
              <span>{collection.description}</span>
              <details>
                <summary>
                  Explore the collection <span>+</span>
                </summary>
                <ul>
                  {collection.charms.map(([name, alt]) => (
                    <li key={name}>
                      <button
                        type="button"
                        className="collection-pick"
                        aria-pressed={previews[collection.name] === name}
                        onClick={() =>
                          setPreviews((current) => ({
                            ...current,
                            [collection.name]: name,
                          }))
                        }
                      >
                        <Charm name={name} />
                        <span>{alt}</span>
                        <span aria-hidden="true">↗</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </motion.article>
        ))}
      </div>}
      <p className="collection-footnote wrap">
        Small keepsakes. Big feelings. <span>← Swipe to explore →</span>
      </p>
    </section>
  );
}
