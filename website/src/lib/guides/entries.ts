/**
 * The guide types, and one description of every product the guides name.
 *
 * Shared so that a product reads identically wherever it appears. Entity
 * consistency is the point: a knowledge graph treats two different
 * descriptions of one product as evidence of uncertainty about which product
 * is meant, and the guides name some of these apps four or five times.
 *
 * Every entry records the date its claims were read off the product's own
 * site or repository. Where something is not published, that is said rather
 * than guessed at — "See their site" is an honest answer and an invented
 * price is not.
 */

import { RELEASE } from "@/data/stats.generated";
export type GuideEntry = {
  name: string;
  url: string;
  /** Neutral, from their own material. */
  what: string;
  /** Who it suits. Named plainly, including when it is not Hangly. */
  bestFor: string;
  platforms: string;
  price: string;
  /** The honest note — a limitation, a caveat, or something they do better. */
  note: string;
};

/**
 * A comparison table written for one section, rather than the single table
 * every guide gets from `entries`. The category questions that matter are not
 * the same from guide to guide — "does it interrupt you" belongs in the pet
 * guide and nowhere else — so a guide can put its own table where the argument
 * needs one.
 */
export type GuideTable = {
  caption: string;
  columns: string[];
  /** Each row is as long as `columns`. The first cell is the row header. */
  rows: string[][];
};

export type GuideSection = {
  heading: string;
  body: string[];
  list?: string[];
  table?: GuideTable;
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  /** The direct answer, first thing on the page and first thing liftable. */
  summary: string;
  /** 3-5 bullets, straight after the summary. The page in a glance. */
  takeaways: string[];
  /** One paragraph at the end, for someone who scrolled past everything. */
  inShort: string;
  /** Long-form body before the table. */
  sections: GuideSection[];
  /** The comparison table. */
  entries: GuideEntry[];
  /** After the table: how to choose. */
  closing: GuideSection[];
  faqs: { q: string; a: string }[];
  /** Related guides and comparisons, by slug. */
  related: { label: string; href: string }[];
  checked: string;
};

export const CHECKED = "2026-09-24";

/** Products read for the three long guides, a day later than the rest. */
export const CHECKED_2 = "2026-09-25";

/** Competitors re-read on 9 Oct 2026: prices, platforms and features changed since September. */
export const CHECKED_3 = "2026-10-09";

/* Shared entries, so a product is described identically wherever it appears.
   Entity consistency is the point: a knowledge graph treats two different
   descriptions of one product as evidence of uncertainty. */
export const HANGLY: GuideEntry = {
  name: "Hangly",
  url: "https://www.sharancreatedthis.in/products/hangly",
  what: "Hangs a charm from the top of your screen on a cord with real pendulum physics. 161 charms across 21 collections, plus any image of your own as a charm.",
  bestFor: "Anyone who wants decoration that never interrupts, on Mac or Windows",
  platforms: "macOS 14+ (Apple Silicon & Intel), Windows 10 1809+ (x64), Windows 11 (native ARM64)",
  price: "Free",
  note: `Both builds are at ${RELEASE.macOS.version} and released together; the Windows build is not code-signed yet.`,
};

export const LUCKY_DANGLE: GuideEntry = {
  name: "Lucky Dangle",
  url: "https://luckydangle.app",
  what: "Hangs a lucky charm from the top of your screen on Mac or Windows, where it sways and stays out of every click. A dozen traditional charms, each with a small ritual, plus your own photo (\"hang someone you love\") or any emoji.",
  bestFor: "A polished, paid charm app with a ritual for each charm",
  platforms: "Mac and Windows",
  price: "₹777 / $7.77 once; \"Extra Lucky\" ₹1,111 / $11.11 (9 Oct 2026)",
  note: "Paid, once. No subscription, account or licence key, per their site.",
};

export const SCREEN_DANGLE: GuideEntry = {
  name: "Screen Dangle",
  url: "https://od2.in/screen-dangle",
  what: "A free lucky screen charm and desktop talisman studio: hang an interactive charm from the top of your screen, built to your specification.",
  bestFor: "People who want to build a charm rather than pick one",
  platforms: "Mac and Windows",
  price: "Free",
  note: "Presented as a studio rather than a collection; strongest published content surface in this category.",
};

export const DANGLEJOY: GuideEntry = {
  name: "DangleJoy",
  url: "https://danglejoy.com",
  what: "Animated charms that hang, sway and move on screen: more than 30, from the Maneki Neko and Omamori to film stars, with your own custom charms.",
  bestFor: "Cultural and celebrity charms, and Android as well as desktop",
  platforms: "macOS 13+ (Mac App Store), Windows, Android",
  price: "One-time: $3.99 on the Mac App Store; $4.99 lifetime elsewhere",
  note: "Its site is in 12 languages, including Tamil, Hindi and Arabic.",
};

export const CHARMLY: GuideEntry = {
  name: "Charmly",
  url: "https://www.glaze.app/app/charmly-rmKwV7",
  what: "Hangs a good-luck charm from the top of your screen on a cord, swaying all day with real pendulum physics.",
  bestFor: "A focused Mac-only charm app",
  platforms: "macOS",
  price: "See their listing",
  note: "Mac only. Distributed through Glaze rather than directly.",
};

export const SCREENCHARMS: GuideEntry = {
  name: "Screen Charms",
  url: "https://screencharms.com",
  what: "A macOS menu bar app that hangs a decorative charm on a physics string, with a Pomodoro focus timer that swings the charm and plays a wind chime when time is up.",
  bestFor: "A Mac-only charm with a built-in focus timer",
  platforms: "macOS 13+",
  price: "Free with one charm (Turkey Nazar); PRO $4.99 once for the full library and custom images",
  note: "Mac only. The free tier is a single charm; the library and custom images are PRO.",
};

export const DRISHTI_DANGLE: GuideEntry = {
  name: "Drishti Dangle",
  url: "https://drishtidangle.com",
  what: "Indian-inspired desktop charms and musical wind chimes for Windows and Mac: eight charms and four wind chimes, animated 3D models.",
  bestFor: "Indian-inspired charms and wind chimes specifically",
  platforms: "Windows and Mac",
  price: "₹99 per device, once",
  note: "On 9 Oct 2026 its site said \"Coming soon\" and purchases were temporarily unavailable. The only one here with musical wind chimes.",
};

export const BOOK_MY_LUCK: GuideEntry = {
  name: "Book My Luck",
  url: "https://bookmyluck.com",
  what: "Choose a charm for your Mac or Windows desktop, watch it sway and give it a flick. Traditional charms plus Halloween and Christmas collections; an emoji can be hung instead.",
  bestFor: "A paid charm app with seasonal collections and gift bundles",
  platforms: "macOS 14+, Windows 10 and 11",
  price: "Paid once per computer, priced by region (AED 36.49 on 9 Oct 2026)",
  note: "Requires online licence activation. Bundles for gifting (buy 2, get 1 free).",
};

export const DESKTOP_GOOSE: GuideEntry = {
  name: "Desktop Goose",
  url: "https://samperson.itch.io/desktop-goose",
  what: "A desktop pet that actively interferes with your work — tracking mud across the screen, dragging notes into view and stealing the cursor.",
  bestFor: "People who want to be interrupted, as a joke",
  platforms: "Windows and macOS",
  price: "Pay what you want",
  note: "Deliberately disruptive. Not suitable during meetings or screen shares.",
};

export const SHIMEJI: GuideEntry = {
  name: "Shimeji",
  url: "https://shimejis.xyz",
  what: "Little characters that move around and interact with elements while you browse, now most popular as a browser extension.",
  bestFor: "A huge community library of roaming characters",
  platforms: "Browser extension, plus legacy desktop builds",
  price: "Free",
  note: "Confined to web pages in its extension form. Characters need a sprite sheet.",
};

export const ONEKO: GuideEntry = {
  name: "Oneko",
  url: "https://openpets.dev/alternatives/oneko",
  what: "A public-domain X11 cat that chases the cursor, with built-in variants.",
  bestFor: "Linux and X11, and anyone who wants the original",
  platforms: "X11 (Linux/Unix)",
  price: "Free, public domain",
  note: "Not a macOS or Windows application.",
};

export const OPENPETS: GuideEntry = {
  name: "OpenPets",
  url: "https://openpets.dev",
  what: "Free open-source desktop pets with a pet gallery, a plugin SDK, optional coding-tool integrations and, since v4, an AI assistant you can type or talk to.",
  bestFor: "People who want open source and to modify the pet",
  platforms: "Windows, macOS, Linux",
  price: "Free, open source",
  note: "The only genuinely open-source pet app in this list; increasingly an assistant as well as a pet.",
};

export const MICROJOYZ: GuideEntry = {
  name: "MicroJoyz",
  url: "https://microjoyz.com",
  what: "A desktop pet app for Mac with animated throwable pets, reminders, social features and mini-games.",
  bestFor: "The most feature-rich desktop pet on Mac",
  platforms: "macOS",
  price: "$9.99, with a 3-day free trial",
  note: "Considerably more than decoration — reminders, social features, games.",
};

export const CAT_FIDGET: GuideEntry = {
  name: "Cat Fidget",
  url: "https://www.highroadsoftware.com/apps/catfidget",
  what: "A tiny desktop cat for the Mac menu bar you can pet, feed, drag and fling, with breeds and accessories.",
  bestFor: "A menu bar cat with no account or tracking",
  platforms: "macOS 14+ (Mac App Store)",
  price: "Free, with an optional paid pass",
  note: "Their site states no account, ads, analytics or tracking. The app is in 20 languages.",
};

export const DOCKITTY: GuideEntry = {
  name: "Dockitty",
  url: "https://www.dockitty.app",
  what: "A pixel cat that lives in the macOS dock with playful animations.",
  bestFor: "A dock-based pixel pet",
  platforms: "macOS",
  price: "See their site",
  note: "Lives in the dock rather than on the screen generally.",
};

export const DOCKLING: GuideEntry = {
  name: "Dockling",
  url: "https://dockling.space",
  what: "Generates a personal pixel pet from any photo, living in the dock, menu bar or notch with Pomodoro timers, streaks and quick notes.",
  bestFor: "A pet that doubles as a productivity companion",
  platforms: "macOS",
  price: "$2.99 once",
  note: "The productivity features are the point; if you want pure decoration this is more than you need.",
};

export const RUNCAT: GuideEntry = {
  name: "RunCat",
  url: "https://kyome.io/runcat",
  what: "Animates a menu bar character whose running speed reflects CPU usage, with variants for memory and network.",
  bestFor: "A system monitor that is pleasant to look at",
  platforms: "macOS",
  price: "Free",
  note: "A monitoring utility rather than decoration. Complements a charm app rather than replacing it.",
};

export const TYPIBARA: GuideEntry = {
  name: "Typibara",
  url: "https://apps.apple.com/us/app/typibara/id6701996122",
  what: "A customisable capybara typing companion that reacts to your keystrokes, with skins and per-app visibility.",
  bestFor: "Something that reacts while you write",
  platforms: "macOS 14.6+ (Mac App Store)",
  price: "$4.99",
  note: "Tied to typing; idle when you are not.",
};

export const DESK_DANGLE: GuideEntry = {
  name: "Desk Dangle",
  url: "https://deskdangle.com",
  what: "A small companion that hangs from the screen edge or the MacBook notch and swings when flicked: evil eye, nimbu mirchi, superheroes and a cat, or any PNG, JPG or WebP of your own.",
  bestFor: "A free charm that can hang from the MacBook notch",
  platforms: "macOS 11+ (universal), Windows 10 and 11 (Microsoft Store or .exe)",
  price: "Free",
  note: "Free with no account; on the Microsoft Store. A small built-in set of charms.",
};

export const DESKCHARM: GuideEntry = {
  name: "DeskCharm",
  url: "https://github.com/shivawwww/deskcharm-app",
  what: "An open-source, always-on-top charm on a simulated thread: ten charms from around the world, each with a click ritual, or any emoji.",
  bestFor: "Developers who want to build and change a charm app themselves",
  platforms: "Built from source (Tauri: macOS, Windows, Linux)",
  price: "Free, MIT licence",
  note: "No published installers on 9 Oct 2026: you build it with Node.js and Rust.",
};

export const GOOGLY_EYES: GuideEntry = {
  name: "Googly Eyes",
  url: "https://sindresorhus.com/googly-eyes",
  what: "A pair of googly eyes in the Mac menu bar that follow the cursor and blink when you click.",
  bestFor: "A tiny menu bar joke that also helps you find the cursor",
  platforms: "macOS 26+",
  price: "Free",
  note: "Lives in the menu bar rather than hanging below it; needs the newest macOS.",
};

export const CHARMLING: GuideEntry = {
  name: "Charmling",
  url: "https://peerlist.io/abinesh_dev/project/charmling",
  what: "Ninety-nine original 3D charms for the Mac menu bar on an elastic cord, photo charms, and charms that grow over time, such as a dragon that hatches.",
  bestFor: "Charms that change and grow over time",
  platforms: "macOS",
  price: "Not published",
  note: "Known only from its Peerlist listing on 9 Oct 2026; no site of its own was found.",
};

export const PETPALBAR: GuideEntry = {
  name: "PetPalBar",
  url: "https://apps.apple.com/us/app/petpalbar/id6744963097",
  what: "A menu bar pet that reacts to your habits: drink water, take breaks, finish focus sessions.",
  bestFor: "A wellbeing nudge with a face",
  platforms: "macOS 13.5+ (Mac App Store)",
  price: "$5.99",
  note: "Not enough App Store ratings yet to show an average.",
};


/* ── Read 2026-09-25, for the long guides ───────────────────────────────── */

export const PETS_THERAPY: GuideEntry = {
  name: "Pets Therapy",
  url: "https://pets-therapy.com",
  what: "Pets roam freely across the screen — apes, dinosaurs, cats, dogs, a chef — and you can feed them, hand them toys and watch them talk to each other. Over a hundred pets, with custom pets supported.",
  bestFor: "The largest pet library, and the only one that genuinely runs on all three desktop platforms",
  platforms: "macOS (Apple Silicon native), Windows 10 and 11, Linux",
  price: "Free on the Mac App Store, with a supporters tier",
  note: "Their own site states 'offline, signed out, never pay-to-win'. The free tier is 37 pets forever rather than a trial.",
};

export const MAC_PET: GuideEntry = {
  name: "Mac Pet",
  url: "https://mac-pet.com",
  what: "A pixel pet that lives in the menu bar or the MacBook notch rather than on the desktop, with a Pomodoro timer, activity streaks and a five-week contribution graph.",
  bestFor: "A pet that stays in the menu bar and runs your focus sessions",
  platforms: "macOS 10.15+",
  price: "$9.99",
  note: "No free tier advertised. Claims under 1% CPU. The pet walks during focus sessions and sleeps during breaks.",
};

export const NOTISPRITE: GuideEntry = {
  name: "NotiSprite",
  url: "https://notisprite.com",
  what: "Hand-drawn animated companions that also deliver break reminders, weather, calendar alerts, a focus timer and CPU and battery readouts.",
  bestFor: "Someone who wants the pet to carry their notifications",
  platforms: "macOS, via the Mac App Store",
  price: "Free with 5 sprites; 22 characters total via in-app purchase",
  note: "The free five are fully featured rather than crippled. Closer to a notification centre with a face than to a pet.",
};

export const BONGO_CAT: GuideEntry = {
  name: "Bongo Cat",
  url: "https://store.steampowered.com/app/3419430/Bongo_Cat/",
  what: "A taskbar cat that drums along with your keystrokes, with cosmetic customisation.",
  bestFor: "A keyboard-reactive companion, distributed through Steam",
  platforms: "Windows and macOS, via Steam",
  price: "Free, with paid cosmetic DLC",
  note: "Needs Steam installed and running, which is a heavier dependency than the rest of this list.",
};

export const VPET: GuideEntry = {
  name: "VPet Simulator",
  url: "https://github.com/LorisYounger/VPet",
  what: "An open-source virtual pet with game mechanics: feeding, levelling up and earning virtual currency.",
  bestFor: "People who want a pet to play rather than a pet to look at",
  platforms: "Windows; Linux via Wine",
  price: "Free, open source",
  note: "No native macOS build. Closer to a game than to decoration.",
};

/* ── Mac customisation apps, read 2026-09-25 ────────────────────────────── */

export const ICE: GuideEntry = {
  name: "Ice",
  url: "https://github.com/jordanbaird/Ice",
  what: "Hides and shows menu bar items on hover, click or scroll, with an always-hidden section, drag-and-drop arrangement, search, custom spacing and menu bar tinting.",
  bestFor: "Taming a crowded menu bar without paying for it",
  platforms: "macOS 14+",
  price: "Free, GPL-3.0",
  note: "29.7k stars on GitHub. Does most of what Bartender does, and the parts it does not are the automation rules.",
};

export const BARTENDER: GuideEntry = {
  name: "Bartender",
  url: "https://www.macbartender.com",
  what: "Menu bar management with rules and triggers rather than only hiding: items can appear on a condition, hide on a schedule, or be summoned by hotkey and search.",
  bestFor: "Menu bar rules and automation, not just hide-and-reveal",
  platforms: "Bartender 7 requires macOS 27; Bartender 6 covers earlier systems",
  price: "One-time purchase, a Pro subscription, or a lifetime tier — prices load dynamically and are not quoted here",
  note: "A four-week unlimited trial. The version split matters: if you are not on macOS 27 you are buying Bartender 6.",
};

export const RAYCAST: GuideEntry = {
  name: "Raycast",
  url: "https://www.raycast.com",
  what: "A launcher that replaces Spotlight and brings clipboard history, snippets, a calculator, window management, quicklinks and thousands of extensions behind one hotkey.",
  bestFor: "Replacing four small utilities with one launcher",
  platforms: "macOS",
  price: "Free tier covers the core features; Pro is $10/month, Plus $20, Max $50",
  note: "The paid tiers are about AI, not about the launcher. The free tier is the product most people mean.",
};

export const BETTERTOUCHTOOL: GuideEntry = {
  name: "BetterTouchTool",
  url: "https://folivora.ai",
  what: "Custom trackpad gestures, mouse buttons, keyboard shortcuts, menu bar items and Stream Deck actions, with over 600 built-in actions and triggers that can be chained into macros.",
  bestFor: "Power users who want to remap the machine itself",
  platforms: "macOS",
  price: "Paid, with a 45-day trial and no account required",
  note: "The deepest customisation on this list and the steepest learning curve. Most people use a tenth of it.",
};

export const RECTANGLE: GuideEntry = {
  name: "Rectangle",
  url: "https://rectangleapp.com",
  what: "Moves and resizes windows with keyboard shortcuts or by dragging them to a screen edge, cycling through sizes on a repeated shortcut.",
  bestFor: "Window management, free, with nothing to learn",
  platforms: "macOS 10.15+, Intel and Apple Silicon",
  price: "Free and open source; Rectangle Pro is paid with a 10-day trial",
  note: "The free version is what most people need. macOS 15's own window tiling covers some of this now, less completely.",
};

export const ALTTAB: GuideEntry = {
  name: "AltTab",
  url: "https://alt-tab-macos.netlify.app",
  what: "Windows-style Alt-Tab for macOS: switch between individual windows with previews, rather than between applications.",
  bestFor: "Anyone who came from Windows and misses switching to a window",
  platforms: "macOS",
  price: "Free, GPL-3.0",
  note: "16.3k stars on GitHub. Fixes the single most common complaint from people new to the Mac.",
};

export const SKETCHYBAR: GuideEntry = {
  name: "SketchyBar",
  url: "https://github.com/FelixKratz/SketchyBar",
  what: "Replaces the macOS status bar entirely with one configured through shell scripts, with event-driven updates, animations and mouse support.",
  bestFor: "People who want to build their own menu bar and enjoy shell scripting",
  platforms: "macOS",
  price: "Free, GPL-3.0",
  note: "12.4k stars. Configuration is a shell script in ~/.config/sketchybar, not a settings window. That is the appeal and the barrier.",
};

export const MACCY: GuideEntry = {
  name: "Maccy",
  url: "https://github.com/p0deje/Maccy",
  what: "A clipboard manager that keeps history and lets you search it from a hotkey.",
  bestFor: "Clipboard history, free, staying on your machine",
  platforms: "macOS 14+",
  price: "Free, MIT licence",
  note: "21.7k stars. No cloud sync is offered, which for a clipboard manager is a feature rather than a gap.",
};

export const ISTAT_MENUS: GuideEntry = {
  name: "iStat Menus",
  url: "https://bjango.com/mac/istatmenus/",
  what: "CPU, GPU, memory, disks, network, sensors, battery and weather as configurable menu bar items with detailed drop-down menus.",
  bestFor: "Knowing precisely what the machine is doing",
  platforms: "macOS 11+",
  price: "Paid licence, or included in Setapp at USD$9.99/month",
  note: "Version 7.5, with a 14-day trial. Prices are not shown on their own page.",
};
