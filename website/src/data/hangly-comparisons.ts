/**
 * Comparison pages, one per competitor worth answering a query about.
 *
 * Chosen from a crawl of twenty-three competitors rather than from a list of
 * names. Each one here either ranks for a phrase Hangly should own ("desktop
 * goose alternative"), or occupies the same shelf and is what a person is
 * deciding between when they land on Hangly.
 *
 * Two rules, because a comparison page that breaks either is worse than none:
 *
 * 1. **Every claim about a competitor is from their own site**, quoted or
 *    paraphrased from what was crawled, with the date. Competitors ship;
 *    an out-of-date claim presented as current is how a comparison page
 *    becomes a liability.
 * 2. **The verdict names cases where the other product wins.** A comparison
 *    that concludes "we win" in every row is an advertisement, and readers —
 *    and increasingly answer engines — discount it accordingly.
 */

export type Comparison = {
  slug: string;
  rival: string;
  rivalUrl: string;
  /** For the <title>. Kept under 60 characters. */
  title: string;
  description: string;
  h1: string;
  /** One line, above the fold: the honest summary. */
  verdict: string;
  /** What the rival genuinely does better. Never empty. */
  rivalWins: string[];
  hanglyWins: string[];
  rows: { feature: string; hangly: string; rival: string }[];
  faqs: { q: string; a: string }[];
  /** As crawled, so a stale claim can be dated rather than defended. */
  checked: string;
};

const CHECKED = "2026-09-24";

export const COMPARISONS: Comparison[] = [
  {
    slug: "lucky-dangle",
    rival: "Lucky Dangle",
    rivalUrl: "https://luckydangle.app",
    title: "Hangly vs Lucky Dangle: Desktop Charms Compared",
    description:
      "Both hang a lucky charm from the top of your screen on Mac and Windows. Hangly adds custom charms from your own photos, eleven collections and three cord styles, free. An honest comparison.",
    h1: "Hangly vs Lucky Dangle",
    verdict:
      "The closest comparison in this list — both hang a charm on a cord from the top of the screen, on Mac and Windows. Hangly's advantage is breadth: custom charms made from your own images, eleven themed collections, and adjustable cords and sizing.",
    rivalWins: [
      "A tighter, simpler product with less to configure",
      "Its own curated charm set, if those designs are the ones you want",
    ],
    hanglyWins: [
      "Turn any image into a charm",
      "Eleven collections including Marvel, DC, BTS and Tamil Divine",
      "Three cord styles and adjustable charm size",
      "Native Windows ARM64 build",
      "Free, with no paid tier",
    ],
    rows: [
      { feature: "Price", hangly: "Free", rival: "See their site" },
      { feature: "macOS", hangly: "14+, Apple Silicon & Intel", rival: "Yes" },
      { feature: "Windows", hangly: "10+, x64 & ARM64", rival: "Yes" },
      { feature: "Custom charms from your images", hangly: "Yes", rival: "Not advertised" },
      { feature: "Charm count", hangly: "30+ across 11 collections", rival: "Not published" },
      { feature: "Cord styles", hangly: "Three", rival: "Not advertised" },
      { feature: "Click-through", hangly: "Never intercepts clicks", rival: "Stays out of every click" },
    ],
    faqs: [
      {
        q: "Is Hangly or Lucky Dangle better?",
        a: "If you want to hang your own images as charms, or want the themed collections, Hangly. If you prefer the smaller, simpler product and its curated set suits you, Lucky Dangle. Both are physics-based charms on Mac and Windows that stay out of your clicks.",
      },
      {
        q: "Is Lucky Dangle free?",
        a: "Check their site for current pricing. Hangly is free with no paid tier.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "screen-dangle",
    rival: "Screen Dangle",
    rivalUrl: "https://od2.in/screen-dangle",
    title: "Hangly vs Screen Dangle: Free Desktop Charms",
    description:
      "Both are free desktop charm apps for Mac and Windows. Screen Dangle leans toward a customisation studio; Hangly toward a collection you pick from, plus charms made from your own photos.",
    h1: "Hangly vs Screen Dangle",
    verdict:
      "Both free, both Mac and Windows. The difference is philosophy: Screen Dangle presents itself as a studio for building a charm, Hangly as a library you choose from — with the option to add your own.",
    rivalWins: [
      "A deeper customisation studio, if building the charm is the fun part",
      "A far larger content surface — over a thousand indexed pages, so it is easier to find",
    ],
    hanglyWins: [
      "Eleven curated collections rather than starting from a blank charm",
      "Native Windows ARM64 build",
      "Turn any photo into a charm in one step",
    ],
    rows: [
      { feature: "Price", hangly: "Free", rival: "Free (their site: 100% free)" },
      { feature: "macOS", hangly: "14+", rival: "Yes" },
      { feature: "Windows", hangly: "10+, x64 & ARM64", rival: "Yes" },
      { feature: "Approach", hangly: "Pick from collections", rival: "Build in a studio" },
      { feature: "Custom images", hangly: "Yes", rival: "Yes" },
    ],
    faqs: [
      {
        q: "Are Hangly and Screen Dangle both free?",
        a: "Yes. Screen Dangle describes itself as 100% free, and Hangly has no paid tier, subscription or advertising.",
      },
      {
        q: "Which has more charms?",
        a: "Hangly ships over thirty across eleven collections. Screen Dangle emphasises building your own rather than publishing a count.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "danglejoy",
    rival: "DangleJoy",
    rivalUrl: "https://danglejoy.com",
    title: "Hangly vs DangleJoy: Animated Desktop Charms",
    description:
      "DangleJoy offers animated cultural and lucky charms that sway on screen. Hangly covers the same ground free, adds Windows ARM64, and lets you hang your own images.",
    h1: "Hangly vs DangleJoy",
    verdict:
      "Very similar in intent — animated charms that hang and sway, with cultural and lucky symbols. Hangly's edge is being free, covering Windows ARM64, and accepting your own artwork.",
    rivalWins: ["Its own animated charm designs, which are a matter of taste"],
    hanglyWins: [
      "Free, with no paid tier",
      "Custom charms from your own images",
      "Native Windows ARM64 build",
      "Published charm count and collections",
    ],
    rows: [
      { feature: "Price", hangly: "Free", rival: "See their site" },
      { feature: "Custom images", hangly: "Yes", rival: "Not advertised" },
      { feature: "Windows ARM64", hangly: "Yes", rival: "Not advertised" },
      { feature: "Cultural charms", hangly: "Nazar, Drishti Bommai, Vel, Om, temple bell", rival: "Cultural icons and lucky symbols" },
    ],
    faqs: [
      {
        q: "Does DangleJoy have Indian charms?",
        a: "Its site mentions cultural icons and lucky symbols. Hangly ships a named Tamil Divine collection — Vel, Vinayagar, Om, Karuppu, temple bell — and protection charms including the Nazar and Drishti Bommai.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "desktop-goose",
    rival: "Desktop Goose",
    rivalUrl: "https://samperson.itch.io/desktop-goose",
    title: "Hangly vs Desktop Goose: Calm or Chaos",
    description:
      "Desktop Goose interrupts your work on purpose. Hangly never can — it cannot be clicked and never takes focus. Same instinct for a companion on screen, opposite behaviour.",
    h1: "Hangly vs Desktop Goose",
    verdict:
      "These are opposites that appeal to the same instinct. Desktop Goose drags mud across your screen and steals your cursor, deliberately. Hangly hangs one charm that cannot interrupt anything. Pick by whether you want to be interfered with.",
    rivalWins: [
      "It is genuinely funny, which Hangly is not trying to be",
      "A cultural landmark with an audience Hangly does not have",
      "Actively interactive, if interruption is the point",
    ],
    hanglyWins: [
      "Never intercepts a click or takes focus",
      "Safe to leave running while you work",
      "macOS and Windows, both signed and updating",
      "Over thirty charms plus your own images",
    ],
    rows: [
      { feature: "Interrupts your work", hangly: "Never", rival: "Constantly, by design" },
      { feature: "Safe during a meeting", hangly: "Yes", rival: "No" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "Windows, macOS" },
      { feature: "Price", hangly: "Free", rival: "Pay what you want" },
      { feature: "Customisation", hangly: "30+ charms, your own images", rival: "Goose" },
    ],
    faqs: [
      {
        q: "Is Hangly a good Desktop Goose alternative?",
        a: "Only if what you wanted was the company rather than the chaos. Desktop Goose interferes with your work on purpose; Hangly cannot interfere at all. If you liked the goose because it was disruptive, Hangly will disappoint you.",
      },
      {
        q: "Is there a calmer Desktop Goose?",
        a: "Hangly is about as calm as this category gets — a charm that hangs and sways and cannot be clicked. For something animate but less destructive, desktop pets like MicroJoyz or Cat Fidget sit between the two.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "shimeji",
    rival: "Shimeji",
    rivalUrl: "https://shimejis.xyz",
    title: "Hangly vs Shimeji: Desktop Companions Compared",
    description:
      "Shimeji characters climb and drag your windows in the browser. Hangly hangs a charm from the top of your screen as a native app. Both accept your own artwork.",
    h1: "Hangly vs Shimeji",
    verdict:
      "Both let you put your own artwork on screen, and there the similarity ends. Shimeji characters roam, climb windows and throw them about, and the popular version today is a browser extension. Hangly is a native desktop app with one charm that stays where you hang it.",
    rivalWins: [
      "A vast community library of characters",
      "Animated behaviour — climbing, falling, dragging windows",
      "Works inside the browser without installing an app",
    ],
    hanglyWins: [
      "Native macOS and Windows app, not a browser extension",
      "Works across every application, not just web pages",
      "Signed, notarised and self-updating",
      "Never interferes with what you are doing",
    ],
    rows: [
      { feature: "Type", hangly: "Native desktop app", rival: "Browser extension (and legacy desktop)" },
      { feature: "Scope", hangly: "Whole screen, all apps", rival: "Web pages" },
      { feature: "Behaviour", hangly: "Hangs and sways", rival: "Climbs, roams, drags windows" },
      { feature: "Your own artwork", hangly: "Yes", rival: "Yes, large community library" },
      { feature: "Price", hangly: "Free", rival: "Free" },
    ],
    faqs: [
      {
        q: "Is Hangly a Shimeji alternative?",
        a: "Partly. If you want a character that roams and interacts with windows, Shimeji is the closer fit. If you want something on screen across every app rather than only in the browser, and you want it to stay put, Hangly.",
      },
      {
        q: "Can I use my own image in Hangly like a Shimeji?",
        a: "Yes. Any image becomes a charm. The difference is that it hangs on a cord rather than walking about.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "runcat",
    rival: "RunCat",
    rivalUrl: "https://kyome.io/runcat",
    title: "Hangly vs RunCat: Decoration or Monitoring",
    description:
      "RunCat animates a menu bar icon at the speed of your CPU. Hangly hangs a decorative charm from your screen. Different jobs — plenty of people run both.",
    h1: "Hangly vs RunCat",
    verdict:
      "Not really competitors. RunCat is a system monitor wearing a cat costume: the animation speed tells you your CPU load. Hangly is decoration with no monitoring function. Running both is common and sensible.",
    rivalWins: [
      "Tells you something useful — CPU, memory, network at a glance",
      "Minimal footprint, living entirely in the menu bar",
      "A long-established Mac utility with a large following",
    ],
    hanglyWins: [
      "Windows as well as macOS",
      "Over thirty charms plus your own images",
      "A visible presence on screen rather than an icon",
    ],
    rows: [
      { feature: "Purpose", hangly: "Decoration", rival: "System monitoring" },
      { feature: "Tells you CPU load", hangly: "No", rival: "Yes" },
      { feature: "Platforms", hangly: "macOS, Windows", rival: "macOS" },
      { feature: "Where it lives", hangly: "Hangs on screen", rival: "Menu bar icon" },
      { feature: "Price", hangly: "Free", rival: "Free" },
    ],
    faqs: [
      {
        q: "Is Hangly a RunCat alternative?",
        a: "Not a replacement — they do different jobs. RunCat shows system load through animation speed; Hangly is purely decorative. If you want both a CPU indicator and something decorative, run both.",
      },
      {
        q: "Is there a RunCat for Windows?",
        a: "RunCat is a Mac utility. If what you want on Windows is something charming on screen rather than a CPU monitor, Hangly runs natively on Windows including ARM64.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "dockling",
    rival: "Dockling",
    rivalUrl: "https://dockling.space",
    title: "Hangly vs Dockling: Charm or Productivity Pet",
    description:
      "Dockling turns a photo into a pixel pet with Pomodoro timers and streaks for $2.99. Hangly hangs a charm and adds nothing to your workflow, on purpose.",
    h1: "Hangly vs Dockling",
    verdict:
      "Dockling is a productivity companion that happens to be cute — Pomodoro, streaks, quick notes, $2.99 once. Hangly is decoration that deliberately adds nothing to your workflow. Choose by whether you want your ornament to also nag you.",
    rivalWins: [
      "Pomodoro timers, streaks and quick notes built in",
      "Generates a pixel pet from any photo",
      "Lives in the dock, menu bar or notch",
    ],
    hanglyWins: [
      "Free rather than $2.99",
      "Windows as well as macOS",
      "Over thirty ready-made charms across eleven collections",
      "No productivity features to ignore",
    ],
    rows: [
      { feature: "Price", hangly: "Free", rival: "$2.99 once" },
      { feature: "Platforms", hangly: "macOS, Windows", rival: "macOS" },
      { feature: "Productivity features", hangly: "None, deliberately", rival: "Pomodoro, streaks, notes" },
      { feature: "From your photo", hangly: "Yes, as a charm", rival: "Yes, as a pixel pet" },
    ],
    faqs: [
      {
        q: "Is Dockling or Hangly better?",
        a: "Dockling if you want the Pomodoro timer and streaks alongside the character. Hangly if you want something on screen that never asks anything of you, and free.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "charmly",
    rival: "Charmly",
    rivalUrl: "https://www.glaze.app/app/charmly-rmKwV7",
    title: "Hangly vs Charmly: Mac Desktop Charms",
    description:
      "Charmly hangs a good-luck charm on a cord with pendulum physics on Mac. Hangly does the same and adds Windows including ARM64, eleven collections and custom charms.",
    h1: "Hangly vs Charmly",
    verdict:
      "Near-identical in concept — a charm on a cord with real pendulum physics that stays out of your clicks. Hangly's difference is reach: Windows including ARM64, eleven collections, and your own images as charms.",
    rivalWins: ["A focused Mac-only product", "Distributed through Glaze, if you already use it"],
    hanglyWins: [
      "Windows 10+ including native ARM64",
      "Eleven themed collections",
      "Custom charms from your own images",
      "Three cord styles and adjustable sizing",
    ],
    rows: [
      { feature: "macOS", hangly: "14+", rival: "Yes" },
      { feature: "Windows", hangly: "10+, x64 & ARM64", rival: "No" },
      { feature: "Pendulum physics", hangly: "Yes", rival: "Yes" },
      { feature: "Custom images", hangly: "Yes", rival: "Not advertised" },
      { feature: "Price", hangly: "Free", rival: "See their listing" },
    ],
    faqs: [
      {
        q: "Does Charmly work on Windows?",
        a: "Charmly is presented as a Mac app. Hangly runs on Windows 10 and later, including a native ARM64 build.",
      },
    ],
    checked: CHECKED,
  },
];

export const COMPARISON_SLUGS = COMPARISONS.map((c) => c.slug);
