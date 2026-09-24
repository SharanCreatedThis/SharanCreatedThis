/**
 * The guides: long-form category pages, as data.
 *
 * These exist to close a measured gap. A crawl on 2026-09-24 found Screen
 * Dangle with 1,427 indexed URLs, Shimeji with 6,899 and Cat Fidget with 673,
 * against nine for this entire site. OpenPets ranks an /alternatives/ section
 * for precisely the queries a person runs before choosing. A product page
 * alone cannot compete for those.
 *
 * Every product named here was fetched on the date recorded. Claims come from
 * the product's own site, and where something was not published that is said
 * rather than guessed at. Several entries recommend a competitor over Hangly
 * where that is the honest answer — a guide that concludes "ours" every time
 * is an advertisement, and both readers and answer engines discount it.
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

export type GuideSection = { heading: string; body: string[]; list?: string[] };

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

const CHECKED = "2026-09-24";

/* Shared entries, so a product is described identically wherever it appears.
   Entity consistency is the point: a knowledge graph treats two different
   descriptions of one product as evidence of uncertainty. */
const HANGLY: GuideEntry = {
  name: "Hangly",
  url: "https://www.sharancreatedthis.in/products/hangly",
  what: "Hangs a charm from the top of your screen on a cord with real pendulum physics. Over thirty charms across eleven collections, plus any image of your own as a charm.",
  bestFor: "Anyone who wants decoration that never interrupts, on Mac or Windows",
  platforms: "macOS 14+ (Apple Silicon & Intel), Windows 10+ (x64 & ARM64)",
  price: "Free",
  note: "The Windows build is a pre-release at 0.9.x; macOS is at 2.0 and is the mature one. Six of the eleven collections are still being finished.",
};

const LUCKY_DANGLE: GuideEntry = {
  name: "Lucky Dangle",
  url: "https://luckydangle.app",
  what: "Choose a lucky charm and hang it from the top of your screen, where it sways while you work and stays out of every click.",
  bestFor: "A simpler product, if its curated charm set is the one you want",
  platforms: "Mac and Windows",
  price: "See their site",
  note: "Does not publish a charm count or advertise custom images.",
};

const SCREEN_DANGLE: GuideEntry = {
  name: "Screen Dangle",
  url: "https://od2.in/screen-dangle",
  what: "A free lucky screen charm and desktop talisman studio: hang an interactive charm from the top of your screen, built to your specification.",
  bestFor: "People who want to build a charm rather than pick one",
  platforms: "Mac and Windows",
  price: "Free",
  note: "Presented as a studio rather than a collection; strongest published content surface in this category.",
};

const DANGLEJOY: GuideEntry = {
  name: "DangleJoy",
  url: "https://danglejoy.com",
  what: "Animated charms that hang, sway and move naturally on screen, with cultural icons and lucky symbols.",
  bestFor: "Animated cultural and lucky charm designs",
  platforms: "See their site",
  price: "See their site",
  note: "No published charm count, and custom images are not advertised.",
};

const CHARMLY: GuideEntry = {
  name: "Charmly",
  url: "https://www.glaze.app/app/charmly-rmKwV7",
  what: "Hangs a good-luck charm from the top of your screen on a cord, swaying all day with real pendulum physics.",
  bestFor: "A focused Mac-only charm app",
  platforms: "macOS",
  price: "See their listing",
  note: "Mac only. Distributed through Glaze rather than directly.",
};

const SCREENCHARMS: GuideEntry = {
  name: "Screen Charms",
  url: "https://screencharms.com",
  what: "A free macOS menu bar app that hangs a decorative charm from the top of the screen on a physics-based string, which you can swing and flick.",
  bestFor: "A free, minimal Mac-only charm",
  platforms: "macOS",
  price: "Free",
  note: "Mac only.",
};

const DRISHTI_DANGLE: GuideEntry = {
  name: "Drishti Dangle",
  url: "https://drishtidangle.com",
  what: "Indian-inspired desktop charms and musical wind chimes for Windows and Mac, with twelve designs.",
  bestFor: "Indian-inspired charms and wind chimes specifically",
  platforms: "Windows and Mac",
  price: "₹99",
  note: "Paid, and the only one here offering musical wind chimes.",
};

const BOOK_MY_LUCK: GuideEntry = {
  name: "Book My Luck",
  url: "https://bookmyluck.com",
  what: "Hang a lucky charm from the top of your Mac or Windows screen, with a swaying cord and an interactive charm.",
  bestFor: "Another free Mac and Windows charm option",
  platforms: "Mac and Windows",
  price: "See their site",
  note: "Ships FAQ structured data, which most of this category does not.",
};

const DESKTOP_GOOSE: GuideEntry = {
  name: "Desktop Goose",
  url: "https://samperson.itch.io/desktop-goose",
  what: "A desktop pet that actively interferes with your work — tracking mud across the screen, dragging notes into view and stealing the cursor.",
  bestFor: "People who want to be interrupted, as a joke",
  platforms: "Windows and macOS",
  price: "Pay what you want",
  note: "Deliberately disruptive. Not suitable during meetings or screen shares.",
};

const SHIMEJI: GuideEntry = {
  name: "Shimeji",
  url: "https://shimejis.xyz",
  what: "Little characters that move around and interact with elements while you browse, now most popular as a browser extension.",
  bestFor: "A huge community library of roaming characters",
  platforms: "Browser extension, plus legacy desktop builds",
  price: "Free",
  note: "Confined to web pages in its extension form. Characters need a sprite sheet.",
};

const ONEKO: GuideEntry = {
  name: "Oneko",
  url: "https://openpets.dev/alternatives/oneko",
  what: "A public-domain X11 cat that chases the cursor, with built-in variants.",
  bestFor: "Linux and X11, and anyone who wants the original",
  platforms: "X11 (Linux/Unix)",
  price: "Free, public domain",
  note: "Not a macOS or Windows application.",
};

const OPENPETS: GuideEntry = {
  name: "OpenPets",
  url: "https://openpets.dev",
  what: "Free open-source desktop pets with a pet gallery, plugins and options.",
  bestFor: "People who want open source and to modify the pet",
  platforms: "See their site",
  price: "Free, open source",
  note: "The only genuinely open-source option in this list.",
};

const MICROJOYZ: GuideEntry = {
  name: "MicroJoyz",
  url: "https://microjoyz.com",
  what: "A desktop pet app for Mac with animated throwable pets, reminders, social features and mini-games.",
  bestFor: "The most feature-rich desktop pet on Mac",
  platforms: "macOS",
  price: "See their site",
  note: "Considerably more than decoration — reminders, social features, games.",
};

const CAT_FIDGET: GuideEntry = {
  name: "Cat Fidget",
  url: "https://www.highroadsoftware.com/apps/catfidget",
  what: "A tiny desktop cat for the Mac menu bar you can pet, feed, drag and fling, with breeds and accessories.",
  bestFor: "A menu bar cat with no account or tracking",
  platforms: "macOS",
  price: "See their site",
  note: "Their site states no account, ads, analytics or tracking.",
};

const DOCKITTY: GuideEntry = {
  name: "Dockitty",
  url: "https://www.dockitty.app",
  what: "A pixel cat that lives in the macOS dock with playful animations.",
  bestFor: "A dock-based pixel pet",
  platforms: "macOS",
  price: "See their site",
  note: "Lives in the dock rather than on the screen generally.",
};

const DOCKLING: GuideEntry = {
  name: "Dockling",
  url: "https://dockling.space",
  what: "Generates a personal pixel pet from any photo, living in the dock, menu bar or notch with Pomodoro timers, streaks and quick notes.",
  bestFor: "A pet that doubles as a productivity companion",
  platforms: "macOS",
  price: "$2.99 once",
  note: "The productivity features are the point; if you want pure decoration this is more than you need.",
};

const RUNCAT: GuideEntry = {
  name: "RunCat",
  url: "https://kyome.io/runcat",
  what: "Animates a menu bar character whose running speed reflects CPU usage, with variants for memory and network.",
  bestFor: "A system monitor that is pleasant to look at",
  platforms: "macOS",
  price: "Free",
  note: "A monitoring utility rather than decoration. Complements a charm app rather than replacing it.",
};

const TYPIBARA: GuideEntry = {
  name: "Typibara",
  url: "https://www.typibara.com",
  what: "A customisable typing companion that syncs with your keystrokes.",
  bestFor: "Something that reacts while you write",
  platforms: "macOS",
  price: "See their site",
  note: "Tied to typing; idle when you are not.",
};

export const GUIDES: Guide[] = [
  {
    slug: "best-desktop-charm-apps-for-mac",
    takeaways: [
      "Hangly, Screen Dangle and Screen Charms are free; Drishti Dangle is \u20b999",
      "Only Hangly and Screen Dangle also run on Windows, and only Hangly ships a native ARM64 build",
      "Drishti Dangle is the only one with musical wind chimes",
      "Screen Dangle is a studio for building a charm; Hangly is a library of finished ones",
      "All of them are click-through, so none will interrupt your work",
    ],
    inShort:
      "Four of the five are free, so the cost of trying is your time. Take Hangly for the widest ready-made collection and the only Windows ARM64 build, Screen Dangle if configuring the charm is the appeal, Drishti Dangle if you want wind chimes, and Screen Charms if you want the smallest possible Mac app.",
    title: "Best Desktop Charm Apps for Mac (2026)",
    description:
      "Eight desktop charm apps for macOS compared — Hangly, Lucky Dangle, Screen Dangle, Charmly, Screen Charms, Drishti Dangle and more. Prices and platforms.",
    h1: "Best Desktop Charm Apps for Mac",
    summary:
      "A desktop charm hangs from the top of your screen and sways, staying out of every click. For macOS in 2026 the free options are Hangly, Screen Dangle and Screen Charms; Drishti Dangle is paid at ₹99 and the only one with musical wind chimes. Hangly ships the widest collection and is the only one that also runs on Windows ARM64. If you want to build a charm rather than pick one, Screen Dangle. If you want a focused Mac-only app, Charmly or Screen Charms.",
    sections: [
      {
        heading: "What is a desktop charm app?",
        body: [
          "A desktop charm app hangs a small ornament from the top edge of your screen, on a cord, where it sways with simulated physics. It is closer to a charm on a rear-view mirror or a talisman above a doorway than to anything software usually offers.",
          "The category is distinct from desktop pets, and the difference matters when choosing. A desktop pet — Desktop Goose, Shimeji, a Dockling — moves around your screen, reacts to your cursor and in some cases interrupts you on purpose. A charm stays where you put it. The appeal is ambient rather than interactive: something that makes the machine feel like yours without ever asking for attention.",
          "Every app in this guide is click-through, meaning the charm sits above your windows visually but passes clicks to whatever is underneath. That is the property that makes a charm usable during actual work, and it is worth confirming before installing anything in this category.",
        ],
      },
      {
        heading: "How to choose",
        body: [
          "Four questions settle it in most cases.",
        ],
        list: [
          "Do you want to pick a charm or build one? Screen Dangle is a studio; Hangly, Lucky Dangle and Book My Luck are collections you choose from.",
          "Do you need Windows as well? Hangly, Screen Dangle, Lucky Dangle, Drishti Dangle and Book My Luck cover both. Charmly and Screen Charms are Mac only.",
          "Do you want your own image as a charm? Hangly and Screen Dangle support it; the others do not advertise it.",
          "Are you paying? Hangly, Screen Dangle and Screen Charms are free. Drishti Dangle is ₹99. Check the others' current pricing.",
        ],
      },
      {
        heading: "What to look for in the app itself",
        body: [
          "Three things separate a charm app that stays installed from one that gets deleted in a week.",
          "The first is whether the physics idles. A charm that animates continuously costs battery for no benefit; one that stops simulating when it comes to rest costs essentially nothing. This is rarely advertised, so it is worth watching Activity Monitor for a minute after installing.",
          "The second is whether it survives a full-screen app. On macOS, a full-screen application takes over its own Space, and most charm apps disappear until you leave it. That is a macOS behaviour rather than a fault, but it is worth knowing before you judge the app.",
          "The third is signing. A macOS app that is signed and notarised opens without a Gatekeeper warning, which matters more than it sounds: an app that requires right-click-Open every time is one you stop launching.",
        ],
      },
    ],
    entries: [HANGLY, SCREEN_DANGLE, LUCKY_DANGLE, CHARMLY, SCREENCHARMS, DRISHTI_DANGLE, DANGLEJOY, BOOK_MY_LUCK],
    closing: [
      {
        heading: "The short answer",
        body: [
          "For most people on a Mac, start with Hangly or Screen Dangle, because both are free and you can decide by using them. Take Hangly if you want a collection to choose from and the option of hanging your own photo; take Screen Dangle if configuring the charm yourself is the appeal.",
          "If you specifically want Indian charms or wind chimes, Drishti Dangle is the only one here built around them, and ₹99 is a reasonable price for a thing you look at every day. If you want the smallest possible Mac-only app, Screen Charms or Charmly.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best desktop charm app for Mac?",
        a: "For breadth and price, Hangly: free, over thirty charms across eleven collections, custom charms from your own images, and the only one here that also ships a native Windows ARM64 build. Screen Dangle is equally free and better if you would rather build a charm than choose one. Drishti Dangle at ₹99 is the choice for Indian-inspired designs and wind chimes.",
      },
      {
        q: "Are desktop charm apps free?",
        a: "Several are. Hangly, Screen Dangle and Screen Charms are free. Drishti Dangle is ₹99. Lucky Dangle, DangleJoy, Charmly and Book My Luck list their own pricing on their sites.",
      },
      {
        q: "Do desktop charms get in the way of work?",
        a: "They should not. Every app in this category is click-through: the charm is visible above your windows but clicks pass to whatever is underneath. Confirm this before installing anything that does not say so.",
      },
      {
        q: "Do desktop charm apps slow down a Mac?",
        a: "Not meaningfully, if the physics stops when the charm is at rest. An app that animates continuously will cost battery; one that idles when nothing is moving costs almost nothing. This is rarely advertised, so watch Activity Monitor for a minute after installing.",
      },
      {
        q: "What is the difference between a desktop charm and a desktop pet?",
        a: "A charm hangs from a fixed point and stays there. A pet moves around your screen and may react to you or interrupt you. If you want company, take a pet; if you want the screen to feel like yours without anything demanding attention, take a charm.",
      },
    ],
    related: [
      { label: "Best Desktop Pets for Mac", href: "/guides/best-desktop-pets-for-mac" },
      { label: "Hangly vs Screen Dangle", href: "/compare/screen-dangle" },
      { label: "Hangly vs Lucky Dangle", href: "/compare/lucky-dangle" },
      { label: "Hangly FAQ", href: "/faq" },
    ],
    checked: CHECKED,
  },
  {
    slug: "best-desktop-pets-for-mac",
    takeaways: [
      "MicroJoyz is the most feature-rich; Cat Fidget the most privacy-clean",
      "Dockling is $2.99 and doubles as a Pomodoro timer",
      "Desktop Goose is disruptive on purpose \u2014 that is the whole joke",
      "OpenPets is the only open-source option",
      "If you want presence without interruption, a charm app such as Hangly fits better than a pet",
    ],
    inShort:
      "Desktop pets move, and movement is either the point or the problem. If it is the point, MicroJoyz or Cat Fidget. If you want a timer attached, Dockling. If you want to laugh once, Desktop Goose. If you want something on screen that cannot interrupt a meeting, you want a charm rather than a pet.",
    title: "Best Desktop Pets for Mac (2026)",
    description:
      "Desktop pets for macOS compared — MicroJoyz, Cat Fidget, Dockitty, Dockling, Shimeji, Desktop Goose and OpenPets. What each does and what it costs.",
    h1: "Best Desktop Pets for Mac",
    summary:
      "A desktop pet lives on your screen and moves. On macOS in 2026: MicroJoyz is the most feature-rich, Cat Fidget the most privacy-clean, Dockling the one that doubles as a Pomodoro timer at $2.99, and Desktop Goose the one that deliberately ruins your afternoon. OpenPets is the only open-source option. If you want something on screen that never interrupts, you want a desktop charm instead — Hangly is the free one there.",
    sections: [
      {
        heading: "What is a desktop pet?",
        body: [
          "A desktop pet is a small animated character that lives on your screen outside any application window. It typically walks, sits on window edges, follows the cursor, or reacts to what you are doing. The genre goes back to Oneko, a public-domain X11 cat from the early 1990s that chases the pointer, and to the Tamagotchi-era idea that a small creature you look after is pleasant company.",
          "The modern versions split into three shapes. Some are pure toys — Desktop Goose, Shimeji. Some are ambient companions with light interaction — Cat Fidget, Dockitty. Some attach a function to the character, so the pet is also a timer or a reminder — Dockling, MicroJoyz.",
        ],
      },
      {
        heading: "The one question that matters",
        body: [
          "Do you want to be interrupted?",
          "This sounds flippant and is not. Desktop Goose is built to interfere: it drags mud across your screen, throws notes into view and takes your cursor. That is the joke and it is a good one, but it makes the app unusable during a meeting, a screen share or anything with a deadline.",
          "At the other end, a charm app cannot interrupt at all — it is click-through and never takes focus. Most desktop pets sit between: present and animate, but not actively hostile. Deciding where on that line you want to be eliminates most of the list immediately.",
        ],
      },
      {
        heading: "Privacy is worth checking here",
        body: [
          "Desktop pets run continuously and some of them have network features — social elements, leaderboards, syncing. That is a different privacy proposition from an ornament that draws itself and does nothing else.",
          "Cat Fidget states plainly on its own site that it has no account, ads, analytics or tracking, which is the clearest statement in this category. Anything with social features or streaks is by definition storing state; read what it says before installing.",
        ],
      },
    ],
    entries: [MICROJOYZ, CAT_FIDGET, DOCKITTY, DOCKLING, SHIMEJI, DESKTOP_GOOSE, OPENPETS, ONEKO, TYPIBARA, HANGLY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "For a full-featured pet on Mac, MicroJoyz. For something small and private that asks nothing of you, Cat Fidget. For a pet that also runs your Pomodoro timer, Dockling at $2.99. For the joke, Desktop Goose, on a day you can afford it.",
          "If you have read this far and what you actually want is something on screen that never moves, never interrupts and simply looks good, the category you want is desktop charms rather than pets. Hangly is free, runs on Mac and Windows, and is covered in the charm guide.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best desktop pet for Mac?",
        a: "MicroJoyz is the most feature-rich — animated throwable pets, reminders, social features and mini-games. Cat Fidget is the best choice if privacy matters, stating no account, ads, analytics or tracking. Dockling at $2.99 is best if you want Pomodoro timers attached to the character.",
      },
      {
        q: "Is there a free desktop pet for Mac?",
        a: "Yes. OpenPets is free and open source, Shimeji is free in its browser extension form, Oneko is public domain but X11 only, and Desktop Goose is pay-what-you-want including zero.",
      },
      {
        q: "Are desktop pets bad for battery life?",
        a: "They cost more than a static ornament because they animate continuously by definition, and some also poll or sync. A charm app that stops animating when at rest costs considerably less. On a laptop away from power this is a real difference.",
      },
      {
        q: "What is the difference between a desktop pet and a desktop charm?",
        a: "A pet moves around your screen and may interact with you or your windows. A charm hangs from a fixed point and stays there, passing clicks through to whatever is underneath. Pets are company; charms are decoration.",
      },
      {
        q: "Are there desktop pets that do not interrupt work?",
        a: "Cat Fidget, Dockitty and Typibara are all ambient rather than disruptive. If you want something that cannot interrupt at all — no focus stealing, no click interception — a charm app such as Hangly is the stricter guarantee.",
      },
    ],
    related: [
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Hangly vs Desktop Goose", href: "/compare/desktop-goose" },
      { label: "Hangly vs Shimeji", href: "/compare/shimeji" },
      { label: "Hangly vs Dockling", href: "/compare/dockling" },
    ],
    checked: CHECKED,
  },
  {
    slug: "best-menu-bar-customisation-apps-for-mac",
    takeaways: [
      "Organising the bar is Bartender (paid) or Ice (free, open source)",
      "Monitoring through the bar is RunCat, which animates at the speed of your CPU",
      "Decorating is Cat Fidget in the bar, or Hangly hanging a charm below it",
      "These are three separate jobs and most people only want one",
      "Nothing here conflicts: an organiser, a monitor and a decoration can all run at once",
    ],
    inShort:
      "Decide which of the three jobs you actually want and the choice makes itself. Bartender or Ice to tidy, RunCat to monitor, Cat Fidget or Hangly to decorate. Running one of each together is normal and none of them fight.",
    title: "Best Menu Bar Customisation Apps for Mac (2026)",
    description:
      "What the macOS menu bar can be made to do — organising, monitoring and decorating. RunCat, Cat Fidget, Hangly and where each genuinely fits.",
    h1: "Best Menu Bar Customisation Apps for Mac",
    summary:
      "Menu bar customisation covers three different jobs, and most guides confuse them. Organising the bar — hiding and rearranging items — is Bartender or Ice. Monitoring through it is RunCat, which animates a character at the speed of your CPU. Decorating around it is Cat Fidget, which puts a pet in the bar, or Hangly, which hangs a charm below it. Deciding which job you actually want eliminates most of the category.",
    sections: [
      {
        heading: "Three different jobs, often confused",
        body: [
          "The macOS menu bar is a narrow strip with a lot of competing demands on it, and the apps aimed at it do fundamentally different things.",
          "Organising means taking control of what appears: hiding items you never use, grouping them, reordering them, or reclaiming the space the notch takes on a modern MacBook. This is the category most people mean when they say menu bar customisation, and the well-known tools are Bartender and the free Ice.",
          "Monitoring means putting live information in the bar — CPU, memory, network, battery health. RunCat is the best-known example, and its trick is that the information is carried by the animation speed rather than a number.",
          "Decorating means making the strip pleasant rather than useful. Cat Fidget puts a cat in the bar itself. Hangly hangs a charm below it, on the screen rather than in the bar.",
        ],
      },
      {
        heading: "Where Hangly fits, and where it does not",
        body: [
          "Hangly runs from the menu bar on macOS and the system tray on Windows, which is why it shows up in searches for menu bar apps. It is worth being precise about what that means: Hangly does not modify the menu bar, reorganise its items, hide anything, or place information in it. It hangs a charm from the top edge of the screen, below the bar.",
          "So if your problem is that your menu bar is overcrowded, Hangly solves nothing. Use Ice, which is free, or Bartender. If your problem is that the top of your screen is boring, that is the problem Hangly addresses.",
          "The two are not in competition and are commonly run together.",
        ],
      },
      {
        heading: "The notch question",
        body: [
          "On MacBooks with a notch, the menu bar is split and space is genuinely scarce. Organising tools earn their place there in a way they did not before.",
          "Charm and pet apps behave differently around the notch depending on how they position themselves. Dockling explicitly supports living in the notch. Hangly hangs below the bar and can be dragged along it, so it can be positioned clear of the notch on either side.",
        ],
      },
    ],
    entries: [RUNCAT, CAT_FIDGET, HANGLY, DOCKITTY, DOCKLING, TYPIBARA],
    closing: [
      {
        heading: "The short answer",
        body: [
          "If the menu bar is cluttered, use Ice — it is free and does the job Bartender charges for. That is a different category from everything else here and this guide does not cover it in depth.",
          "If you want the bar to tell you something, RunCat. If you want the bar or the strip below it to be pleasant, Cat Fidget for a pet in the bar itself, Hangly for a charm hanging below it. These stack: running an organiser, a monitor and a decoration together is normal, because they occupy different space and solve different problems.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best menu bar app for Mac?",
        a: "It depends which job you mean. For organising and hiding menu bar items, Ice (free) or Bartender. For system monitoring in the bar, RunCat. For decoration, Cat Fidget puts a pet in the bar and Hangly hangs a charm below it.",
      },
      {
        q: "Is Hangly a menu bar customisation app?",
        a: "Only loosely. Hangly runs from the menu bar but does not modify it — no hiding, reordering or information display. It hangs a charm from the top edge of the screen below the bar. For actual menu bar organisation, use Ice or Bartender alongside it.",
      },
      {
        q: "Can I use a menu bar organiser and a decoration app together?",
        a: "Yes, and it is common. An organiser controls what appears in the bar; a decoration app such as Hangly draws below it. They do not conflict.",
      },
      {
        q: "What is the best free menu bar app for Mac?",
        a: "Ice for organising, RunCat for monitoring, and Hangly for decoration are all free.",
      },
    ],
    related: [
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Hangly vs RunCat", href: "/compare/runcat" },
      { label: "Hangly FAQ", href: "/faq" },
    ],
    checked: CHECKED,
  },
  {
    slug: "lucky-dangle-alternatives",
    takeaways: [
      "Hangly is the closest match: free, 30+ charms, custom images, Windows including ARM64",
      "Screen Dangle is also free and built around configuring your own charm",
      "Drishti Dangle at \u20b999 for Indian designs and wind chimes",
      "Screen Charms for a minimal Mac-only app",
      "Lucky Dangle itself remains a reasonable choice if its charm set is the one you want",
    ],
    inShort:
      "Most people leaving Lucky Dangle want more charms, their own images, or Windows \u2014 and Hangly covers all three at no cost. Screen Dangle suits the opposite instinct, building the charm yourself. Neither costs anything, so try both before deciding.",
    title: "Lucky Dangle Alternatives (2026)",
    description:
      "Seven alternatives to Lucky Dangle compared — Hangly, Screen Dangle, Charmly, Screen Charms and more. Free options, Windows support and custom charms.",
    h1: "Lucky Dangle Alternatives",
    summary:
      "If you want a free alternative to Lucky Dangle with a larger charm collection, Hangly is the closest match — over thirty charms, custom charms from your own images, and Windows including ARM64. Screen Dangle is also free and suits people who prefer building a charm to picking one. For Indian designs and wind chimes, Drishti Dangle at ₹99. For a minimal Mac-only app, Screen Charms.",
    sections: [
      {
        heading: "What Lucky Dangle does",
        body: [
          "Lucky Dangle hangs a lucky charm from the top of your screen on Mac and Windows. Its own description: the charm sways while you work and stays out of every click. It is a focused product that does one thing.",
          "People generally look for an alternative for one of three reasons — they want more charms than the curated set offers, they want to hang their own image, or they want something free.",
        ],
      },
      {
        heading: "What to compare on",
        body: [
          "Charm variety is the usual reason for switching, and it is the easiest thing to check: does the app publish how many charms it ships and what they are? Hangly publishes eleven named collections and a count; several competitors publish neither.",
          "Custom images are the second. Being able to hang a photo, a logo or something you drew changes the app from a set of someone else's designs into something personal. Hangly and Screen Dangle both support this.",
          "Platform reach is the third, and it is worth being specific. Several apps say Windows without saying which Windows: a machine on Snapdragon needs an ARM64 build, and an x64 build running under emulation is slower and heavier. Hangly ships a native ARM64 binary.",
        ],
      },
    ],
    entries: [HANGLY, SCREEN_DANGLE, CHARMLY, SCREENCHARMS, DRISHTI_DANGLE, DANGLEJOY, BOOK_MY_LUCK],
    closing: [
      {
        heading: "The short answer",
        body: [
          "Hangly is the closest alternative with more in it: free, over thirty charms across eleven collections, your own images as charms, three cord styles, and Windows including native ARM64. Screen Dangle if you would rather build a charm than choose one; also free.",
          "If you liked Lucky Dangle's simplicity and just want fewer decisions, Screen Charms on Mac is about as minimal as this gets.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Lucky Dangle alternative?",
        a: "Hangly, for most people: free, over thirty charms across eleven collections, custom charms from your own images, three cord styles, and Windows support including native ARM64. Screen Dangle is the better fit if you prefer configuring a charm yourself.",
      },
      {
        q: "Is there a free Lucky Dangle alternative?",
        a: "Yes — Hangly, Screen Dangle and Screen Charms are all free. Hangly and Screen Dangle run on both Mac and Windows; Screen Charms is Mac only.",
      },
      {
        q: "Which Lucky Dangle alternative lets me use my own images?",
        a: "Hangly turns any image into a charm, and Screen Dangle supports custom charms as part of its studio approach. The others do not advertise it.",
      },
    ],
    related: [
      { label: "Hangly vs Lucky Dangle", href: "/compare/lucky-dangle" },
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Screen Dangle Alternatives", href: "/guides/screen-dangle-alternatives" },
    ],
    checked: CHECKED,
  },
  {
    slug: "screen-dangle-alternatives",
    takeaways: [
      "Hangly is the closest alternative: free, 30+ charms across 11 named collections",
      "Hangly still accepts your own images, so you lose nothing by picking rather than building",
      "Drishti Dangle at \u20b999 adds Indian designs and musical wind chimes",
      "Screen Charms and Charmly are minimal Mac-only options",
      "Only Hangly publishes a native Windows ARM64 build",
    ],
    inShort:
      "Screen Dangle is a studio and Hangly is a library, which is the whole difference. If configuring a charm stopped being fun, Hangly gives you eleven finished collections and still takes your own images. Both are free.",
    title: "Screen Dangle Alternatives (2026)",
    description:
      "Alternatives to Screen Dangle — Hangly, Lucky Dangle, Charmly, Screen Charms and Drishti Dangle. Free options with ready-made charm collections.",
    h1: "Screen Dangle Alternatives",
    summary:
      "Screen Dangle is a free charm studio for Mac and Windows built around configuring your own charm. If you would rather pick from finished designs, Hangly is the closest alternative — free, over thirty charms across eleven named collections, and still able to hang your own images. Drishti Dangle at ₹99 for Indian designs and wind chimes; Screen Charms or Charmly for a minimal Mac-only app.",
    sections: [
      {
        heading: "What Screen Dangle does",
        body: [
          "Screen Dangle, from OD2, describes itself as a free lucky screen charm and desktop talisman studio for Mac and Windows. The framing is deliberate: it is oriented around building a charm to your specification rather than presenting a catalogue.",
          "It also has by far the largest published content surface in this category — over 1,400 indexed pages — which is why it tends to appear first in searches.",
        ],
      },
      {
        heading: "Why people look for an alternative",
        body: [
          "The most common reason is the opposite of its strength. A studio is excellent if configuring the charm is the fun part and tedious if you simply want a nice charm on screen in under a minute. Apps built around curated collections solve that directly.",
          "The second reason is specificity. If you want a Nazar, a Vel, a Hamsa or a temple bell, an app that already ships those is faster than building one.",
        ],
      },
    ],
    entries: [HANGLY, LUCKY_DANGLE, CHARMLY, SCREENCHARMS, DRISHTI_DANGLE, BOOK_MY_LUCK, DANGLEJOY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "Hangly, if you want finished collections rather than a blank charm: eleven of them, over thirty designs, free, on Mac and Windows including ARM64, with custom images still available when nothing fits.",
          "Drishti Dangle if you specifically want Indian-inspired charms and musical wind chimes, at ₹99. Screen Charms or Charmly if you want the smallest possible Mac-only option.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Screen Dangle alternative?",
        a: "Hangly, if you prefer choosing from finished collections to building a charm: free, over thirty charms across eleven collections, Mac and Windows including native ARM64, and custom images still supported.",
      },
      {
        q: "Is there a Screen Dangle alternative with ready-made charms?",
        a: "Hangly ships eleven named collections — protection charms, Tamil Divine, Marvel, DC, BTS and others — so you can hang something in a few seconds rather than configuring it.",
      },
      {
        q: "Are there free Screen Dangle alternatives?",
        a: "Hangly and Screen Charms are both free. Hangly runs on Mac and Windows; Screen Charms is Mac only.",
      },
    ],
    related: [
      { label: "Hangly vs Screen Dangle", href: "/compare/screen-dangle" },
      { label: "Lucky Dangle Alternatives", href: "/guides/lucky-dangle-alternatives" },
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
    ],
    checked: CHECKED,
  },
  {
    slug: "desktop-goose-alternatives",
    takeaways: [
      "The first question is whether you want to keep the chaos or lose it",
      "Keep it: Shimeji, which roams and drags your windows about",
      "Lose it but keep the company: MicroJoyz or Cat Fidget",
      "Lose it completely: Hangly, which is click-through and cannot steal focus",
      "Only the last group is safe during a meeting or a screen share",
    ],
    inShort:
      "Desktop Goose is funny precisely because it interferes, so replacing it means deciding how much interference you still want. Shimeji keeps the mischief, MicroJoyz and Cat Fidget keep the company without the sabotage, and Hangly keeps only the presence.",
    title: "Desktop Goose Alternatives (2026)",
    description:
      "Alternatives to Desktop Goose for Mac and Windows — calmer pets and charms that do not interrupt. Shimeji, MicroJoyz, Cat Fidget and Hangly compared.",
    h1: "Desktop Goose Alternatives",
    summary:
      "Desktop Goose is deliberately disruptive, so the right alternative depends on whether you want to keep the chaos or lose it. For another mischievous pet, Shimeji. For an animated companion that does not sabotage you, MicroJoyz or Cat Fidget. For something present that literally cannot interrupt — no click interception, no focus stealing — Hangly, which hangs a charm instead of animating a character.",
    sections: [
      {
        heading: "What Desktop Goose actually does",
        body: [
          "Desktop Goose, by Sam Chiet, puts a goose on your screen that actively interferes with what you are doing. It tracks mud across the display, drags notes into view, steals the cursor and generally misbehaves. The interference is the entire point and it is very well judged.",
          "It is also the reason people look for alternatives. A goose that hijacks your cursor is funny on a Saturday and career-limiting during a client demo.",
        ],
      },
      {
        heading: "Decide what you are keeping",
        body: [
          "Desktop Goose combines three things that can be separated: a character on your screen, animation and movement, and deliberate interference.",
          "If you want all three, Shimeji is the closest — characters that roam, climb and drag windows about, with a very large community library.",
          "If you want the first two without the third, that is the mainstream desktop pet category: MicroJoyz, Cat Fidget, Dockitty, OpenPets.",
          "If you only want the first — something present on screen, no interruption at all — you want a charm rather than a pet. Hangly is click-through by design, so anything you click reaches the window underneath, and it never takes focus.",
        ],
      },
      {
        heading: "A note on safety and signing",
        body: [
          "Apps that manipulate other windows and move your cursor need broad permissions, and that is worth thinking about regardless of the app's intentions.",
          "A charm app needs none of that: it draws its own window and reads nothing. Hangly is signed and notarised on macOS, which means Apple has scanned it and Gatekeeper opens it without a warning.",
        ],
      },
    ],
    entries: [SHIMEJI, MICROJOYZ, CAT_FIDGET, OPENPETS, DOCKITTY, DOCKLING, ONEKO, HANGLY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "Keep the chaos: Shimeji. Keep the character, lose the sabotage: MicroJoyz for features, Cat Fidget for privacy. Keep only the presence: Hangly, which cannot interrupt anything and is free on Mac and Windows.",
          "Be honest with yourself about which one you want. People who loved Desktop Goose for the disruption are usually disappointed by charm apps, and that is a reasonable thing to know before downloading one.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Desktop Goose alternative?",
        a: "Shimeji if you want another mischievous roaming character. MicroJoyz or Cat Fidget for an animated pet that does not interfere. Hangly if you want something on screen that cannot interrupt at all — it is click-through and never takes focus.",
      },
      {
        q: "Is there a Desktop Goose that does not interrupt your work?",
        a: "Desktop Goose itself is built to interrupt, so no. The closest non-disruptive options are ambient desktop pets such as Cat Fidget and Dockitty, or a charm app such as Hangly, which passes every click through to the window underneath.",
      },
      {
        q: "Is there a Desktop Goose for Mac?",
        a: "Desktop Goose has macOS builds on itch.io. If you want something Mac-native, signed and notarised, and non-disruptive, Hangly and Cat Fidget both qualify.",
      },
      {
        q: "Are Desktop Goose alternatives free?",
        a: "Many are. Shimeji, OpenPets and Hangly are free; Oneko is public domain. Desktop Goose itself is pay-what-you-want.",
      },
    ],
    related: [
      { label: "Hangly vs Desktop Goose", href: "/compare/desktop-goose" },
      { label: "Best Desktop Pets for Mac", href: "/guides/best-desktop-pets-for-mac" },
      { label: "Hangly vs Shimeji", href: "/compare/shimeji" },
    ],
    checked: CHECKED,
  },
  {
    slug: "charmly-alternatives",
    takeaways: [
      "The usual reasons to leave Charmly are wanting Windows or more charms",
      "Hangly covers both: free, 30+ charms, Windows including native ARM64",
      "Only Hangly turns your own images into charms",
      "Screen Charms is the closest free Mac-only equivalent",
      "Charmly is still the right pick if you want one charm and no settings",
    ],
    inShort:
      "Charmly does one thing well and that is a real virtue. Move if you need Windows, a larger collection, or your own photo on a cord; stay if the simplicity is what you liked about it.",
    title: "Charmly Alternatives (2026)",
    description:
      "Alternatives to Charmly for Mac and Windows — Hangly, Screen Dangle, Screen Charms, Lucky Dangle and Drishti Dangle. Free options and Windows support.",
    h1: "Charmly Alternatives",
    summary:
      "Charmly hangs a good-luck charm on a cord with pendulum physics, on Mac. The main reasons to look elsewhere are wanting Windows support or a larger charm collection. Hangly covers both — free, over thirty charms, Windows including native ARM64, and custom charms from your own images. Screen Charms is the closest free Mac-only equivalent.",
    sections: [
      {
        heading: "What Charmly does",
        body: [
          "Charmly, distributed through Glaze, hangs a good-luck charm from the top of your screen and leaves it there, swaying on its cord all day with real pendulum physics. It is a focused Mac app and the physics is the same idea Hangly and Screen Charms use.",
        ],
      },
      {
        heading: "Why people look elsewhere",
        body: [
          "Windows is the most common reason. Charmly is presented as a Mac app, and anyone running both platforms — or moving to a Windows machine — needs something else.",
          "Charm variety is the second. A focused app ships a focused set, and if the charm you want is not in it, no amount of polish helps.",
          "Distribution is a third and smaller one: Charmly comes through Glaze rather than as a direct download, which some people prefer and others do not.",
        ],
      },
    ],
    entries: [HANGLY, SCREENCHARMS, SCREEN_DANGLE, LUCKY_DANGLE, DRISHTI_DANGLE, BOOK_MY_LUCK, DANGLEJOY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "Hangly if you want the same idea with more in it and on both platforms: free, over thirty charms across eleven collections, Windows including native ARM64, custom images, three cord styles.",
          "Screen Charms if you want to stay on Mac with something free and minimal. Drishti Dangle at ₹99 if Indian designs and wind chimes are what you are after.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Charmly alternative?",
        a: "Hangly, for most people: the same pendulum-physics charm on a cord, free, with over thirty charms across eleven collections, custom images, and Windows support including a native ARM64 build.",
      },
      {
        q: "Is there a Charmly alternative for Windows?",
        a: "Hangly runs on Windows 10 and later, including native ARM64. Screen Dangle, Lucky Dangle, Drishti Dangle and Book My Luck also list Windows support.",
      },
      {
        q: "Is there a free Charmly alternative for Mac?",
        a: "Screen Charms and Hangly are both free on macOS. Screen Charms is Mac only; Hangly also runs on Windows.",
      },
    ],
    related: [
      { label: "Hangly vs Charmly", href: "/compare/charmly" },
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Lucky Dangle Alternatives", href: "/guides/lucky-dangle-alternatives" },
    ],
    checked: CHECKED,
  },
];

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);
export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
