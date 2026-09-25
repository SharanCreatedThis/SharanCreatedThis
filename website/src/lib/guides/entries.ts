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

/* Shared entries, so a product is described identically wherever it appears.
   Entity consistency is the point: a knowledge graph treats two different
   descriptions of one product as evidence of uncertainty. */
export const HANGLY: GuideEntry = {
  name: "Hangly",
  url: "https://www.sharancreatedthis.in/products/hangly",
  what: "Hangs a charm from the top of your screen on a cord with real pendulum physics. Eighty-one charms across fourteen collections, plus any image of your own as a charm.",
  bestFor: "Anyone who wants decoration that never interrupts, on Mac or Windows",
  platforms: "macOS 14+ (Apple Silicon & Intel), Windows 10+ (x64 & ARM64)",
  price: "Free",
  note: "The Windows build is a pre-release at 0.9.x; macOS is at 2.0 and is the mature one. Six of the fourteen collections are still being finished.",
};

export const LUCKY_DANGLE: GuideEntry = {
  name: "Lucky Dangle",
  url: "https://luckydangle.app",
  what: "Choose a lucky charm and hang it from the top of your screen, where it sways while you work and stays out of every click.",
  bestFor: "A simpler product, if its curated charm set is the one you want",
  platforms: "Mac and Windows",
  price: "See their site",
  note: "Does not publish a charm count or advertise custom images.",
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
  what: "Animated charms that hang, sway and move naturally on screen, with cultural icons and lucky symbols.",
  bestFor: "Animated cultural and lucky charm designs",
  platforms: "See their site",
  price: "See their site",
  note: "No published charm count, and custom images are not advertised.",
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
  what: "A free macOS menu bar app that hangs a decorative charm from the top of the screen on a physics-based string, which you can swing and flick.",
  bestFor: "A free, minimal Mac-only charm",
  platforms: "macOS",
  price: "Free",
  note: "Mac only.",
};

export const DRISHTI_DANGLE: GuideEntry = {
  name: "Drishti Dangle",
  url: "https://drishtidangle.com",
  what: "Indian-inspired desktop charms and musical wind chimes for Windows and Mac, with twelve designs.",
  bestFor: "Indian-inspired charms and wind chimes specifically",
  platforms: "Windows and Mac",
  price: "₹99",
  note: "Paid, and the only one here offering musical wind chimes.",
};

export const BOOK_MY_LUCK: GuideEntry = {
  name: "Book My Luck",
  url: "https://bookmyluck.com",
  what: "Choose a charm for your Mac or Windows desktop, watch it sway, and give it a playful flick. Twenty-two charms listed, and an emoji can be hung instead.",
  bestFor: "A paid charm app with a published catalogue and bundle licensing",
  platforms: "macOS 14+, Windows 10 and 11",
  price: "\u20b999 once; \u20b9297 for five licences",
  note: "Paid rather than free, and the catalogue is 22 charms against Hangly's 81. They do publish a count, which most of this category does not.",
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
  what: "Free open-source desktop pets with a pet gallery, plugins and options.",
  bestFor: "People who want open source and to modify the pet",
  platforms: "See their site",
  price: "Free, open source",
  note: "The only genuinely open-source option in this list.",
};

export const MICROJOYZ: GuideEntry = {
  name: "MicroJoyz",
  url: "https://microjoyz.com",
  what: "A desktop pet app for Mac with animated throwable pets, reminders, social features and mini-games.",
  bestFor: "The most feature-rich desktop pet on Mac",
  platforms: "macOS",
  price: "See their site",
  note: "Considerably more than decoration — reminders, social features, games.",
};

export const CAT_FIDGET: GuideEntry = {
  name: "Cat Fidget",
  url: "https://www.highroadsoftware.com/apps/catfidget",
  what: "A tiny desktop cat for the Mac menu bar you can pet, feed, drag and fling, with breeds and accessories.",
  bestFor: "A menu bar cat with no account or tracking",
  platforms: "macOS",
  price: "See their site",
  note: "Their site states no account, ads, analytics or tracking.",
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
  url: "https://www.typibara.com",
  what: "A customisable typing companion that syncs with your keystrokes.",
  bestFor: "Something that reacts while you write",
  platforms: "macOS",
  price: "See their site",
  note: "Tied to typing; idle when you are not.",
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
