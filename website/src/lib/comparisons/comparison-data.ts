/**
 * Every comparison page, as data.
 *
 * Adding a competitor means adding one entry here. The route, the metadata,
 * the three schema blocks, the sitemap entry and the cross-links between pages
 * all follow — see comparison-page.tsx and comparison-schema.ts.
 *
 * Chosen from a crawl of twenty-three competitors on 2026-09-24 rather than
 * from a list of names. Each one either ranks for a phrase Hangly should own
 * ("desktop goose alternative"), or is what a visitor is actually deciding
 * between when they arrive.
 *
 * Two rules, because a comparison page that breaks either is a liability:
 *
 * 1. **Every claim about a competitor comes from their own site**, with the
 *    date it was read. Products ship. An undated claim presented as current is
 *    how a comparison page stops being trustworthy.
 * 2. **The page states where the other product wins**, in its own section,
 *    never empty. A comparison whose every row favours its author reads as an
 *    advertisement — to people, and to the answer engines these pages exist to
 *    be cited by, which discount promotional framing.
 */

export type ComparisonRow = { feature: string; hangly: string; rival: string };
export type Faq = { q: string; a: string };

/**
 * An answer block: one question, one direct answer, optional supporting
 * points. Shaped this way because answer engines lift a stated answer far
 * more readily than they summarise prose around it.
 */
export type AnswerBlock = { question: string; answer: string; points?: string[] };

export type Comparison = {
  /** URL segment. /compare/<slug> */
  slug: string;
  /** The competitor's product name, as they write it. */
  name: string;
  /** Their own site, for attribution and a nofollow link. */
  url: string;
  title: string;
  description: string;
  h1: string;
  /** One paragraph, above the fold: the honest summary. */
  verdict: string;
  /** Neutral description of the competitor, from their own material. */
  whatIsIt: string;
  /** How Hangly differs, in one paragraph. */
  howHanglyDiffers: string;
  rows: ComparisonRow[];
  performance: string;
  customisation: string;
  privacy: string;
  platforms: string;
  /** Never empty. See rule 2 above. */
  rivalWins: string[];
  hanglyWins: string[];
  /** The five AEO questions every comparison answers. */
  answers: AnswerBlock[];
  faqs: Faq[];
  /** 40-80 words. The answer, before the argument. */
  quickAnswer: string;
  /** 3-5 bullets. */
  takeaways: string[];
  /** One paragraph, at the end. */
  inShort: string;
  /** Specific use cases, named. */
  bestFor: { who: string; why: string }[];
  /** Date the competitor's site was read. */
  checked: string;
};

const CHECKED = "2026-09-24";

/** Shared, so every page answers the menu-bar question the same way. */
const MENU_BAR_ANSWER =
  "Hangly runs from the macOS menu bar and the Windows system tray, but it is not a menu bar customisation tool — it hangs a charm below the menu bar rather than changing the bar itself. For rearranging or hiding menu bar items, a dedicated utility such as Bartender or Ice is the right category. Hangly sits alongside those rather than replacing them.";

export const COMPARISONS: Comparison[] = [
  {
    slug: "lucky-dangle",
    quickAnswer:
      "Both hang a charm on a cord from the top of your screen, on Mac and Windows, and neither intercepts clicks. Hangly is free and ships eighty-one charms across fourteen collections plus charms made from your own images. Choose Lucky Dangle if its curated set is what you want and you prefer a smaller product.",
    takeaways: [
      "Both are click-through: neither blocks what is underneath",
      "Hangly is free; check Lucky Dangle's current pricing",
      "Hangly ships 81 charms across 14 collections and accepts your own images",
      "Only Hangly publishes a native Windows ARM64 build",
      "Lucky Dangle is the simpler product, which some people prefer",
    ],
    inShort:
      "These are the two closest products in the category. Hangly wins on breadth \u2014 charm count, collections, custom images, cord styles, ARM64 \u2014 and is free. Lucky Dangle wins if you want fewer decisions and its designs suit you. Both cost nothing to try.",
    bestFor: [
      { who: "Someone who wants their own photo hanging on screen", why: "Hangly turns any image into a charm; Lucky Dangle does not advertise this." },
      { who: "A Windows-on-ARM laptop", why: "Hangly ships a native ARM64 binary rather than running under x64 emulation." },
      { who: "Someone who finds options tiring", why: "Lucky Dangle's curated set means fewer decisions." },
    ],
    name: "Lucky Dangle",
    url: "https://luckydangle.app",
    title: "Hangly vs Lucky Dangle: Desktop Charms Compared",
    description:
      "Both hang a lucky charm from the top of your screen on Mac and Windows. Hangly adds custom charms from your photos, fourteen collections and three cord styles, free.",
    h1: "Hangly vs Lucky Dangle",
    verdict:
      "The closest comparison in this list. Both hang a charm on a cord from the top of the screen, on Mac and Windows, and both stay out of every click. Hangly's advantage is breadth: charms made from your own images, fourteen themed collections, and adjustable cords and sizing.",
    whatIsIt:
      "Lucky Dangle is a desktop charm app for Mac and Windows. Its own description: choose a lucky charm and hang it from the top of your screen, where it sways while you work and stays out of every click.",
    howHanglyDiffers:
      "Hangly occupies the same shelf and extends it. Where Lucky Dangle offers a curated charm set, Hangly ships eighty-one charms across fourteen named collections — protection charms, Tamil Divine symbols, Marvel, DC, BTS and more — and lets you turn any image into a charm. It also adds three cord styles, adjustable charm size, and a native Windows ARM64 build.",
    rows: [
      { feature: "Price", hangly: "Free, no paid tier", rival: "See their site" },
      { feature: "macOS", hangly: "14+, Apple Silicon & Intel", rival: "Yes" },
      { feature: "Windows", hangly: "10+, x64 and native ARM64", rival: "Yes" },
      { feature: "Custom charms from your images", hangly: "Yes", rival: "Not advertised" },
      { feature: "Charm count", hangly: "81 across 14 collections", rival: "Not published" },
      { feature: "Cord styles", hangly: "Golden thread, silver chain, neon", rival: "Not advertised" },
      { feature: "Adjustable size", hangly: "Yes", rival: "Not advertised" },
      { feature: "Click-through", hangly: "Never intercepts a click", rival: "Stays out of every click" },
      { feature: "Account required", hangly: "No", rival: "Not advertised" },
    ],
    performance:
      "Both are small ornaments rendering on an otherwise idle strip of screen, so neither is a meaningful load. Hangly stops its physics simulation when the charm comes to rest rather than running an animation loop indefinitely, which is the detail that decides battery cost in apps of this kind. Lucky Dangle does not publish its approach.",
    customisation:
      "This is the clearest difference. Hangly ships eighty-one charms across fourteen collections, three cord styles, adjustable sizing, multiple charms at once and multi-monitor placement — plus the ability to turn any image into a charm. Lucky Dangle presents a curated set without publishing a count.",
    privacy:
      "Hangly collects almost nothing, describes all of it on its privacy page, and never reads what is on your screen or in your files. It requires no account and no email address. Lucky Dangle publishes no privacy page that the crawl found; check their site before installing.",
    platforms:
      "Hangly: macOS 14 Sonoma and later on Apple Silicon and Intel; Windows 10 and later on x64 and native ARM64. Lucky Dangle: Mac and Windows per their own site, with no architecture detail published.",
    rivalWins: [
      "A tighter, simpler product with less to configure",
      "Its own curated charm designs, which are a matter of taste",
    ],
    hanglyWins: [
      "Turn any image into a charm",
      "Eighty-one charms across fourteen collections",
      "Three cord styles and adjustable charm size",
      "Native Windows ARM64 build",
      "Free, with no paid tier and no account",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Both run natively on Mac and behave the same way — a charm on a cord that ignores clicks. Hangly is the better fit if you want the collections or your own images as charms; Lucky Dangle if you prefer the smaller product and its curated set suits you.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Neither publishes benchmarks, and both are small ornaments on an idle strip of screen. Hangly pauses its physics when the charm is at rest rather than animating continuously, which is the behaviour that decides battery cost in this category.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly, clearly. Eighty-one charms across fourteen collections, three cord styles, adjustable sizing, several charms at once, multi-monitor placement, and any image as a charm. Lucky Dangle publishes no comparable list.",
        points: [
          "Hangly: 81 charms, 14 collections, custom images, 3 cords, size control",
          "Lucky Dangle: a curated charm set, count not published",
        ],
      },
      {
        question: "Which is best for desktop charms specifically?",
        answer:
          "Both are built for exactly this, which is what makes them the closest pair here. If the charm you want already exists in one of Hangly's collections, or you want to hang your own image, Hangly. If Lucky Dangle's designs are the ones you want, take those.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Is Hangly or Lucky Dangle better?",
        a: "If you want to hang your own images as charms, or want the themed collections, Hangly. If you prefer the smaller, simpler product and its curated set suits you, Lucky Dangle. Both are physics-based charms on Mac and Windows that stay out of your clicks.",
      },
      {
        q: "Is Lucky Dangle free?",
        a: "Check their site for current pricing. Hangly is free with no paid tier, no subscription and no advertising.",
      },
      {
        q: "Is there a Lucky Dangle alternative for Windows ARM?",
        a: "Hangly ships a native ARM64 build for Windows on Snapdragon and similar machines, detected automatically from browser client hints rather than the user agent string.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "screen-dangle",
    quickAnswer:
      "Both are free desktop charm apps for Mac and Windows. Screen Dangle is a studio: you build the charm. Hangly is a library: you pick from eleven finished collections, with your own images available when nothing fits. Neither costs anything, so the fastest way to decide is to try both.",
    takeaways: [
      "Both free, both Mac and Windows",
      "Screen Dangle is built around configuring a charm yourself",
      "Hangly is built around eleven finished collections",
      "Screen Dangle has by far the larger published content surface",
      "Only Hangly publishes a native Windows ARM64 build",
    ],
    inShort:
      "A genuine toss-up, and both are free. Take Screen Dangle if building the charm is the appeal; take Hangly if you would rather hang something finished in under a minute.",
    bestFor: [
      { who: "Someone who enjoys configuring things", why: "Screen Dangle's studio is built for exactly that." },
      { who: "Someone who wants a charm on screen immediately", why: "Hangly's fourteen collections mean no setup." },
      { who: "Anyone wanting a specific cultural charm", why: "Hangly's Protection and Tamil Divine sets ship them ready-made." },
    ],
    name: "Screen Dangle",
    url: "https://od2.in/screen-dangle",
    title: "Hangly vs Screen Dangle: Free Desktop Charms",
    description:
      "Both are free desktop charm apps for Mac and Windows. Screen Dangle leans toward a studio; Hangly toward eleven curated collections plus your own photos.",
    h1: "Hangly vs Screen Dangle",
    verdict:
      "Both free, both Mac and Windows. The difference is philosophy: Screen Dangle presents itself as a studio for building a charm, Hangly as a library you choose from — with your own images as an option rather than the starting point.",
    whatIsIt:
      "Screen Dangle, from OD2, describes itself as a free lucky screen charm and desktop talisman studio for Mac and Windows: hang a lucky screen dangle and interactive desktop charm from the top of your screen, with customisation.",
    howHanglyDiffers:
      "Screen Dangle starts from a blank charm you configure. Hangly starts from eleven finished collections you pick out of, and adds your own images when you want something that is not there. Screen Dangle also has a far larger published content surface — over 1,400 indexed URLs against Hangly's handful — which makes it easier to find today.",
    rows: [
      { feature: "Price", hangly: "Free, no paid tier", rival: "Free (their site: 100% free)" },
      { feature: "macOS", hangly: "14+, Apple Silicon & Intel", rival: "Yes" },
      { feature: "Windows", hangly: "10+, x64 and native ARM64", rival: "Yes" },
      { feature: "Approach", hangly: "Pick from collections", rival: "Build in a studio" },
      { feature: "Custom images", hangly: "Yes", rival: "Yes" },
      { feature: "Named collections", hangly: "11", rival: "Not published as collections" },
      { feature: "Cord styles", hangly: "Three", rival: "Customisable" },
    ],
    performance:
      "Neither publishes benchmarks. Both render one small ornament and neither should register on a modern machine. Hangly's physics stops when the charm settles rather than looping.",
    customisation:
      "Different shapes of the same strength. Screen Dangle is built around configuring a charm to taste. Hangly is built around eleven ready collections, with custom images as the escape hatch. If building is the fun part, Screen Dangle; if choosing is, Hangly.",
    privacy:
      "Hangly collects almost nothing and documents all of it on its privacy page; no account, no email. Screen Dangle's own privacy terms should be read on their site before installing.",
    platforms:
      "Hangly: macOS 14+ on Apple Silicon and Intel, Windows 10+ on x64 and native ARM64. Screen Dangle: Mac and Windows per their site.",
    rivalWins: [
      "A deeper customisation studio, if building the charm is the appeal",
      "A far larger content surface — over 1,400 indexed pages, so it is easier to find",
      "Established longer, with more material published about it",
    ],
    hanglyWins: [
      "Eleven curated collections rather than a blank charm",
      "Native Windows ARM64 build",
      "Any photo becomes a charm in one step",
      "Published charm count and collection names",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Both are free and run natively on Mac. Choose Screen Dangle if you want to build a charm to your own specification, and Hangly if you would rather pick from finished collections.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Neither publishes figures. Both draw a single small ornament; the deciding factor in this category is whether the animation idles when nothing moves, which Hangly does.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Screen Dangle, if customisation means configuring one charm in depth. Hangly, if it means variety of finished charms — fourteen collections, eighty-one designs, three cord styles — plus your own images.",
      },
      {
        question: "Which is best for desktop charms specifically?",
        answer:
          "Both are purpose-built for it and both are free, which makes this a genuine toss-up. Try both; they cost nothing.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Are Hangly and Screen Dangle both free?",
        a: "Yes. Screen Dangle describes itself as 100% free, and Hangly has no paid tier, subscription or advertising.",
      },
      {
        q: "Which has more charms?",
        a: "Hangly ships eighty-one across fourteen named collections. Screen Dangle emphasises building your own rather than publishing a count.",
      },
      {
        q: "Does Hangly let me build a charm the way Screen Dangle does?",
        a: "Not in the same way. Screen Dangle is built around configuring a charm yourself; Hangly is built around picking a finished one from fourteen collections, and then accepts any image of your own as a charm. If building it is the appeal, Screen Dangle is the better fit and this page says so.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "danglejoy",
    quickAnswer:
      "Both hang animated cultural and lucky charms that sway on screen. Hangly is free, publishes exactly what it ships \u2014 eighty-one charms across fourteen named collections \u2014 accepts your own images, and runs on Windows including native ARM64. DangleJoy's designs may simply be the ones you prefer.",
    takeaways: [
      "Both centre on cultural and lucky charm designs",
      "Hangly is free with no paid tier",
      "Hangly names its collections and publishes a charm count",
      "Only Hangly accepts your own images as charms",
      "DangleJoy's own designs are a matter of taste",
    ],
    inShort:
      "Overlapping almost exactly in intent. Hangly publishes more and costs nothing; DangleJoy is worth checking if its particular animations appeal.",
    bestFor: [
      { who: "Someone wanting Indian charms specifically", why: "Hangly ships a named Tamil Divine collection plus Nazar and Drishti Bommai." },
      { who: "Someone on Windows ARM", why: "Hangly has the native build." },
      { who: "Someone who likes DangleJoy's art", why: "Design taste is a legitimate reason to choose either." },
    ],
    name: "DangleJoy",
    url: "https://danglejoy.com",
    title: "Hangly vs DangleJoy: Animated Desktop Charms",
    description:
      "DangleJoy offers animated cultural and lucky charms that sway on screen. Hangly covers the same ground free, adds Windows ARM64 and custom charms.",
    h1: "Hangly vs DangleJoy",
    verdict:
      "Very close in intent — animated charms that hang and sway, with cultural and lucky symbols at the centre of both. Hangly's edge is being free, covering Windows ARM64, and accepting your own artwork.",
    whatIsIt:
      "DangleJoy describes beautiful animated charms that hang, sway and move naturally on your screen, letting you personalise your space with cultural icons, lucky symbols and more.",
    howHanglyDiffers:
      "The categories overlap almost exactly. Hangly names its collections rather than describing them generally — a Protection set with the Nazar and Drishti Bommai, a Tamil Divine set with Vel, Vinayagar, Om, Karuppu and a temple bell — publishes a charm count, is free, and runs on Windows ARM64.",
    rows: [
      { feature: "Price", hangly: "Free, no paid tier", rival: "See their site" },
      { feature: "Custom images", hangly: "Yes", rival: "Not advertised" },
      { feature: "Windows ARM64", hangly: "Native build", rival: "Not advertised" },
      { feature: "Cultural charms", hangly: "Nazar, Drishti Bommai, Vel, Om, temple bell", rival: "Cultural icons and lucky symbols" },
      { feature: "Published charm count", hangly: "81 across 14 collections", rival: "Not published" },
      { feature: "Cord styles", hangly: "Three", rival: "Not advertised" },
    ],
    performance:
      "Both animate a small charm. Neither publishes measurements. Hangly's simulation idles once the charm is still, so a hanging charm costs close to nothing.",
    customisation:
      "Hangly publishes what it offers: eighty-one charms, fourteen collections, three cords, size control, several charms at once, and any image as a charm. DangleJoy describes cultural icons and lucky symbols without a published count.",
    privacy:
      "Hangly documents its data collection in full and requires no account. DangleJoy's terms are on their own site.",
    platforms:
      "Hangly: macOS 14+, Windows 10+ including native ARM64. DangleJoy: check their site for current platform support.",
    rivalWins: ["Its own animated charm designs, which are a matter of taste"],
    hanglyWins: [
      "Free, with no paid tier",
      "Custom charms from your own images",
      "Native Windows ARM64 build",
      "Named collections and a published charm count",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Both hang animated charms on a Mac. Hangly is free and publishes exactly what it ships; DangleJoy's designs may simply be the ones you prefer, which is a reasonable basis for choosing.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Neither publishes figures. Both render one animated ornament. Hangly stops animating when the charm comes to rest.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly publishes more: fourteen collections, eighty-one charms, three cord styles, size control and custom images. DangleJoy does not publish a comparable list.",
      },
      {
        question: "Which is best for Indian and cultural charms?",
        answer:
          "Hangly ships a named Tamil Divine collection — Vel, Vinayagar, Om, Karuppu, temple bell — and a Protection collection with the Nazar, Drishti Bommai and Hamsa. DangleJoy describes cultural icons more generally.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Does DangleJoy have Indian charms?",
        a: "Its site mentions cultural icons and lucky symbols. Hangly ships a named Tamil Divine collection — Vel, Vinayagar, Om, Karuppu and a temple bell — and protection charms including the Nazar and Drishti Bommai.",
      },
      {
        q: "Is there a free DangleJoy alternative?",
        a: "Hangly is free on both macOS and Windows with no paid tier, and covers the same cultural and lucky charm ground.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "charmly",
    quickAnswer:
      "Near-identical in concept: a charm on a cord with real pendulum physics that never intercepts a click. Charmly is a focused Mac app. Hangly adds Windows including native ARM64, fourteen collections, custom charms from your own images, three cord styles and adjustable sizing, and is free.",
    takeaways: [
      "Same core idea, down to the pendulum physics",
      "Charmly is Mac only; Hangly also runs on Windows including ARM64",
      "Hangly ships 81 charms across 14 collections",
      "Only Hangly accepts your own images",
      "Charmly is the more focused product",
    ],
    inShort:
      "If you are on a Mac and want the simplest version of this idea, Charmly is a reasonable choice. If you want more charms, your own images, or Windows, Hangly.",
    bestFor: [
      { who: "Anyone on Windows", why: "Charmly is presented as a Mac app; Hangly runs on Windows 10+ including ARM64." },
      { who: "Someone who wants one charm and no settings", why: "Charmly is deliberately focused." },
      { who: "Someone with a photo they want hanging", why: "Hangly turns any image into a charm." },
    ],
    name: "Charmly",
    url: "https://www.glaze.app/app/charmly-rmKwV7",
    title: "Hangly vs Charmly: Mac Desktop Charms",
    description:
      "Charmly hangs a good-luck charm on a cord with physics on Mac. Hangly does the same and adds Windows including ARM64, fourteen collections and custom charms.",
    h1: "Hangly vs Charmly",
    verdict:
      "Near-identical in concept — a charm on a cord with real pendulum physics that stays out of your clicks. Hangly's difference is reach: Windows including native ARM64, fourteen collections, and your own images as charms.",
    whatIsIt:
      "Charmly, distributed through Glaze, hangs a good-luck charm from the top of your screen and leaves it there. It sways on its cord all day with real pendulum physics.",
    howHanglyDiffers:
      "The core idea is the same, down to the pendulum physics. Hangly adds platform reach — Windows 10+ on x64 and native ARM64 — plus fourteen named collections, custom charms from your own images, three cord styles and adjustable sizing.",
    rows: [
      { feature: "macOS", hangly: "14+, Apple Silicon & Intel", rival: "Yes" },
      { feature: "Windows", hangly: "10+, x64 and native ARM64", rival: "No" },
      { feature: "Pendulum physics", hangly: "Yes", rival: "Yes" },
      { feature: "Custom images", hangly: "Yes", rival: "Not advertised" },
      { feature: "Collections", hangly: "11 named", rival: "Not published" },
      { feature: "Price", hangly: "Free, no paid tier", rival: "See their listing" },
      { feature: "Distribution", hangly: "Direct download, signed & notarised", rival: "Through Glaze" },
    ],
    performance:
      "Both simulate a pendulum, which is arithmetic rather than a load. Hangly stops the simulation once the charm settles. Neither publishes benchmarks.",
    customisation:
      "Hangly ships more of it: fourteen collections, eighty-one charms, three cords, adjustable size and any image as a charm. Charmly presents a focused charm set.",
    privacy:
      "Hangly documents its collection in full, requires no account and never reads your screen. Charmly's terms are published through Glaze.",
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including native ARM64. Charmly: presented as a Mac app.",
    rivalWins: [
      "A focused Mac-only product with less surface area",
      "Distribution through Glaze, if you already use it",
    ],
    hanglyWins: [
      "Windows 10+ including native ARM64",
      "Eleven themed collections",
      "Custom charms from your own images",
      "Three cord styles and adjustable sizing",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "On Mac alone they are very close — both hang a charm on a cord with pendulum physics and neither intercepts clicks. Hangly ships more charms and accepts your own images; Charmly is the more focused product.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Neither publishes figures, and both simulate a single pendulum, which is trivial arithmetic. Hangly stops simulating once the charm is at rest.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly: fourteen collections, eighty-one charms, three cord styles, adjustable size and custom images from your own files.",
      },
      {
        question: "Which works on Windows?",
        answer:
          "Hangly. Charmly is presented as a Mac app; Hangly runs on Windows 10 and later, including a native ARM64 build.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Does Charmly work on Windows?",
        a: "Charmly is presented as a Mac app. Hangly runs on Windows 10 and later, including a native ARM64 build.",
      },
      {
        q: "Is there a free Charmly alternative?",
        a: "Hangly is free with no paid tier and covers the same idea — a charm on a cord with pendulum physics that ignores clicks.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "shimeji",
    quickAnswer:
      "Shimeji characters roam, climb windows and drag them about, and the popular version today is a browser extension confined to web pages. Hangly is a native app that hangs one charm across every application and never interrupts. Both accept your own artwork; only Hangly needs a single image rather than a sprite sheet.",
    takeaways: [
      "Shimeji roams and manipulates windows; Hangly stays put",
      "Shimeji's popular form is a browser extension, limited to web pages",
      "Hangly is a native app visible across every application",
      "Shimeji has a vast community character library",
      "Hangly needs one image; Shimeji needs a sprite sheet",
    ],
    inShort:
      "Different products for different wants. Shimeji for an animated character with a huge library; Hangly for something present everywhere that cannot interrupt and is signed and notarised.",
    bestFor: [
      { who: "Someone who lives in the browser", why: "Shimeji runs there with nothing to install." },
      { who: "Someone who wants it visible in every app", why: "Hangly is a native app, not an extension." },
      { who: "Someone with one image and no patience for sprite sheets", why: "Hangly takes a single image." },
    ],
    name: "Shimeji",
    url: "https://shimejis.xyz",
    title: "Hangly vs Shimeji: Desktop Companions Compared",
    description:
      "Shimeji characters climb and drag your windows in the browser. Hangly hangs a charm from the top of your screen as a native app. Both accept your own artwork.",
    h1: "Hangly vs Shimeji",
    verdict:
      "Both let you put your own artwork on screen, and there the similarity ends. Shimeji characters roam, climb windows and throw them about, and the popular version today is a browser extension. Hangly is a native desktop app with a charm that stays where you hang it.",
    whatIsIt:
      "Shimeji, in its current popular form, is a browser extension: play with little shimejis while browsing the web, choosing a character that moves around and interacts with elements on the page.",
    howHanglyDiffers:
      "Scope and behaviour. Shimeji lives inside the browser and interacts with web page elements; Hangly is a native app visible across every application. Shimeji characters roam and manipulate windows; Hangly's charm hangs from a fixed point and never takes focus or intercepts a click.",
    rows: [
      { feature: "Type", hangly: "Native desktop app", rival: "Browser extension (and legacy desktop)" },
      { feature: "Scope", hangly: "Whole screen, every app", rival: "Web pages" },
      { feature: "Behaviour", hangly: "Hangs and sways", rival: "Climbs, roams, drags windows" },
      { feature: "Your own artwork", hangly: "Yes", rival: "Yes, large community library" },
      { feature: "Interrupts your work", hangly: "Never", rival: "By design" },
      { feature: "Price", hangly: "Free", rival: "Free" },
      { feature: "Signed & notarised", hangly: "Yes on macOS", rival: "Extension store review" },
    ],
    performance:
      "A browser extension animating characters over page content competes with the page's own rendering, and several shimejis at once is measurably heavier than one. Hangly draws one charm outside the browser entirely and idles when it is still.",
    customisation:
      "Shimeji wins on breadth of characters — a large community library built over many years. Hangly wins on finished, curated sets and on hanging any single image without preparing a sprite sheet.",
    privacy:
      "A browser extension necessarily has access to the pages it runs on; check the permissions any Shimeji extension requests. Hangly is a native app that never reads your screen, requires no account, and documents its collection in full.",
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including ARM64, natively. Shimeji: wherever the browser extension runs, plus legacy desktop builds.",
    rivalWins: [
      "A vast community library of characters",
      "Animated behaviour — climbing, falling, dragging windows",
      "Runs in the browser with nothing to install",
    ],
    hanglyWins: [
      "Native app, visible across every application rather than only web pages",
      "Signed, notarised and self-updating",
      "Never interferes with what you are doing",
      "One image becomes a charm without a sprite sheet",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Hangly, if you want something present across your whole desktop rather than only inside the browser, and if you want it signed and notarised. Shimeji, if the roaming character is the point and the browser is where you spend your day.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Hangly, in practice. It draws one charm outside the browser and stops animating when it settles. A browser extension animating characters over live page content competes with the page's own rendering, and several at once compounds it.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Shimeji, for sheer number of characters — a community library built over many years. Hangly is simpler to customise: one image becomes a charm with no sprite sheet to prepare.",
      },
      {
        question: "Which is best for desktop charms specifically?",
        answer:
          "Hangly. Shimeji is a desktop pet: characters that move about. A charm hangs from a fixed point, which is what Hangly does and Shimeji does not.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Is Hangly a Shimeji alternative?",
        a: "Partly. If you want a character that roams and interacts with windows, Shimeji is closer. If you want something present across every app rather than only in the browser, and you want it to stay put, Hangly.",
      },
      {
        q: "Can I use my own image in Hangly like a Shimeji?",
        a: "Yes, and more simply — Shimeji characters need a sprite sheet of poses, while a Hangly charm is a single image.",
      },
      {
        q: "Is there a Shimeji for macOS that is not a browser extension?",
        a: "Hangly is a native macOS app, though it hangs a charm rather than animating a roaming character.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "desktop-goose",
    quickAnswer:
      "Desktop Goose interferes with your work on purpose \u2014 mud on the screen, stolen cursor, notes dragged into view. Hangly cannot interfere at all: it is click-through and never takes focus. They appeal to the same instinct for company on screen and behave in opposite ways. Choose by whether you want to be interrupted.",
    takeaways: [
      "Desktop Goose is deliberately disruptive; that is the joke",
      "Hangly is click-through and never takes focus",
      "Hangly is safe during meetings, demos and screen shares",
      "Desktop Goose has a cultural following Hangly does not",
      "If you loved the goose for the chaos, Hangly will disappoint you",
    ],
    inShort:
      "Opposites. Keep Desktop Goose for the joke on a day you can afford it; take Hangly if you want presence on screen without any risk of interruption.",
    bestFor: [
      { who: "Anyone who screen-shares for work", why: "Hangly cannot interrupt; Desktop Goose will." },
      { who: "Someone who wants to laugh", why: "Desktop Goose is genuinely funny and Hangly is not trying to be." },
      { who: "Someone on a laptop on battery", why: "Hangly stops animating at rest; the goose never stops moving." },
    ],
    name: "Desktop Goose",
    url: "https://samperson.itch.io/desktop-goose",
    title: "Hangly vs Desktop Goose: Calm or Chaos",
    description:
      "Desktop Goose interrupts your work on purpose. Hangly never can — it cannot be clicked and never takes focus. Same instinct, opposite behaviour.",
    h1: "Hangly vs Desktop Goose",
    verdict:
      "These are opposites that appeal to the same instinct. Desktop Goose drags mud across your screen and steals your cursor, deliberately. Hangly hangs one charm that cannot interrupt anything. Choose by whether you want to be interfered with.",
    whatIsIt:
      "Desktop Goose, by Sam Chiet, is a desktop pet that actively interferes with your work: it tracks mud across the screen, drags notes into view, steals the cursor and generally misbehaves. The interference is the joke.",
    howHanglyDiffers:
      "Completely, in behaviour. Hangly is click-through by design — anything you click reaches the window underneath — and never takes focus or moves your cursor. Desktop Goose exists to interrupt; Hangly is built so it cannot.",
    rows: [
      { feature: "Interrupts your work", hangly: "Never", rival: "Constantly, by design" },
      { feature: "Safe during a meeting or demo", hangly: "Yes", rival: "No" },
      { feature: "Takes your cursor", hangly: "Never", rival: "Yes" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "Windows, macOS" },
      { feature: "Price", hangly: "Free", rival: "Pay what you want" },
      { feature: "Customisation", hangly: "81 charms, your own images", rival: "A goose" },
      { feature: "Signed & notarised", hangly: "Yes on macOS", rival: "Check the current build" },
    ],
    performance:
      "Desktop Goose animates a sprite that moves continuously across the screen and manipulates windows, so it is always doing something. Hangly renders one charm and stops when it settles. On a laptop on battery that difference is real.",
    customisation:
      "Desktop Goose has mods and alternate assets from its community, but the concept is one goose. Hangly ships eighty-one charms across fourteen collections, three cord styles, adjustable sizing and any image as a charm.",
    privacy:
      "Hangly documents its data collection, requires no account and never reads your screen. Desktop Goose is distributed through itch.io; review the current build's own terms.",
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including ARM64. Desktop Goose: Windows and macOS builds via itch.io.",
    rivalWins: [
      "It is genuinely funny, which Hangly is not trying to be",
      "A cultural landmark with an audience Hangly does not have",
      "Actively interactive, if interruption is the point",
    ],
    hanglyWins: [
      "Never intercepts a click or takes focus",
      "Safe to leave running during work, meetings and screen shares",
      "Signed, notarised and self-updating on macOS",
      "Eighty-one charms plus your own images",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Hangly for anything resembling work: it is signed, notarised, updates itself and cannot interfere. Desktop Goose if you want the joke and can afford the interruption.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Hangly. Desktop Goose animates a sprite that moves continuously and manipulates windows; Hangly renders one charm and stops animating when it comes to rest.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly, by design — eighty-one charms, fourteen collections, three cords, adjustable size and any image. Desktop Goose has community mods, but the concept remains one goose.",
      },
      {
        question: "Which is best for desktop charms specifically?",
        answer:
          "Hangly. Desktop Goose is a desktop pet, and a deliberately disruptive one; it is not a charm app in any sense.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Is Hangly a good Desktop Goose alternative?",
        a: "Only if what you wanted was the company rather than the chaos. Desktop Goose interferes with your work on purpose; Hangly cannot interfere at all. If you liked the goose because it was disruptive, Hangly will disappoint you.",
      },
      {
        q: "Is there a calmer Desktop Goose?",
        a: "Hangly is about as calm as this category gets — a charm that hangs and sways and cannot be clicked. For something animate but less destructive, desktop pets such as MicroJoyz or Cat Fidget sit between the two.",
      },
      {
        q: "Is there a Desktop Goose that does not interrupt work?",
        a: "Hangly is click-through by design: anything you click reaches the window underneath, and it never takes focus or moves your cursor.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "runcat",
    quickAnswer:
      "These are not alternatives. RunCat animates a menu bar icon at a speed set by CPU load, so it is a system monitor. Hangly hangs a decorative charm and reports nothing. They occupy different slots and running both is common and sensible.",
    takeaways: [
      "RunCat reports CPU, memory and network through animation speed",
      "Hangly is decoration with no monitoring function",
      "RunCat is macOS only; Hangly also runs on Windows",
      "Neither replaces the other",
      "Running both together is normal",
    ],
    inShort:
      "Not competitors. If you want to know what your machine is doing, RunCat. If you want the top of the screen to be pleasant, Hangly. Most people who want both simply install both.",
    bestFor: [
      { who: "Someone watching CPU load", why: "RunCat is a monitor; Hangly reports nothing." },
      { who: "Someone on Windows", why: "RunCat is Mac only." },
      { who: "Someone who wants both", why: "They do not conflict \u2014 different slots, different jobs." },
    ],
    name: "RunCat",
    url: "https://kyome.io/runcat",
    title: "Hangly vs RunCat: Decoration or Monitoring",
    description:
      "RunCat animates a menu bar icon at the speed of your CPU. Hangly hangs a decorative charm from your screen. Different jobs — running both is common.",
    h1: "Hangly vs RunCat",
    verdict:
      "Not really competitors. RunCat is a system monitor in a cat costume: the animation speed reports your CPU load. Hangly is decoration with no monitoring function. Running both is sensible and common.",
    whatIsIt:
      "RunCat, by Takuto Nakamura, is a macOS menu bar application that animates a running character whose speed reflects CPU usage, with variants reporting memory, network and other system metrics.",
    howHanglyDiffers:
      "Purpose. RunCat tells you something — how hard your machine is working — through the speed of an animation. Hangly tells you nothing and is not trying to; it is an ornament. They occupy different slots and do not conflict.",
    rows: [
      { feature: "Purpose", hangly: "Decoration", rival: "System monitoring" },
      { feature: "Reports CPU load", hangly: "No", rival: "Yes" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "macOS" },
      { feature: "Where it lives", hangly: "Hangs below the menu bar", rival: "Menu bar icon" },
      { feature: "Customisation", hangly: "81 charms, your own images", rival: "Many runner characters" },
      { feature: "Price", hangly: "Free", rival: "Free" },
    ],
    performance:
      "RunCat polls system metrics continuously, which is its function, and animates at a rate tied to load. Hangly does no polling at all and stops animating when the charm settles. Both are light; neither is a reason to choose.",
    customisation:
      "RunCat offers many runner characters within a fixed menu bar slot. Hangly offers eighty-one charms, fourteen collections, three cord styles, adjustable size and any image. Different axes.",
    privacy:
      "Neither requires an account. RunCat reads system performance counters, which is what it is for. Hangly reads nothing about your system and documents its collection in full.",
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including ARM64. RunCat: macOS.",
    rivalWins: [
      "Tells you something useful — CPU, memory and network at a glance",
      "A minimal footprint entirely inside the menu bar",
      "A long-established Mac utility with a large following",
    ],
    hanglyWins: [
      "Windows as well as macOS",
      "Eighty-one charms plus your own images",
      "A visible presence on screen rather than a small icon",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "They are not alternatives. RunCat if you want a CPU indicator that is pleasant to look at; Hangly if you want decoration. Many people run both, because they occupy different slots.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Hangly does less work: it polls nothing and stops animating when the charm is at rest. RunCat polls system metrics continuously because that is its function. Both are light.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Different axes. RunCat offers many runner characters inside one menu bar slot. Hangly offers eighty-one charms, three cords, adjustable size and any image, hanging anywhere along the screen top.",
      },
      {
        question: "Which is best for desktop charms specifically?",
        answer: "Hangly. RunCat is a system monitor and does not hang charms.",
      },
      {
        question: "Which is best for menu bar customisation?",
        answer:
          "RunCat, within its own definition — it replaces a menu bar icon with a live animation. Neither app rearranges or hides menu bar items; for that, a utility such as Bartender or Ice is the right category.",
      },
    ],
    faqs: [
      {
        q: "Is Hangly a RunCat alternative?",
        a: "Not a replacement — they do different jobs. RunCat shows system load through animation speed; Hangly is purely decorative. If you want both, run both.",
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
    quickAnswer:
      "Dockling generates a pixel pet from a photo and attaches Pomodoro timers, streaks and notes, for $2.99 on Mac. Hangly hangs a charm and deliberately adds nothing to your workflow, free, on Mac and Windows. Choose by whether you want your ornament to also prompt you.",
    takeaways: [
      "Dockling adds Pomodoro timers, streaks and quick notes",
      "Hangly adds no workflow features, on purpose",
      "Dockling is $2.99 and Mac only; Hangly is free and cross-platform",
      "Both turn your own photo into something on screen",
      "Hangly ships 81 ready-made charms; Dockling generates from your photo",
    ],
    inShort:
      "Dockling if you want the character to also run your timer. Hangly if you want decoration that asks nothing of you, free, on either platform.",
    bestFor: [
      { who: "Someone who wants a Pomodoro timer with a face", why: "That is exactly what Dockling is for." },
      { who: "Someone who finds productivity features distracting", why: "Hangly has none." },
      { who: "Anyone on Windows", why: "Dockling is Mac only." },
    ],
    name: "Dockling",
    url: "https://dockling.space",
    title: "Hangly vs Dockling: Charm or Productivity Pet",
    description:
      "Dockling turns a photo into a pixel pet with Pomodoro timers and streaks for $2.99. Hangly hangs a charm and adds nothing to your workflow, deliberately.",
    h1: "Hangly vs Dockling",
    verdict:
      "Dockling is a productivity companion that happens to be charming — Pomodoro, streaks, quick notes, $2.99 once. Hangly is decoration that deliberately adds nothing to your workflow. Choose by whether you want your ornament to also prompt you.",
    whatIsIt:
      "Dockling generates a personal pixel pet from any photo and lives in your dock, menu bar or notch, with Pomodoro timers, streaks and quick notes. Its own site lists $2.99 once, with no subscription.",
    howHanglyDiffers:
      "Dockling adds function: timers, streaks and notes attached to a character. Hangly adds none of that on purpose — it hangs a charm and stays out of the way. Hangly is also free and covers Windows; Dockling is a paid Mac app.",
    rows: [
      { feature: "Price", hangly: "Free", rival: "$2.99 once" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "macOS" },
      { feature: "Productivity features", hangly: "None, deliberately", rival: "Pomodoro, streaks, notes" },
      { feature: "From your photo", hangly: "Yes, as a charm", rival: "Yes, as a pixel pet" },
      { feature: "Where it lives", hangly: "Hangs below the menu bar", rival: "Dock, menu bar or notch" },
      { feature: "Ready-made designs", hangly: "81 across 14 collections", rival: "Generated from your photo" },
    ],
    performance:
      "Dockling runs timers and tracks streaks, so it has ongoing state and periodic work. Hangly has neither; it stops animating when the charm is still. Both are small.",
    customisation:
      "Dockling generates a pet from a photo, which is its whole customisation model. Hangly does that too and adds fourteen collections of finished charms, three cord styles and size control.",
    privacy:
      "Hangly requires no account, documents its collection in full and never reads your screen. Dockling's terms are on their own site; note that streaks imply stored state.",
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including ARM64. Dockling: macOS.",
    rivalWins: [
      "Pomodoro timers, streaks and quick notes built in",
      "Generates a pixel pet from any photo",
      "Lives in the dock, menu bar or notch as you prefer",
    ],
    hanglyWins: [
      "Free rather than $2.99",
      "Windows as well as macOS",
      "Eighty-one ready-made charms across fourteen collections",
      "No productivity features to ignore",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Dockling if you want the Pomodoro timer and streaks alongside the character. Hangly if you want something on screen that never asks anything of you, and free.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Hangly does less: no timers, no streak tracking, no stored state, and animation that stops when the charm settles. Dockling's features imply ongoing work, though it is still a small app.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly ships more ready-made variety — fourteen collections, eighty-one charms, three cords, size control — and accepts your own images too. Dockling's model is a pet generated from one photo.",
      },
      {
        question: "Which is best for desktop charms specifically?",
        answer:
          "Hangly. Dockling makes a pixel pet that lives in the dock; it is not a charm on a cord.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Is Dockling or Hangly better?",
        a: "Dockling if you want Pomodoro timers and streaks alongside the character. Hangly if you want decoration that never interrupts, free, on Mac or Windows.",
      },
      {
        q: "Is there a free Dockling alternative?",
        a: "Hangly is free and also turns your own photo into something that lives on screen, though it hangs as a charm rather than walking in the dock.",
      },
    ],
    checked: CHECKED,
  },
];

export const COMPARISON_SLUGS = COMPARISONS.map((c) => c.slug);

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
