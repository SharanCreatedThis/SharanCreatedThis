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
/** Competitors re-read on 9 Oct 2026. */
const CHECKED_3 = "2026-10-09";

/**
 * Hangly's privacy, stated once so every page says the same true thing (from both apps' PRIVACY.md, 2.3.1):
 * the installation record is part of using Hangly, not optional.
 */
const HANGLY_PRIVACY =
  "Hangly needs no account and never reads your screen, your files or the images you turn into charms. It does register each installation with its developer (a random ID, the nickname you choose, your city worked out from your connection, your versions and when it was used) and sends anonymous usage events and crash reports; the privacy page lists all of it.";

/** Shared, so every page answers the menu-bar question the same way. */
const MENU_BAR_ANSWER =
  "Hangly runs from the macOS menu bar and the Windows system tray, but it is not a menu bar customisation tool — it hangs a charm below the menu bar rather than changing the bar itself. For rearranging or hiding menu bar items, a dedicated utility such as Bartender or Ice is the right category. Hangly sits alongside those rather than replacing them.";

export const COMPARISONS: Comparison[] = [
  {
    slug: "lucky-dangle",
    quickAnswer:
      "Both hang a charm on a cord from the top of your screen, on Mac and Windows, and both let clicks through everywhere but the charm. Hangly is free and ships 161 charms across 21 collections plus any image of your own. Lucky Dangle costs $7.77 (₹777) once, has about a dozen charms with a small ritual each, and takes your photo or any emoji.",
    takeaways: [
      "Both are click-through: neither blocks what is underneath",
      "Hangly is free; Lucky Dangle is $7.77 (₹777) once, or $11.11 for Extra Lucky",
      "Hangly ships 161 charms across 21 collections; Lucky Dangle about a dozen, each with a ritual",
      "Both take your own photo; Hangly takes any image, Lucky Dangle also any emoji",
      "Only Hangly publishes a native Windows ARM64 build",
    ],
    inShort:
      "These are the two closest products in the category. Hangly wins on price and breadth: it is free, with 161 charms, nine rope styles and a native ARM64 build. Lucky Dangle wins on ritual: every charm has a small thing it can do, and keyboard shortcuts call it down or perform it. Hangly costs nothing to try; Lucky Dangle is a one-time purchase covering both platforms.",
    bestFor: [
      { who: "Someone who wants it free", why: "Hangly costs nothing, with no paid tier; Lucky Dangle is $7.77 once." },
      { who: "A Windows-on-ARM laptop", why: "Hangly ships a native ARM64 binary rather than running under x64 emulation." },
      { who: "Someone who loves the ritual of it", why: "Every Lucky Dangle charm has a small ritual, from painting the daruma's eye to replacing the garland." },
    ],
    name: "Lucky Dangle",
    url: "https://luckydangle.app",
    title: "Hangly vs Lucky Dangle: Desktop Charms Compared",
    description:
      "Both hang a lucky charm from the top of your screen on Mac and Windows. Hangly is free with 161 charms; Lucky Dangle is $7.77 with a ritual for each charm.",
    h1: "Hangly vs Lucky Dangle",
    verdict:
      "The closest comparison in this list. Both hang a charm on a cord from the top of the screen, on Mac and Windows, and both stay out of every click. Hangly's advantages are price and breadth: free, 161 charms across 21 collections, nine rope styles and a native ARM64 build. Lucky Dangle's is its rituals.",
    whatIsIt:
      "Lucky Dangle is a desktop charm app for Mac and Windows by Karthik Mahadevan. Its own description: choose a lucky charm and hang it from the top of your screen, where it sways while you work, stays out of every click, and drops in when you call it. About a dozen charms from traditions around the world each have a small ritual, and you can hang your own photo or any emoji instead. It costs $7.77 (₹777) once, covering both platforms.",
    howHanglyDiffers:
      "Hangly occupies the same shelf for free and with far more in it: 161 charms across 21 named collections — protection charms, spiritual symbols, Marvel, DC, Pokémon, BTS and more — plus any image of your own, nine rope styles, adjustable charm size, up to three charms on one rope, and a native Windows ARM64 build.",
    rows: [
      { feature: "Price", hangly: "Free, no paid tier", rival: "$7.77 (₹777) once; $11.11 Extra Lucky" },
      { feature: "macOS", hangly: "14+, Apple Silicon & Intel", rival: "14+" },
      { feature: "Windows", hangly: "10+ x64; 11 on native ARM64", rival: "Yes" },
      { feature: "Custom charms", hangly: "Any image", rival: "Your photo, or any emoji" },
      { feature: "Charm count", hangly: "161 across 21 collections", rival: "About a dozen, each with a ritual" },
      { feature: "Cord styles", hangly: "Nine, from thread and leather to gold chain and neon", rival: "Not advertised" },
      { feature: "Adjustable size", hangly: "Yes", rival: "Not advertised" },
      { feature: "Click-through", hangly: "Everywhere but the charm", rival: "Stays out of every click" },
      { feature: "Account required", hangly: "No", rival: "No account or licence key" },
      { feature: "Keyboard shortcuts", hangly: "No", rival: "Yes: call it down, perform its ritual" },
    ],
    performance:
      "Both are small ornaments rendering on an otherwise idle strip of screen, so neither is a meaningful load. Hangly stops its physics simulation when the charm comes to rest rather than running an animation loop indefinitely, which is the detail that decides battery cost in apps of this kind. Lucky Dangle does not publish its approach.",
    customisation:
      "Hangly ships 161 charms across 21 collections, nine rope styles, adjustable sizing, up to three charms on one rope and multi-monitor placement, plus any image as a charm. Lucky Dangle offers about a dozen charms, each with a ritual, plus your photo or any emoji, and can send the charm behind your windows on crowded days.",
    privacy:
      HANGLY_PRIVACY + " Lucky Dangle publishes its own privacy page and states no account and no licence keys.",
    platforms:
      "Hangly: macOS 14 Sonoma and later on Apple Silicon and Intel; Windows 10 (version 1809) and later on x64, and Windows 11 on native ARM64. Lucky Dangle: macOS 14 and later, and Windows, with one purchase covering both; no Windows architecture detail published.",
    rivalWins: [
      "A small ritual for every charm, and keyboard shortcuts to call it down or perform it",
      "Any emoji as a charm",
      "Its own curated charm designs, which are a matter of taste",
    ],
    hanglyWins: [
      "Free, where Lucky Dangle is $7.77",
      "161 charms across 21 collections",
      "Nine rope styles and adjustable charm size",
      "Native Windows ARM64 build",
      "Up to three charms on one rope",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Both run natively on Mac and behave the same way: a charm on a cord that lets clicks through. Hangly is the better fit if you want it free or want the collections; Lucky Dangle if its rituals and shortcuts are what appeal and $7.77 is fine.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Neither publishes benchmarks, and both are small ornaments on an idle strip of screen. Hangly pauses its physics when the charm is at rest rather than animating continuously, which is the behaviour that decides battery cost in this category.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly, on breadth: 161 charms across 21 collections, nine rope styles, adjustable sizing, several charms at once, multi-monitor placement, and any image as a charm. Lucky Dangle's customisation is its rituals, your photo and any emoji.",
        points: [
          "Hangly: 161 charms, 21 collections, custom images, 9 ropes, size control",
          "Lucky Dangle: about a dozen charms with rituals, your photo, any emoji",
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
        a: "If you want it free, or want the themed collections, Hangly. If a ritual for every charm appeals and you are happy to pay $7.77 once, Lucky Dangle. Both are physics-based charms on Mac and Windows that stay out of your clicks.",
      },
      {
        q: "Is Lucky Dangle free?",
        a: "No. Lucky Dangle is $7.77 (₹777) once, or $11.11 for Extra Lucky, which also moves your charm suggestion up the queue (9 October 2026). Hangly is free with no paid tier, no subscription and no advertising.",
      },
      {
        q: "Is there a Lucky Dangle alternative for Windows ARM?",
        a: "Hangly ships a native ARM64 build for Windows on Snapdragon and similar machines, detected automatically from browser client hints rather than the user agent string.",
      },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "screen-dangle",
    quickAnswer:
      "Both are free desktop charm apps for Mac and Windows. Screen Dangle is a studio: you build the charm. Hangly is a library: you pick from 21 finished collections, with your own images available when nothing fits. Neither costs anything, so the fastest way to decide is to try both.",
    takeaways: [
      "Both free, both Mac and Windows",
      "Screen Dangle is built around configuring a charm yourself",
      "Hangly is built around 21 finished collections",
      "Screen Dangle has by far the larger published content surface",
      "Only Hangly publishes a native Windows ARM64 build",
    ],
    inShort:
      "A genuine toss-up, and both are free. Take Screen Dangle if building the charm is the appeal; take Hangly if you would rather hang something finished in under a minute.",
    bestFor: [
      { who: "Someone who enjoys configuring things", why: "Screen Dangle's studio is built for exactly that." },
      { who: "Someone who wants a charm on screen immediately", why: "Hangly's 21 collections mean no setup." },
      { who: "Anyone wanting a specific cultural charm", why: "Hangly's Protection and Spirituality sets ship them ready-made." },
    ],
    name: "Screen Dangle",
    url: "https://od2.in/screen-dangle",
    title: "Hangly vs Screen Dangle: Free Desktop Charms",
    description:
      "Both are free desktop charm apps for Mac and Windows. Screen Dangle leans toward a studio; Hangly toward 21 curated collections plus your own photos.",
    h1: "Hangly vs Screen Dangle",
    verdict:
      "Both free, both Mac and Windows. The difference is philosophy: Screen Dangle presents itself as a studio for building a charm, Hangly as a library you choose from — with your own images as an option rather than the starting point.",
    whatIsIt:
      "Screen Dangle, from OD2, describes itself as a free lucky screen charm and desktop talisman studio for Mac and Windows: hang a lucky screen dangle and interactive desktop charm from the top of your screen, with customisation.",
    howHanglyDiffers:
      "Screen Dangle starts from a blank charm you configure. Hangly starts from 21 finished collections you pick out of, and adds your own images when you want something that is not there. Screen Dangle also has a far larger published content surface — over 1,400 indexed URLs against Hangly's handful — which makes it easier to find today.",
    rows: [
      { feature: "Price", hangly: "Free, no paid tier", rival: "Free (their site: 100% free)" },
      { feature: "macOS", hangly: "14+, Apple Silicon & Intel", rival: "Yes" },
      { feature: "Windows", hangly: "10+, x64 and native ARM64", rival: "Yes" },
      { feature: "Approach", hangly: "Pick from collections", rival: "Build in a studio" },
      { feature: "Custom images", hangly: "Yes", rival: "Yes" },
      { feature: "Named collections", hangly: "11", rival: "Not published as collections" },
      { feature: "Rope styles", hangly: "Nine", rival: "Customisable" },
    ],
    performance:
      "Neither publishes benchmarks. Both render one small ornament and neither should register on a modern machine. Hangly's physics stops when the charm settles rather than looping.",
    customisation:
      "Different shapes of the same strength. Screen Dangle is built around configuring a charm to taste. Hangly is built around 21 ready collections, with custom images as the escape hatch. If building is the fun part, Screen Dangle; if choosing is, Hangly.",
    privacy:
      HANGLY_PRIVACY + " Screen Dangle's own privacy terms should be read on their site before installing.",
    platforms:
      "Hangly: macOS 14+ on Apple Silicon and Intel, Windows 10+ on x64 and Windows 11 on native ARM64. Screen Dangle: Mac and Windows per their site.",
    rivalWins: [
      "A deeper customisation studio, if building the charm is the appeal",
      "A far larger content surface — over 1,400 indexed pages, so it is easier to find",
      "Established longer, with more material published about it",
    ],
    hanglyWins: [
      "21 curated collections rather than a blank charm",
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
          "Screen Dangle, if customisation means configuring one charm in depth. Hangly, if it means variety of finished charms — 21 collections, 161 designs, nine rope styles — plus your own images.",
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
        a: "Hangly ships 161 across 21 named collections. Screen Dangle emphasises building your own rather than publishing a count.",
      },
      {
        q: "Does Hangly let me build a charm the way Screen Dangle does?",
        a: "Not in the same way. Screen Dangle is built around configuring a charm yourself; Hangly is built around picking a finished one from 21 collections, and then accepts any image of your own as a charm. If building it is the appeal, Screen Dangle is the better fit and this page says so.",
      },
    ],
    checked: CHECKED,
  },
  {
    slug: "danglejoy",
    quickAnswer:
      "Both hang animated cultural and lucky charms that sway on screen, and both take your own images. Hangly is free, with 161 charms across 21 named collections and a native Windows ARM64 build. DangleJoy is a one-time purchase ($3.99 on the Mac App Store, $4.99 elsewhere) with 30-plus charms including film stars, and it also runs on Android.",
    takeaways: [
      "Both centre on cultural and lucky charm designs, and both take your own images",
      "Hangly is free; DangleJoy is $3.99 to $4.99 once (9 October 2026)",
      "Hangly ships 161 charms across 21 collections; DangleJoy 30-plus, including Rajinikanth and Shah Rukh Khan",
      "DangleJoy also runs on Android and is on the Mac App Store; Hangly has a native Windows ARM64 build",
      "DangleJoy's site is in 12 languages",
    ],
    inShort:
      "Overlapping almost exactly in intent. Hangly is free and has five times the charms; DangleJoy is worth its small price if you want it on an Android phone too, want a film-star charm, or would rather buy through the Mac App Store.",
    bestFor: [
      { who: "Someone who wants it free", why: "Hangly costs nothing, with no paid tier." },
      { who: "Someone who wants charms on an Android phone too", why: "DangleJoy runs on Android as well as Mac and Windows." },
      { who: "A fan of Tamil or Hindi cinema", why: "DangleJoy has Rajinikanth and Shah Rukh Khan charms." },
      { who: "Someone on Windows ARM", why: "Hangly has the native build." },
    ],
    name: "DangleJoy",
    url: "https://danglejoy.com",
    title: "Hangly vs DangleJoy: Animated Desktop Charms",
    description:
      "DangleJoy offers 30+ animated cultural and lucky charms for $3.99 to $4.99. Hangly is free with 161 charms, custom images and Windows ARM64.",
    h1: "Hangly vs DangleJoy",
    verdict:
      "Very close in intent: animated charms that hang and sway, with cultural and lucky symbols at the centre of both, and your own images welcome in both. Hangly's edge is being free, with five times the charms and a native Windows ARM64 build. DangleJoy's is reach: Android, the Mac App Store and a site in 12 languages.",
    whatIsIt:
      "DangleJoy describes beautiful animated charms that hang, sway and move naturally on your screen, with cultural icons, lucky symbols and meaningful designs: more than 30, from the Maneki Neko, Omamori and Daruma to Rajinikanth and Shah Rukh Khan. It runs on macOS 13 and later (through the Mac App Store, $3.99), Windows and Android, as a one-time purchase, and you can create your own charms.",
    howHanglyDiffers:
      "Hangly names its collections rather than describing them generally (a Protection set with the Nazar and Drishti Bommai, a Spirituality set with Vel, Vinayagar, Om and a temple bell, and franchises from Marvel to Pokémon), ships 161 charms, is free, and runs natively on Windows ARM64.",
    rows: [
      { feature: "Price", hangly: "Free, no paid tier", rival: "$3.99 (Mac App Store); $4.99 lifetime elsewhere" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+ (native ARM64 on 11)", rival: "macOS 13+, Windows, Android" },
      { feature: "Custom images", hangly: "Any image", rival: "Your own custom charms" },
      { feature: "Charm count", hangly: "161 across 21 collections", rival: "30+" },
      { feature: "Cultural charms", hangly: "Nazar, Drishti Bommai, Vel, Om, temple bell and more", rival: "Maneki Neko, Omamori, Daruma, Thai bell, milagro and more" },
      { feature: "Rope styles", hangly: "Nine", rival: "Not advertised" },
      { feature: "Website languages", hangly: "English", rival: "12" },
    ],
    performance:
      "Both animate a small charm. Neither publishes measurements. Hangly's simulation idles once the charm is still, so a hanging charm costs close to nothing.",
    customisation:
      "Hangly publishes what it offers: 161 charms, 21 collections, nine ropes, size control, up to three charms on one rope, and any image as a charm. DangleJoy offers 30-plus charms, physics animation, full customisation and your own custom charms.",
    privacy:
      HANGLY_PRIVACY + " DangleJoy publishes its own privacy page and terms.",
    platforms:
      "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. DangleJoy: macOS 13+ through the Mac App Store, Windows, and Android through Google Play.",
    rivalWins: [
      "Android as well as Mac and Windows",
      "On the Mac App Store",
      "Film-star charms, from Rajinikanth to Shah Rukh Khan",
      "A website in 12 languages",
    ],
    hanglyWins: [
      "Free, with no paid tier",
      "161 charms across 21 named collections, five times as many",
      "Nine rope styles and up to three charms on one rope",
      "Native Windows ARM64 build",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "Both hang animated charms on a Mac and take your own images. Hangly is free with 161 charms; DangleJoy is $3.99 on the Mac App Store with 30-plus, including film stars. Choose on price and on whose designs you prefer.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Neither publishes figures. Both render one animated ornament. Hangly stops animating when the charm comes to rest.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly on breadth: 21 collections, 161 charms, nine rope styles, size control and custom images. DangleJoy offers custom charms and full customisation of its 30-plus.",
      },
      {
        question: "Which is best for Indian and cultural charms?",
        answer:
          "Both have them. Hangly ships a Spirituality collection (Vel, Vinayagar, Om, Karuppu, temple bell) and a Protection collection with the Nazar, Drishti Bommai and Hamsa. DangleJoy's include film stars such as Rajinikanth and Shah Rukh Khan.",
      },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      {
        q: "Does DangleJoy have Indian charms?",
        a: "Yes, including film stars such as Rajinikanth and Shah Rukh Khan. Hangly ships a Spirituality collection (Vel, Vinayagar, Om, Karuppu and a temple bell) and protection charms including the Nazar, Drishti Bommai and nimbu-mirchi, free.",
      },
      {
        q: "Is DangleJoy free?",
        a: "No. It is a one-time purchase: $3.99 on the Mac App Store and $4.99 lifetime elsewhere, with Android pricing by country (9 October 2026). Hangly is free.",
      },
      {
        q: "Is there a free DangleJoy alternative?",
        a: "Hangly is free on both macOS and Windows with no paid tier, and covers the same cultural and lucky charm ground with 161 charms.",
      },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "charmly",
    quickAnswer:
      "Near-identical in concept: a charm on a cord with real pendulum physics that lets clicks through. Charmly is a free Mac app with 45 charms across 10 packs, emoji charms, and a cord you pull to switch dark mode. Hangly is free too, and adds Windows including native ARM64, 161 charms across 21 collections, charms from your own images, nine rope styles and adjustable sizing.",
    takeaways: [
      "Same core idea, down to the pendulum physics",
      "Both are free; Charmly is Mac only, Hangly also runs on Windows including ARM64",
      "Hangly ships 161 charms across 21 collections; Charmly 45 across 10 packs",
      "Hangly takes your own images; Charmly takes any emoji",
      "Only Charmly lets you pull the cord to switch dark mode",
    ],
    inShort:
      "If you are on a Mac and like the idea of pulling the cord for dark mode, Charmly is a lovely choice. If you want more charms, your own images, or Windows, Hangly. Both are free.",
    bestFor: [
      { who: "Anyone on Windows", why: "Charmly is presented as a Mac app; Hangly runs on Windows 10+ including ARM64." },
      { who: "Someone who wants the charm to be a light switch", why: "Pull Charmly's cord and the Mac switches between light and dark." },
      { who: "Someone with a photo they want hanging", why: "Hangly turns any image into a charm." },
    ],
    name: "Charmly",
    url: "https://www.glaze.app/app/charmly-rmKwV7",
    title: "Hangly vs Charmly: Mac Desktop Charms",
    description:
      "Charmly hangs a good-luck charm on a cord with physics on Mac: 45 charms, emoji, dark-mode cord. Hangly adds Windows, 161 charms and your own images.",
    h1: "Hangly vs Charmly",
    verdict:
      "Near-identical in concept — a charm on a cord with real pendulum physics that stays out of your clicks. Hangly's difference is reach: Windows including native ARM64, 21 collections, and your own images as charms.",
    whatIsIt:
      "Charmly, distributed through Glaze, hangs a good-luck charm from the top of your screen and leaves it there. It sways on its cord with real pendulum physics, notices when you point at it, and switches the Mac between light and dark when you pull the cord. It has 45 charms across 10 packs, eight hand-drawn world charms and seasonal packs that surface on their own, and any emoji can be a charm.",
    howHanglyDiffers:
      "The core idea is the same, down to the pendulum physics. Hangly adds platform reach — Windows 10+ on x64 and Windows 11 on native ARM64 — plus 21 named collections, custom charms from your own images, nine rope styles and adjustable sizing.",
    rows: [
      { feature: "macOS", hangly: "14+, Apple Silicon & Intel", rival: "Yes" },
      { feature: "Windows", hangly: "10+ x64; 11 on native ARM64", rival: "No" },
      { feature: "Pendulum physics", hangly: "Yes", rival: "Yes" },
      { feature: "Custom charms", hangly: "Any image", rival: "Any emoji" },
      { feature: "Charms", hangly: "161 across 21 collections", rival: "45 across 10 packs" },
      { feature: "Pull the cord for dark mode", hangly: "No", rival: "Yes" },
      { feature: "Price", hangly: "Free, no paid tier", rival: "Free (Glaze listing)" },
      { feature: "Distribution", hangly: "Direct download, signed & notarised", rival: "Through Glaze" },
    ],
    performance:
      "Both simulate a pendulum, which is arithmetic rather than a load. Hangly stops the simulation once the charm settles. Neither publishes benchmarks.",
    customisation:
      "Hangly ships more of it: 21 collections, 161 charms, nine ropes, adjustable size and any image as a charm. Charmly has 45 charms across 10 packs, emoji charms and favourites.",
    privacy:
      HANGLY_PRIVACY + " Charmly's terms are published through Glaze.",
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including native ARM64. Charmly: presented as a Mac app.",
    rivalWins: [
      "Pull the cord to switch the Mac between light and dark",
      "Seasonal packs that surface on their own",
      "Any emoji as a charm",
    ],
    hanglyWins: [
      "Windows 10+ including native ARM64",
      "21 themed collections",
      "Custom charms from your own images",
      "Nine rope styles and adjustable sizing",
    ],
    answers: [
      {
        question: "Which is better for Mac?",
        answer:
          "On Mac alone they are very close: both are free, both hang a charm on a cord with pendulum physics, and neither intercepts clicks. Hangly ships more charms and accepts your own images; Charmly has the dark-mode cord and emoji charms.",
      },
      {
        question: "Which uses fewer resources?",
        answer:
          "Neither publishes figures, and both simulate a single pendulum, which is trivial arithmetic. Hangly stops simulating once the charm is at rest.",
      },
      {
        question: "Which has more customisation?",
        answer:
          "Hangly: 21 collections, 161 charms, nine rope styles, adjustable size and custom images from your own files.",
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
    checked: CHECKED_3,
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
      "A browser extension necessarily has access to the pages it runs on; check the permissions any Shimeji extension requests. " + HANGLY_PRIVACY,
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
      { feature: "Customisation", hangly: "161 charms, your own images", rival: "A goose" },
      { feature: "Signed & notarised", hangly: "Yes on macOS", rival: "Check the current build" },
    ],
    performance:
      "Desktop Goose animates a sprite that moves continuously across the screen and manipulates windows, so it is always doing something. Hangly renders one charm and stops when it settles. On a laptop on battery that difference is real.",
    customisation:
      "Desktop Goose has mods and alternate assets from its community, but the concept is one goose. Hangly ships 161 charms across 21 collections, nine rope styles, adjustable sizing and any image as a charm.",
    privacy:
      HANGLY_PRIVACY + " Desktop Goose is distributed through itch.io; review the current build's own terms.",
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including ARM64. Desktop Goose: Windows and macOS builds via itch.io.",
    rivalWins: [
      "It is genuinely funny, which Hangly is not trying to be",
      "A cultural landmark with an audience Hangly does not have",
      "Actively interactive, if interruption is the point",
    ],
    hanglyWins: [
      "Clicks pass through everywhere but the charm",
      "Safe to leave running during work, meetings and screen shares",
      "Signed, notarised and self-updating on macOS",
      "161 charms plus your own images",
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
          "Hangly, by design — 161 charms, 21 collections, nine ropes, adjustable size and any image. Desktop Goose has community mods, but the concept remains one goose.",
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
      { feature: "Customisation", hangly: "161 charms, your own images", rival: "Many runner characters" },
      { feature: "Price", hangly: "Free", rival: "Free" },
    ],
    performance:
      "RunCat polls system metrics continuously, which is its function, and animates at a rate tied to load. Hangly does no polling at all and stops animating when the charm settles. Both are light; neither is a reason to choose.",
    customisation:
      "RunCat offers many runner characters within a fixed menu bar slot. Hangly offers 161 charms, 21 collections, nine rope styles, adjustable size and any image. Different axes.",
    privacy:
      "Neither requires an account. RunCat reads system performance counters, which is what it is for. " + HANGLY_PRIVACY,
    platforms:
      "Hangly: macOS 14+ and Windows 10+ including ARM64. RunCat: macOS.",
    rivalWins: [
      "Tells you something useful — CPU, memory and network at a glance",
      "A minimal footprint entirely inside the menu bar",
      "A long-established Mac utility with a large following",
    ],
    hanglyWins: [
      "Windows as well as macOS",
      "161 charms plus your own images",
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
          "Different axes. RunCat offers many runner characters inside one menu bar slot. Hangly offers 161 charms, nine ropes, adjustable size and any image, hanging anywhere along the screen top.",
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
      "Hangly ships 161 ready-made charms; Dockling generates from your photo",
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
      { feature: "Ready-made designs", hangly: "161 across 21 collections", rival: "Generated from your photo" },
    ],
    performance:
      "Dockling runs timers and tracks streaks, so it has ongoing state and periodic work. Hangly has neither; it stops animating when the charm is still. Both are small.",
    customisation:
      "Dockling generates a pet from a photo, which is its whole customisation model. Hangly does that too and adds 21 collections of finished charms, nine rope styles and size control.",
    privacy:
      HANGLY_PRIVACY + " Dockling's terms are on their own site; note that streaks imply stored state.",
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
      "161 ready-made charms across 21 collections",
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
          "Hangly ships more ready-made variety — 21 collections, 161 charms, nine ropes, size control — and accepts your own images too. Dockling's model is a pet generated from one photo.",
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
  /* ── Added 9 Oct 2026 from a fresh crawl of each competitor's own site ───── */
  {
    slug: "screen-charms",
    quickAnswer:
      "Both hang a charm from the top of a Mac screen on a physics string. Screen Charms is Mac only, free for one charm (Turkey Nazar), and $4.99 once for its full library and custom images; it also has a Pomodoro focus timer. Hangly is free with all 161 charms and your own images, on Mac and Windows.",
    takeaways: [
      "Screen Charms is free for one charm; PRO is $4.99 once for the library and custom images",
      "Hangly is free with every one of its 161 charms and custom images",
      "Screen Charms has a Pomodoro timer that swings the charm and plays a chime",
      "Screen Charms is Mac only (macOS 13+); Hangly also runs on Windows, including native ARM64",
    ],
    inShort:
      "If you want a focus timer built into your charm and you are on a Mac, Screen Charms does something Hangly does not. If you want the whole collection and your own images without paying, or you use Windows, Hangly.",
    bestFor: [
      { who: "Someone who works in Pomodoro sessions", why: "Screen Charms swings the charm and plays a wind chime when a 1–60 minute session ends." },
      { who: "Someone who wants every charm free", why: "Hangly has no paid tier; Screen Charms' free tier is a single charm." },
      { who: "Anyone on Windows", why: "Screen Charms is Mac only." },
    ],
    name: "Screen Charms",
    url: "https://screencharms.com",
    title: "Hangly vs Screen Charms: Mac Charm Apps Compared",
    description:
      "Screen Charms is free for one charm and $4.99 for the rest, Mac only, with a focus timer. Hangly is free with 161 charms on Mac and Windows.",
    h1: "Hangly vs Screen Charms",
    verdict:
      "Close in what they do, different in how they charge. Screen Charms gives you one charm free and the rest for $4.99, plus a focus timer. Hangly gives you all 161 charms and custom images free, and runs on Windows too.",
    whatIsIt:
      "Screen Charms is a macOS menu bar app (macOS 13 Ventura or later) that drops a decorative charm from the menu bar on a physics string you can swing and flick. The free version includes one charm, the Turkey Nazar, with all string styles, size and position controls and a Pomodoro focus timer. PRO, $4.99 once by licence key, unlocks the full charm library, custom images and future charms.",
    howHanglyDiffers:
      "Hangly has no paid tier: all 161 charms across 21 collections, any image as a charm, nine rope styles and up to three charms on one rope are free, on Mac and on Windows, including a native ARM64 build.",
    rows: [
      { feature: "Price", hangly: "Free, everything", rival: "Free for one charm; PRO $4.99 once" },
      { feature: "Charms", hangly: "161 across 21 collections", rival: "One free; full library on PRO" },
      { feature: "Custom images", hangly: "Free", rival: "PRO" },
      { feature: "Rope / string styles", hangly: "Nine", rival: "Three: thread, silver chain, gold chain" },
      { feature: "Focus timer", hangly: "No", rival: "Pomodoro, 1–60 minutes, with a chime" },
      { feature: "macOS", hangly: "14+", rival: "13+" },
      { feature: "Windows", hangly: "10+ x64; 11 on native ARM64", rival: "No" },
    ],
    performance:
      "Both simulate one charm on a string, which is cheap. Hangly stops its simulation when the charm comes to rest. Screen Charms does not publish its approach.",
    customisation:
      "Screen Charms gives the free tier size, string length and position sliders, three string styles and a hide button; the library and custom images are PRO. Hangly includes everything free: 161 charms, nine ropes, size, up to three charms on one rope, multi-monitor placement and any image.",
    privacy:
      HANGLY_PRIVACY + " Screen Charms needs no account and states that PRO works fully offline.",
    platforms:
      "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. Screen Charms: macOS 13 Ventura and later.",
    rivalWins: [
      "A Pomodoro focus timer that swings the charm and chimes",
      "Runs on macOS 13 Ventura, a version older than Hangly supports",
    ],
    hanglyWins: [
      "Every charm free, and custom images free",
      "161 charms across 21 collections",
      "Windows, including a native ARM64 build",
      "Nine rope styles and up to three charms on one rope",
    ],
    answers: [
      { question: "Which is better for Mac?", answer: "Both are native Mac apps that hang a charm from the menu bar. Screen Charms if you want its focus timer and are happy with one charm or paying $4.99; Hangly if you want the full collection and your own images free." },
      { question: "Which uses fewer resources?", answer: "Neither publishes figures, and both draw one small charm. Hangly stops animating when the charm is still." },
      { question: "Which has more customisation?", answer: "Hangly, without paying: 161 charms, nine ropes, size, several charms on one rope and any image. Screen Charms' library and custom images need PRO." },
      { question: "Is there a free alternative to Screen Charms PRO?", answer: "Hangly includes everything Screen Charms PRO unlocks (a large library and your own images) for free, on Mac and Windows. It has no focus timer." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      { q: "Is Screen Charms free?", a: "Partly. The free version has one charm, the Turkey Nazar, with every string style and the focus timer. PRO, $4.99 once, unlocks the full library and custom images (9 October 2026). Hangly is free with everything." },
      { q: "Does Screen Charms work on Windows?", a: "No, it is a macOS app. Hangly runs on Windows 10 and later, with a native ARM64 build for Windows 11 on ARM." },
      { q: "Which app has a focus timer?", a: "Screen Charms: a 1–60 minute Pomodoro timer that swings your charm and plays a wind chime at the end. Hangly has none." },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "desk-dangle",
    quickAnswer:
      "Both are free and hang a charm from the top of your screen on Mac and Windows, and both take your own image. Desk Dangle can hang from the MacBook notch, runs on macOS 11 and later, and is on the Microsoft Store, with a small built-in set. Hangly has 161 charms across 21 collections, nine rope styles and a native Windows ARM64 build.",
    takeaways: [
      "Both are free, on Mac and Windows, and take your own image",
      "Desk Dangle can hang from the MacBook notch and runs on macOS 11+",
      "Hangly ships 161 charms across 21 collections; Desk Dangle a handful built in",
      "Desk Dangle is on the Microsoft Store; Hangly has a native Windows ARM64 build",
    ],
    inShort:
      "Two free apps with the same idea. Desk Dangle is the lighter one with a notch trick and an older-Mac reach; Hangly is the deeper one, with a large collection, nine ropes and several charms on one rope. Try both; neither costs anything.",
    bestFor: [
      { who: "A MacBook with a notch", why: "Desk Dangle can hang from the notch itself." },
      { who: "An older Mac on macOS 11 to 13", why: "Desk Dangle supports macOS 11 Big Sur; Hangly needs macOS 14." },
      { who: "Someone who wants lots of ready-made charms", why: "Hangly ships 161 across 21 collections." },
      { who: "A Windows-on-ARM laptop", why: "Hangly has a native ARM64 build." },
    ],
    name: "Desk Dangle",
    url: "https://deskdangle.com",
    title: "Hangly vs Desk Dangle: Free Desktop Charms Compared",
    description:
      "Desk Dangle and Hangly are both free charm apps for Mac and Windows. Desk Dangle hangs from the notch; Hangly has 161 charms and nine ropes.",
    h1: "Hangly vs Desk Dangle",
    verdict:
      "The closest free pair in the category. Both hang a swinging charm on Mac and Windows, both are click-through, and both take your own images. Desk Dangle is smaller and can use the notch; Hangly is the bigger library.",
    whatIsIt:
      "Desk Dangle (version 2.0.1) is a free companion that hangs from your screen edge or MacBook notch, swings when flicked, and stays click-through. Built-in charms include an evil eye, nimbu mirchi, superheroes, a villain and an orange cat, and you can load any PNG, JPG or WebP, stored locally. It runs on macOS 11 Big Sur and later as a universal build, and on Windows 10 and 11 (64-bit) from the Microsoft Store or as a direct download.",
    howHanglyDiffers:
      "Hangly is the deeper library: 161 charms across 21 collections, nine rope styles, adjustable size, up to three charms on one rope and multi-monitor placement, with a native ARM64 build for Windows on ARM.",
    rows: [
      { feature: "Price", hangly: "Free", rival: "Free" },
      { feature: "macOS", hangly: "14+, universal", rival: "11+, universal" },
      { feature: "Windows", hangly: "10+ x64; 11 on native ARM64", rival: "10 and 11, 64-bit; Microsoft Store" },
      { feature: "Built-in charms", hangly: "161 across 21 collections", rival: "A handful (evil eye, nimbu mirchi, heroes, a cat)" },
      { feature: "Your own image", hangly: "Any image", rival: "PNG, JPG or WebP" },
      { feature: "Hangs from the MacBook notch", hangly: "No", rival: "Yes" },
      { feature: "Rope styles", hangly: "Nine", rival: "Not advertised" },
      { feature: "Several charms on one rope", hangly: "Up to three", rival: "Not advertised" },
    ],
    performance:
      "Both draw one light, click-through overlay. Desk Dangle describes itself as lightweight; Hangly stops its simulation when the charm is at rest. Neither publishes measurements.",
    customisation:
      "Desk Dangle: size, position (left, centre, right) and your own image. Hangly: 161 charms, nine ropes, size, up to three charms on one rope, which display it hangs on, and your own image.",
    privacy:
      HANGLY_PRIVACY + " Desk Dangle needs no account, works offline, stores custom images locally, and publishes its own privacy page.",
    platforms:
      "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. Desk Dangle: macOS 11 Big Sur+ (universal); Windows 10 and 11, 64-bit.",
    rivalWins: [
      "Hangs from the MacBook notch",
      "Supports older Macs, back to macOS 11 Big Sur",
      "Available on the Microsoft Store",
    ],
    hanglyWins: [
      "161 charms across 21 collections",
      "Nine rope styles and up to three charms on one rope",
      "Native Windows ARM64 build",
      "Multi-monitor placement",
    ],
    answers: [
      { question: "Which is better for Mac?", answer: "Both are free universal Mac apps. Desk Dangle if you want it on the notch or are on macOS 11 to 13; Hangly if you are on macOS 14 or later and want the larger collection." },
      { question: "Which uses fewer resources?", answer: "Both are light overlays with one charm. Neither publishes figures; Hangly idles its physics when the charm is still." },
      { question: "Which has more customisation?", answer: "Hangly: 161 charms, nine ropes, several charms on one rope and multi-monitor placement, plus your own image. Desk Dangle offers size, position and your own image." },
      { question: "Which is best for Windows?", answer: "Both run on Windows 10 and 11. Desk Dangle is on the Microsoft Store; Hangly has a native ARM64 build for Snapdragon laptops." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      { q: "Is Desk Dangle free?", a: "Yes: free, with no subscription, account, ads or hidden charges, per its site (9 October 2026). Hangly is free as well." },
      { q: "Can a charm hang from the MacBook notch?", a: "Desk Dangle can hang from the notch. Hangly hangs from the top of the screen at a point you choose." },
      { q: "Which free charm app has the most charms?", a: "Hangly, with 161 across 21 collections. Desk Dangle has a small built-in set and takes your own images." },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "book-my-luck",
    quickAnswer:
      "Both hang a swaying charm from the top of a Mac or Windows screen and let clicks through. Book My Luck is a paid, one-time licence per computer, priced by region, with traditional charms plus Halloween and Christmas collections. Hangly is free, with 161 charms across 21 collections and your own images.",
    takeaways: [
      "Book My Luck is paid once per computer, priced by region (AED 36.49 on 9 October 2026); Hangly is free",
      "Book My Luck has Halloween and Christmas collections; Hangly has 161 charms across 21 collections",
      "Both take something of your own: an emoji in Book My Luck, any image in Hangly",
      "Book My Luck needs online licence activation; Hangly needs no licence",
    ],
    inShort:
      "Book My Luck is a polished paid app with seasonal collections and gift bundles. Hangly does the same job free, with a much larger catalogue and your own images.",
    bestFor: [
      { who: "Someone giving a charm app as a gift", why: "Book My Luck sells gift bundles (buy two, get one free)." },
      { who: "Someone who wants Halloween and Christmas charms", why: "Book My Luck has both collections." },
      { who: "Someone who wants it free", why: "Hangly has no paid tier." },
    ],
    name: "Book My Luck",
    url: "https://bookmyluck.com",
    title: "Hangly vs Book My Luck: Desktop Charms Compared",
    description:
      "Book My Luck is a paid desktop charm app for Mac and Windows with seasonal collections. Hangly is free with 161 charms and your own images.",
    h1: "Hangly vs Book My Luck",
    verdict:
      "The same idea at different prices. Book My Luck is a one-time licence per computer with seasonal collections; Hangly is free with a far larger catalogue.",
    whatIsIt:
      "Book My Luck lets you choose a charm for your Mac or Windows desktop, watch it sway and give it a flick, with controls in the Mac menu bar or Windows system tray. Its charms come from traditions around the world (the nazar, hamsa, horseshoe, four-leaf clover) plus Halloween and Christmas collections, and you can hang an emoji instead. It is a one-time purchase per computer with online activation, priced by region; on 9 October 2026 it showed AED 36.49.",
    howHanglyDiffers:
      "Hangly is free, needs no licence, and ships 161 charms across 21 collections, from protection charms and spiritual symbols to Marvel and Pokémon, plus any image of your own.",
    rows: [
      { feature: "Price", hangly: "Free", rival: "Paid once per computer, by region" },
      { feature: "Licence activation", hangly: "None", rival: "Online, one computer per licence" },
      { feature: "Charms", hangly: "161 across 21 collections", rival: "Traditional, Halloween and Christmas collections" },
      { feature: "Your own", hangly: "Any image", rival: "Any emoji" },
      { feature: "macOS", hangly: "14+", rival: "14+" },
      { feature: "Windows", hangly: "10+ x64; 11 on native ARM64", rival: "10 and 11" },
    ],
    performance:
      "Both draw one swaying charm. Neither publishes measurements; Hangly stops its simulation when the charm is still.",
    customisation:
      "Book My Luck adjusts charm size, cord length and position, and takes an emoji. Hangly adjusts size, rope style (nine), how many charms hang on one rope (up to three) and which display, and takes any image.",
    privacy:
      HANGLY_PRIVACY + " Book My Luck needs no account but activates its licence online; it publishes its own privacy page.",
    platforms:
      "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. Book My Luck: macOS 14+, Windows 10 and 11.",
    rivalWins: ["Halloween and Christmas collections", "Gift bundles for friends and family"],
    hanglyWins: ["Free, with no licence to activate", "161 charms across 21 collections", "Any image as a charm", "Native Windows ARM64 build"],
    answers: [
      { question: "Which is better for Mac?", answer: "Both need macOS 14 and behave alike. Hangly is free with more charms; Book My Luck if you want its seasonal collections and are happy to buy a licence." },
      { question: "Which uses fewer resources?", answer: "Both draw one charm; neither publishes figures. Hangly idles its physics at rest." },
      { question: "Which has more customisation?", answer: "Hangly: 161 charms, nine ropes, several charms on one rope and any image. Book My Luck: size, cord length, position and emoji." },
      { question: "Is there a free alternative to Book My Luck?", answer: "Hangly is free on Mac and Windows and covers the same traditional charms, with more besides." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      { q: "Is Book My Luck free?", a: "No. It is a one-time purchase per computer, priced by region (AED 36.49 shown on 9 October 2026), with online activation. Hangly is free." },
      { q: "Does Book My Luck have Halloween charms?", a: "Yes, Halloween and Christmas collections. Hangly's 161 charms are year-round collections." },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "drishti-dangle",
    quickAnswer:
      "Drishti Dangle offers eight Indian-inspired charms and four musical wind chimes for Windows and Mac at ₹99 per device, but on 9 October 2026 its purchases were temporarily unavailable. Hangly is free today, with nimbu-mirchi, Drishti Bommai, the nazar, Vel, Vinayagar and 150 more charms.",
    takeaways: [
      "Drishti Dangle: ₹99 per device, eight charms and four musical wind chimes",
      "On 9 October 2026 its site said \"Coming soon\" and purchases were unavailable",
      "Hangly is free now, with nimbu-mirchi, Drishti Bommai and the nazar among 161 charms",
      "Only Drishti Dangle has musical wind chimes",
    ],
    inShort:
      "If you want a wind chime on your desktop, Drishti Dangle is the only app built around one; wait for it to go on sale. If you want Indian charms today, free, Hangly has them.",
    bestFor: [
      { who: "Someone who wants a musical wind chime", why: "Drishti Dangle's four chimes ring as their parts sway." },
      { who: "Someone who wants Indian charms now, free", why: "Hangly ships nimbu-mirchi, Drishti Bommai, Vel, Vinayagar and more." },
    ],
    name: "Drishti Dangle",
    url: "https://drishtidangle.com",
    title: "Hangly vs Drishti Dangle: Indian Desktop Charms",
    description:
      "Drishti Dangle has eight Indian charms and four wind chimes for ₹99, not yet on sale. Hangly is free with nimbu-mirchi, Drishti Bommai and more.",
    h1: "Hangly vs Drishti Dangle",
    verdict:
      "Both are built around Indian charms. Drishti Dangle adds musical wind chimes and animated 3D models for ₹99, but could not be bought on 9 October 2026. Hangly is free and available now.",
    whatIsIt:
      "Drishti Dangle brings Indian-inspired charms and musical wind chimes to the Windows or Mac desktop: eight charms (nimbu mirchi, guardians, a dreamcatcher, a blue nazar, a cowrie hanging, an ash gourd) and four wind chimes, as animated 3D models. You can change size, position, lighting and mood. It is ₹99 per device, once; on 9 October 2026 its site said \"Coming soon\" and purchases were temporarily unavailable.",
    howHanglyDiffers:
      "Hangly is free and available now. Its Protection collection has the nazar, Drishti Bommai, nimbu-mirchi and hamsa; its Spirituality collection has Vel, Vinayagar, Om, Karuppu and a temple bell; and 150 more charms sit alongside them.",
    rows: [
      { feature: "Price", hangly: "Free", rival: "₹99 per device, once" },
      { feature: "Available to buy (9 Oct 2026)", hangly: "Yes, free download", rival: "No, \"Coming soon\"" },
      { feature: "Indian charms", hangly: "Nimbu-mirchi, Drishti Bommai, nazar, Vel, Vinayagar, Om and more", rival: "Nimbu mirchi, guardians, cowries, ash gourd and more" },
      { feature: "Musical wind chimes", hangly: "No", rival: "Four" },
      { feature: "Charms", hangly: "161", rival: "Eight, plus four chimes" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+ (native ARM64 on 11)", rival: "Windows and Mac" },
    ],
    performance: "Neither publishes measurements. Drishti Dangle animates 3D models; Hangly draws flat artwork and stops its simulation at rest.",
    customisation: "Drishti Dangle: size, position, lighting and mood. Hangly: 161 charms, nine ropes, size, up to three charms on one rope, display, and your own image.",
    privacy: HANGLY_PRIVACY + " Drishti Dangle activates with your purchase email and a code.",
    platforms: "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. Drishti Dangle: Windows and macOS.",
    rivalWins: ["Musical wind chimes that ring as they sway", "Animated 3D models with lighting and mood"],
    hanglyWins: ["Free, and available now", "161 charms, including the Indian ones", "Your own image as a charm", "Native Windows ARM64 build"],
    answers: [
      { question: "Which is better for Mac?", answer: "Hangly can be downloaded today, free. Drishti Dangle lists Mac support but was not on sale on 9 October 2026." },
      { question: "Which uses fewer resources?", answer: "Neither publishes figures. Drishti Dangle renders 3D models; Hangly renders flat artwork and idles at rest." },
      { question: "Which has more customisation?", answer: "Hangly on charms and ropes; Drishti Dangle on lighting and mood for its 3D models." },
      { question: "Which is best for Indian charms?", answer: "Both. Drishti Dangle is built around them and adds wind chimes; Hangly has nimbu-mirchi, Drishti Bommai, the nazar, Vel, Vinayagar, Om, Karuppu and a temple bell, free." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      { q: "Can I buy Drishti Dangle?", a: "Not on 9 October 2026: its site said \"Coming soon\" and purchases were temporarily unavailable. The listed price is ₹99 per device." },
      { q: "Is there a free nimbu-mirchi or Drishti Bommai desktop charm?", a: "Yes. Hangly ships both, with the nazar and hamsa, free on Mac and Windows." },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "deskcharm",
    quickAnswer:
      "DeskCharm is a small open-source (MIT) charm app you build yourself from source with Node.js and Rust; ten charms from around the world each have a click ritual, or you can use any emoji. Hangly is a ready-to-install free app with 161 charms and your own images.",
    takeaways: [
      "DeskCharm is open source under MIT, built with Tauri; Hangly's Windows app is open source under MIT too",
      "DeskCharm published no installers on 9 October 2026: you build it from source",
      "DeskCharm: ten charms with click rituals and sounds, or any emoji",
      "Hangly: 161 charms and your own images, as signed downloads for Mac and Windows",
    ],
    inShort: "For a developer who wants to read and change every line of a charm app, DeskCharm is a neat starting point. For anyone who wants to install one and use it, Hangly.",
    bestFor: [
      { who: "A developer who wants to hack on a charm app", why: "DeskCharm is small, MIT-licensed and welcomes pull requests." },
      { who: "Someone who wants to download and use one", why: "Hangly installs in a click on Mac and Windows." },
    ],
    name: "DeskCharm",
    url: "https://github.com/shivawwww/deskcharm-app",
    title: "Hangly vs DeskCharm: Open-Source Desktop Charms",
    description: "DeskCharm is an open-source charm app you build from source. Hangly is free to download, with 161 charms on Mac and Windows.",
    h1: "Hangly vs DeskCharm",
    verdict: "DeskCharm is a developer's project; Hangly is a finished app. Both are free, and both have open source on GitHub.",
    whatIsIt: "DeskCharm is a transparent, always-on-top overlay where a single charm hangs on a simulated thread. Clicking triggers its ritual (a small animation and sound); right-click opens a picker. Ten charms from Turkey, the Middle East, Ireland, Japan, Egypt, India and China are included, or any emoji. It is built with Tauri, React and TypeScript under the MIT licence, and on 9 October 2026 it published no installers.",
    howHanglyDiffers: "Hangly is downloaded and installed like any app, updates itself, and ships 161 charms across 21 collections with your own images. Its Windows app is open source on GitHub under MIT.",
    rows: [
      { feature: "Price", hangly: "Free", rival: "Free, MIT" },
      { feature: "Install", hangly: "Download for Mac or Windows", rival: "Build from source (Node.js, Rust, Tauri)" },
      { feature: "Charms", hangly: "161", rival: "Ten, plus any emoji" },
      { feature: "Click rituals", hangly: "No", rival: "Yes, with sound" },
      { feature: "Updates", hangly: "Automatic", rival: "Rebuild from the repository" },
      { feature: "Source", hangly: "Windows app on GitHub (MIT)", rival: "On GitHub (MIT)" },
    ],
    performance: "Both draw one charm in a transparent window. Neither publishes measurements.",
    customisation: "DeskCharm: ten charms with rituals, or any emoji. Hangly: 161 charms, nine ropes, size, up to three charms on one rope, display, and any image.",
    privacy: HANGLY_PRIVACY + " DeskCharm, built from source, sends whatever its code sends; you can read all of it.",
    platforms: "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. DeskCharm: wherever you build it with Tauri (macOS, Windows, Linux).",
    rivalWins: ["A ritual and sound for every charm", "Linux, if you build it there", "Small enough to read in an afternoon"],
    hanglyWins: ["Installs in a click; no toolchain needed", "161 charms and your own images", "Updates itself"],
    answers: [
      { question: "Which is better for Mac?", answer: "Hangly, unless you want to build and modify the app yourself." },
      { question: "Which uses fewer resources?", answer: "Neither publishes figures; both are one charm in a transparent window." },
      { question: "Which has more customisation?", answer: "Hangly, as an app. DeskCharm, if you count changing its source." },
      { question: "Is DeskCharm open source?", answer: "Yes, MIT. Hangly's Windows app is open source under MIT too." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      { q: "How do I install DeskCharm?", a: "On 9 October 2026 it had no published releases: you install Node.js, Rust and the Tauri dependencies and build it. Hangly downloads ready to run." },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "openpets",
    quickAnswer:
      "OpenPets is a free, open-source desktop pet for Windows, macOS and Linux that roams your screen, with a plugin SDK and, since v4, an AI assistant you can talk to. Hangly is a different idea: a charm that hangs still and stays out of the way.",
    takeaways: [
      "OpenPets is a pet that moves and talks; Hangly is a charm that hangs",
      "Both are free; OpenPets is open source, as is Hangly's Windows app",
      "OpenPets runs on Linux too",
      "Hangly never needs attention; OpenPets is built to interact",
    ],
    inShort: "Choose OpenPets if you want company that does things. Choose Hangly if you want your screen to feel personal without anything asking for attention.",
    bestFor: [
      { who: "Someone who wants a pet with an AI assistant", why: "OpenPets v4 chats, talks, sets reminders and starts focus sessions." },
      { who: "A Linux user", why: "OpenPets runs on Linux; Hangly does not." },
      { who: "Someone who wants calm decoration", why: "Hangly's charm hangs from one point and never wanders." },
    ],
    name: "OpenPets",
    url: "https://openpets.dev",
    title: "Hangly vs OpenPets: Desktop Charm or Desktop Pet?",
    description: "OpenPets is a free open-source desktop pet with an AI assistant. Hangly is a free charm that hangs still. Which suits you.",
    h1: "Hangly vs OpenPets",
    verdict: "Different kinds of thing. OpenPets is an animated pet and, now, an assistant; Hangly is an ornament.",
    whatIsIt: "OpenPets is free, open-source desktop pets for Windows, macOS and Linux: animated pets from a gallery, a sandboxed plugin SDK, optional local integrations with coding tools, and since v4 an AI assistant you can type or talk to, which can set reminders and start focus sessions.",
    howHanglyDiffers: "Hangly hangs one to three charms from a fixed point and lets every click through. It has no assistant and no behaviour beyond swinging.",
    rows: [
      { feature: "Kind", hangly: "Charm that hangs", rival: "Pet that roams, with an AI assistant" },
      { feature: "Price", hangly: "Free", rival: "Free, open source" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "Windows, macOS, Linux" },
      { feature: "Interrupts you", hangly: "Never", rival: "By design, when you ask it to" },
      { feature: "Your own image", hangly: "Yes", rival: "Pet packs and plugins" },
    ],
    performance: "OpenPets animates a moving pet and can run an assistant; Hangly draws one charm and idles at rest. Neither publishes figures.",
    customisation: "OpenPets: pets, plugins and integrations. Hangly: 161 charms, nine ropes, size, several charms on one rope and any image.",
    privacy: HANGLY_PRIVACY + " OpenPets describes itself as local-first; its assistant and integrations are optional.",
    platforms: "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. OpenPets: Windows, macOS and Linux.",
    rivalWins: ["Linux support", "An AI assistant and plugin SDK", "Fully open source on every platform"],
    hanglyWins: ["Never asks for attention", "161 ready-made charms and your own images", "A native Windows ARM64 build"],
    answers: [
      { question: "Which is better for Mac?", answer: "Depends on what you want on screen: a pet that moves and talks (OpenPets) or a charm that hangs still (Hangly)." },
      { question: "Which uses fewer resources?", answer: "Neither publishes figures. A roaming pet and an assistant do more work than one hanging charm that idles at rest." },
      { question: "Which has more customisation?", answer: "OpenPets through plugins and integrations; Hangly through charms, ropes and your own images." },
      { question: "Is there a desktop pet that does not interrupt you?", answer: "A charm is the calmer option: Hangly hangs from one point, lets clicks through and never moves on its own except to swing." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      { q: "Is OpenPets free?", a: "Yes, free and open source (9 October 2026). Hangly is free as well." },
      { q: "Does OpenPets run on Linux?", a: "Yes. Hangly runs on macOS and Windows only." },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "cat-fidget",
    quickAnswer:
      "Cat Fidget is a free Mac menu-bar cat you pet, feed, drag and fling, with a tamagotchi-style care mode, optional paid breeds and outfits, and no network use at all. Hangly is a free charm for Mac and Windows that hangs and swings, with 161 charms.",
    takeaways: [
      "Cat Fidget is a pet with a care loop; Hangly is a charm",
      "Cat Fidget is free with one cat; breeds, outfits and a photo pet are optional one-time purchases",
      "Cat Fidget states no account, no network and no tracking: stricter than Hangly",
      "Cat Fidget is Mac only, in 20 languages; Hangly runs on Mac and Windows",
    ],
    inShort: "If you want a cat to look after, Cat Fidget is lovely and very private. If you want a charm that asks nothing of you, on Mac or Windows, Hangly.",
    bestFor: [
      { who: "Someone who wants something to care for", why: "Cat Fidget's Devoted mode has hunger, happiness, energy and streaks." },
      { who: "Someone who wants no network use at all", why: "Cat Fidget states no account, no network and no tracking." },
      { who: "Anyone on Windows", why: "Cat Fidget is Mac only." },
    ],
    name: "Cat Fidget",
    url: "https://www.highroadsoftware.com/apps/catfidget",
    title: "Hangly vs Cat Fidget: Charm or Desktop Cat?",
    description: "Cat Fidget is a free Mac menu-bar cat with a care loop and no tracking. Hangly is a free charm for Mac and Windows. How to choose.",
    h1: "Hangly vs Cat Fidget",
    verdict: "A pet and a charm. Cat Fidget wins on privacy and on things to do; Hangly wins on platforms and on asking nothing of you.",
    whatIsIt: "Cat Fidget is a desktop pet for macOS 14 and later, on the Mac App Store: a small cat beneath the menu bar that can stay calm, follow the cursor, stretch on an elastic leash or bounce, which you pet, feed, drag and fling. A Devoted mode adds a tamagotchi-style care loop. One cat is free; nine more breeds ($1.99 each), 44 accessories, 7 bundles or a $9.99 Cat Lover Pass, and a photo pet, are optional one-time purchases. It states no account, no network and no tracking, and is in 20 languages.",
    howHanglyDiffers: "Hangly is free with everything included, runs on Windows as well, and hangs a charm rather than keeping a pet: nothing to feed, nothing to level up.",
    rows: [
      { feature: "Kind", hangly: "Charm", rival: "Pet cat with a care loop" },
      { feature: "Price", hangly: "Free, everything", rival: "Free with one cat; cosmetics $0.99–$9.99" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "macOS 14+" },
      { feature: "Network use", hangly: "Installation record, usage events, crash reports", rival: "None, per its site" },
      { feature: "Your own photo", hangly: "Free", rival: "Optional one-time purchase" },
      { feature: "Languages", hangly: "English", rival: "20" },
    ],
    performance: "Cat Fidget runs 60 fps physics while you play; Hangly idles at rest. Neither publishes CPU figures.",
    customisation: "Cat Fidget: ten breeds, 60 wardrobe pieces, four behaviours, a photo pet. Hangly: 161 charms, nine ropes, size, several charms on one rope and any image.",
    privacy: HANGLY_PRIVACY + " Cat Fidget states no account, no network and no tracking, and processes photos on the Mac: the stricter of the two.",
    platforms: "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. Cat Fidget: macOS 14+, Apple silicon and Intel.",
    rivalWins: ["No network use at all", "A care loop with levels and streaks", "Twenty languages", "On the Mac App Store"],
    hanglyWins: ["Windows, including native ARM64", "Everything free, including your own photo", "Asks for no attention"],
    answers: [
      { question: "Which is better for Mac?", answer: "Cat Fidget if you want a cat to play with and look after; Hangly if you want a charm that hangs quietly." },
      { question: "Which uses fewer resources?", answer: "Neither publishes figures; a cat you fling runs physics more often than a charm at rest." },
      { question: "Which has more customisation?", answer: "Different kinds: Cat Fidget's breeds and wardrobe, Hangly's 161 charms and ropes." },
      { question: "Which is more private?", answer: "Cat Fidget, by its own statement: no account, no network, no tracking. Hangly registers each installation and sends usage events and crash reports." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [
      { q: "Is Cat Fidget free?", a: "Yes, with the Classic Black cat. Other breeds, accessories, bundles, the $9.99 Cat Lover Pass and the photo pet are optional one-time purchases (9 October 2026)." },
      { q: "Does Cat Fidget run on Windows?", a: "No, macOS 14 and later. Hangly runs on Mac and Windows." },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "dockitty",
    quickAnswer: "Dockitty is a pixel cat that lives in your Mac's Dock and sometimes roams the screen; there is a free version and a paid upgrade. Hangly hangs a charm from the top of the screen on Mac and Windows, free.",
    takeaways: [
      "Dockitty lives in the Dock; Hangly hangs from the top of the screen",
      "Dockitty is a pet that does cute things; Hangly is a charm that swings",
      "Dockitty is Mac only; Hangly runs on Mac and Windows",
    ],
    inShort: "Both are small, cheerful and harmless. Dockitty for a pixel cat in the Dock; Hangly for a charm on the screen, on Mac or Windows.",
    bestFor: [
      { who: "Someone who loves pixel cats", why: "Dockitty's cat sleeps, trots and jumps in the Dock." },
      { who: "Anyone on Windows", why: "Dockitty is Mac only." },
    ],
    name: "Dockitty",
    url: "https://www.dockitty.app",
    title: "Hangly vs Dockitty: A Charm or a Dock Cat?",
    description: "Dockitty is a pixel cat for the Mac Dock. Hangly is a free charm for Mac and Windows. What each does and who each suits.",
    h1: "Hangly vs Dockitty",
    verdict: "Two small delights in different places: the Dock and the top of the screen.",
    whatIsIt: "Dockitty is a tiny pixel cat that lives in the macOS Dock, with cute animations and random behaviour; you pick your cat, let it roam the screen, and right-click to make it jump or sleep. Its site mentions a free version alongside a paid one.",
    howHanglyDiffers: "Hangly hangs one to three charms from the top of the screen, on Mac and Windows, with 161 charms and your own images, free.",
    rows: [
      { feature: "Where it lives", hangly: "Top of the screen", rival: "The Dock, and roaming" },
      { feature: "Kind", hangly: "Charm", rival: "Pixel cat" },
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "macOS" },
      { feature: "Price", hangly: "Free", rival: "Free version, paid upgrade" },
    ],
    performance: "Both are small animations. Neither publishes figures.",
    customisation: "Dockitty: choose your cat. Hangly: 161 charms, nine ropes, size and your own image.",
    privacy: HANGLY_PRIVACY,
    platforms: "Hangly: macOS 14+; Windows 10 (version 1809)+ on x64 and Windows 11 on native ARM64. Dockitty: macOS.",
    rivalWins: ["A pixel cat that lives in the Dock", "Behaviour that surprises you"],
    hanglyWins: ["Windows as well as Mac", "161 charms and your own images", "Free, everything included"],
    answers: [
      { question: "Which is better for Mac?", answer: "Different places: Dockitty in the Dock, Hangly from the top of the screen. Both are light." },
      { question: "Which uses fewer resources?", answer: "Neither publishes figures; both are small animations." },
      { question: "Which has more customisation?", answer: "Hangly: 161 charms, nine ropes, size, your own images." },
      { question: "Is there a Dock pet for Windows?", answer: "Dockitty is Mac only. Hangly, a charm rather than a pet, runs on Windows." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [{ q: "Is Dockitty free?", a: "It has a free version and a paid one; its site does not state the price (9 October 2026). Hangly is free." }],
    checked: CHECKED_3,
  },
  {
    slug: "googly-eyes",
    quickAnswer: "Googly Eyes, by Sindre Sorhus, puts a pair of eyes in the Mac menu bar that follow your cursor and blink when you click. It is free and needs macOS 26. Hangly hangs a swinging charm below the menu bar, on Mac and Windows.",
    takeaways: ["Googly Eyes lives in the menu bar; Hangly hangs below it", "Both are free", "Googly Eyes needs macOS 26; Hangly runs on macOS 14 and Windows"],
    inShort: "A tiny joke and a tiny charm. Googly Eyes for eyes that watch your cursor; Hangly for something that swings.",
    bestFor: [
      { who: "Someone who loses their cursor", why: "Googly Eyes always looks at it." },
      { who: "Anyone on macOS 14 or 15, or Windows", why: "Googly Eyes needs macOS 26." },
    ],
    name: "Googly Eyes",
    url: "https://sindresorhus.com/googly-eyes",
    title: "Hangly vs Googly Eyes: Fun Mac Menu Bar Apps",
    description: "Googly Eyes puts eyes in the menu bar that follow your cursor. Hangly hangs a swinging charm on Mac and Windows. Both free.",
    h1: "Hangly vs Googly Eyes",
    verdict: "Both free, both whimsical, in different places.",
    whatIsIt: "Googly Eyes is a free Mac app by Sindre Sorhus that adds a pair of eyes to the menu bar; they follow your cursor and blink when you click. It requires macOS 26.",
    howHanglyDiffers: "Hangly hangs a charm below the menu bar on a swinging rope, on macOS 14 and later and on Windows.",
    rows: [
      { feature: "Where it lives", hangly: "Below the menu bar", rival: "In the menu bar" },
      { feature: "Price", hangly: "Free", rival: "Free" },
      { feature: "macOS", hangly: "14+", rival: "26+" },
      { feature: "Windows", hangly: "Yes", rival: "No" },
    ],
    performance: "Its developer notes Googly Eyes uses more CPU than its developer would like, because macOS updates menu bar items inefficiently. Hangly idles at rest.",
    customisation: "Googly Eyes: the eyes. Hangly: 161 charms, nine ropes, size and your own image.",
    privacy: HANGLY_PRIVACY,
    platforms: "Hangly: macOS 14+; Windows 10 (version 1809)+ and Windows 11 on ARM. Googly Eyes: macOS 26+.",
    rivalWins: ["Helps you find your cursor", "From a well-known Mac developer"],
    hanglyWins: ["Runs on macOS 14 and 15, and on Windows", "161 charms and your own images"],
    answers: [
      { question: "Which is better for Mac?", answer: "Both are fun. Googly Eyes if you are on macOS 26 and want eyes in the menu bar; Hangly for a swinging charm, on macOS 14 and later." },
      { question: "Which uses fewer resources?", answer: "Googly Eyes' developer says it uses more CPU than they would like, because of how macOS updates menu bar items. Hangly idles at rest." },
      { question: "Which has more customisation?", answer: "Hangly." },
      { question: "What are fun free Mac apps for the menu bar?", answer: "Googly Eyes for eyes that watch your cursor, RunCat for a CPU meter that runs, and Hangly for a charm that hangs below the bar." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [{ q: "Is Googly Eyes free?", a: "Yes, and it needs macOS 26 (9 October 2026). Hangly is free and runs on macOS 14 and later." }],
    checked: CHECKED_3,
  },
  {
    slug: "oneko",
    quickAnswer: "Oneko is the classic public-domain cat that chases your cursor across an X11 (Linux and Unix) desktop. It is not a Mac or Windows app. Hangly is a charm for Mac and Windows that hangs and swings rather than chasing anything.",
    takeaways: ["Oneko is X11 only; Hangly is for Mac and Windows", "Oneko chases the cursor; Hangly hangs still", "Both are free"],
    inShort: "Oneko is a piece of desktop history for Linux. On a Mac or a Windows PC, Hangly is a calm, modern alternative, though a charm rather than a cat.",
    bestFor: [
      { who: "A Linux user who wants the original", why: "Oneko is the classic, public domain." },
      { who: "Someone on Mac or Windows", why: "Oneko does not run there natively; Hangly does." },
    ],
    name: "Oneko",
    url: "https://openpets.dev/alternatives/oneko",
    title: "Hangly vs Oneko: The Cursor Cat and the Desktop Charm",
    description: "Oneko is the classic X11 cat that chases your cursor. Hangly is a free charm for Mac and Windows. Alternatives for modern desktops.",
    h1: "Hangly vs Oneko",
    verdict: "Different eras and different platforms: Oneko for X11, Hangly for Mac and Windows.",
    whatIsIt: "Oneko is a small Unix desktop program in which a cat chases the mouse pointer across an X11 display. It is public domain and ships with built-in cat variants, but no loader for arbitrary pets.",
    howHanglyDiffers: "Hangly runs natively on macOS and Windows and hangs a charm from the top of the screen rather than chasing the cursor.",
    rows: [
      { feature: "Platforms", hangly: "macOS 14+, Windows 10+", rival: "X11 (Linux, Unix)" },
      { feature: "Behaviour", hangly: "Hangs and swings", rival: "Chases the cursor" },
      { feature: "Licence", hangly: "Free; Windows app MIT", rival: "Public domain" },
    ],
    performance: "Both are tiny.",
    customisation: "Oneko: built-in cat variants. Hangly: 161 charms, nine ropes, size and your own image.",
    privacy: HANGLY_PRIVACY + " Oneko makes no network requests.",
    platforms: "Hangly: macOS 14+; Windows 10 (version 1809)+ and Windows 11 on ARM. Oneko: X11.",
    rivalWins: ["Public domain", "Runs on Linux and Unix", "A piece of desktop history"],
    hanglyWins: ["Native on Mac and Windows", "161 charms and your own images"],
    answers: [
      { question: "Which is better for Mac?", answer: "Hangly runs natively on Mac; Oneko is an X11 program." },
      { question: "Which uses fewer resources?", answer: "Both are tiny." },
      { question: "Which has more customisation?", answer: "Hangly." },
      { question: "Is there an Oneko for Windows or Mac?", answer: "Oneko itself is X11. For a calm companion on Mac and Windows, Hangly hangs a charm; for a cursor-chasing cat, look at desktop pet apps." },
      { question: "Which is best for menu bar customisation?", answer: MENU_BAR_ANSWER },
    ],
    faqs: [{ q: "Does Oneko run on Windows?", a: "Not natively; it is an X11 program. Hangly runs natively on Windows 10 and later." }],
    checked: CHECKED_3,
  },
];

export const COMPARISON_SLUGS = COMPARISONS.map((c) => c.slug);

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
