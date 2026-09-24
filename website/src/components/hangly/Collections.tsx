"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Charm, Label, Reveal } from "./shared";
export const collections = [
  {
    name: "Protection",
    eyebrow: "GOOD ENERGY, ALWAYS.",
    description: "A little luck. A little protection. A feeling of home.",
    className: "protection",
    charms: [
      ["nazar", "Nazar / Evil Eye"],
      ["drishtiBommai", "Drishti Bommai"],
      ["hamsa", "Hamsa"],
    ],
  },
  {
    name: "Marvel",
    eyebrow: "YOUR EVERYDAY SUPERPOWER.",
    description: "For the hero behind the screen.",
    className: "marvel",
    charms: [
      ["spiderMan", "Spider-Man"],
      ["captainAmericaShield", "Captain America Shield"],
      ["ironManHelmet", "Iron Man Helmet"],
      ["thorHammer", "Thor Hammer"],
      ["hulkFist", "Hulk Fist"],
    ],
  },
  {
    name: "DC",
    eyebrow: "A LITTLE MORE LEGENDARY.",
    description: "Iconic symbols. Extraordinary company.",
    className: "dc",
    charms: [
      ["batmanSymbol", "Batman"],
      ["supermanShield", "Superman"],
      ["wonderWomanEmblem", "Wonder Woman"],
      ["flash", "Flash"],
      ["greenLanternRing", "Green Lantern"],
    ],
  },
  {
    name: "Tamil Divine",
    eyebrow: "ROOTED IN SOMETHING DEEPER.",
    description: "Sacred symbols. Familiar stories. Close to home.",
    className: "tamil",
    charms: [
      ["vel", "Vel"],
      ["vinayagarCoin", "Vinayagar"],
      ["omSymbol", "Om"],
      ["karuppuStatue", "Karuppu"],
      ["templeBell", "Temple Bell"],
    ],
  },
  {
    name: "BTS",
    eyebrow: "SEVEN LITTLE REASONS TO SMILE.",
    description: "A little purple in your everyday.",
    className: "bts",
    charms: [
      ["btsMemberOne", "Jin"],
      ["btsMemberTwo", "Suga"],
      ["btsMemberThree", "J-Hope"],
      ["btsMemberFour", "RM"],
      ["btsMemberFive", "Jimin"],
      ["btsMemberSix", "V"],
      ["btsMemberSeven", "Jung Kook"],
    ],
  },
  {
    name: "Football",
    eyebrow: "FOR THE LOVE OF THE GAME.",
    description: "A little piece of match day, always within reach.",
    className: "football",
    charms: [
      ["football25", "Cristiano Ronaldo"],
      ["football26", "Lionel Messi"],
      ["football27", "Neymar Jr."],
      ["football28", "Real Madrid"],
      ["football29", "FC Barcelona"],
    ],
  },
  {
    name: "Stranger Things",
    eyebrow: "A LITTLE UPSIDE DOWN.",
    description: "For late-night mysteries and the bravest of friends.",
    className: "stranger-things",
    charms: [
      ["strangerThings8", "Eleven"],
      ["strangerThings9", "Mike Wheeler"],
      ["strangerThings10", "Dustin Henderson"],
      ["strangerThings11", "Lucas Sinclair"],
      ["strangerThings12", "Will Byers"],
      ["strangerThings13", "Demogorgon"],
    ],
  },
  {
    name: "Singers",
    eyebrow: "TURN THE VOLUME UP.",
    description: "A little music for every moment on your desktop.",
    className: "singers",
    charms: [
      ["singer20", "Billie Eilish"],
      ["singer21", "XXXTENTACION"],
      ["singer22", "Michael Jackson"],
      ["singer23", "Taylor Swift"],
      ["singer24", "Juice WRLD"],
    ],
  },
  {
    name: "Breaking Bad",
    eyebrow: "TREAD LIGHTLY.",
    description: "A little danger. A lot of story.",
    className: "breaking-bad",
    charms: [
      ["breakingBad1", "Walter White"],
      ["breakingBad2", "Jesse Pinkman"],
      ["breakingBad3", "Saul Goodman"],
      ["breakingBad4", "Gus Fring"],
      ["breakingBad5", "Mike Ehrmantraut"],
      ["breakingBad6", "Heisenberg"],
      ["breakingBad7", "The RV"],
    ],
  },
  {
    name: "Friends",
    eyebrow: "I'LL BE THERE FOR YOU.",
    description: "The one with your favorite everyday keepsakes.",
    className: "friends",
    charms: [
      ["friends14", "Rachel Green"],
      ["friends15", "Monica Geller"],
      ["friends16", "Ross Geller"],
      ["friends17", "Joey Tribbiani"],
      ["friends18", "Chandler Bing"],
      ["friends19", "Phoebe Buffay"],
    ],
  },
  {
    name: "Dream Catcher",
    eyebrow: "KEEP THE GOOD DREAMS CLOSE.",
    description: "A quiet little talisman for your day.",
    className: "dream-catcher",
    charms: [["dreamCatcher", "Dream Catcher"]],
  },
];
export default function Collections() {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const reduced = useReducedMotion();
  function move(direction: number) {
    const next = Math.max(
      0,
      Math.min(collections.length - 1, active + direction),
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
              disabled={active === collections.length - 1}
            >
              <ArrowRight size={18} />
            </button>
            <span>
              {String(active + 1).padStart(2, "0")} <i>/ {String(collections.length).padStart(2, "0")}</i>
            </span>
          </div>
        </div>
      </Reveal>
      <div
        className="collection-rail"
        ref={rail}
        onScroll={() => {
          if (!rail.current) return;
          const first = rail.current.children[0] as HTMLElement;
          const second = rail.current.children[1] as HTMLElement;
          const width = second.offsetLeft - first.offsetLeft;
          const atEnd =
            rail.current.scrollLeft + rail.current.clientWidth >=
            rail.current.scrollWidth - 3;
          setActive(
            atEnd
              ? collections.length - 1
              : Math.min(
                  collections.length - 1,
                  Math.round(rail.current.scrollLeft / width),
                ),
          );
        }}
      >
        {collections.map((collection, i) => (
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
              <span>COLLECTION 0{i + 1}</span>
              <span>{collection.charms.length} CHARMS</span>
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
      </div>
      <p className="collection-footnote wrap">
        Small keepsakes. Big feelings. <span>← Swipe to explore →</span>
      </p>
    </section>
  );
}
