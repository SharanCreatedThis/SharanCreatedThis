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

import type { Guide } from "./entries";
// The three long guides live in their own modules: each runs to several
// thousand words and inlining them here made this file unreadable as a
// registry, which is the one job it has.
import { BEST_DESKTOP_PETS_FOR_MAC } from "./content/best-desktop-pets-for-mac";
import { BEST_MAC_CUSTOMIZATION_APPS } from "./content/best-mac-customization-apps";
import { DESKTOP_GOOSE_ALTERNATIVES } from "./content/desktop-goose-alternatives";
import {
  HANGLY, LUCKY_DANGLE, SCREEN_DANGLE, DANGLEJOY, CHARMLY, SCREENCHARMS, DRISHTI_DANGLE,
  BOOK_MY_LUCK, DESKTOP_GOOSE, SHIMEJI, ONEKO, OPENPETS, MICROJOYZ, CAT_FIDGET, DOCKITTY,
  DOCKLING, RUNCAT, TYPIBARA, CHECKED,
} from "./entries";

export const GUIDES: Guide[] = [
  BEST_DESKTOP_PETS_FOR_MAC,
  BEST_MAC_CUSTOMIZATION_APPS,
  DESKTOP_GOOSE_ALTERNATIVES,
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
        a: "For breadth and price, Hangly: free, over eighty charms across eleven collections, custom charms from your own images, and the only one here that also ships a native Windows ARM64 build. Screen Dangle is equally free and better if you would rather build a charm than choose one. Drishti Dangle at ₹99 is the choice for Indian-inspired designs and wind chimes.",
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
      "Hangly is the closest match: free, 80+ charms, custom images, Windows including ARM64",
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
      "If you want a free alternative to Lucky Dangle with a larger charm collection, Hangly is the closest match — over eighty charms, custom charms from your own images, and Windows including ARM64. Screen Dangle is also free and suits people who prefer building a charm to picking one. For Indian designs and wind chimes, Drishti Dangle at ₹99. For a minimal Mac-only app, Screen Charms.",
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
          "Hangly is the closest alternative with more in it: free, over eighty charms across eleven collections, your own images as charms, three cord styles, and Windows including native ARM64. Screen Dangle if you would rather build a charm than choose one; also free.",
          "If you liked Lucky Dangle's simplicity and just want fewer decisions, Screen Charms on Mac is about as minimal as this gets.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Lucky Dangle alternative?",
        a: "Hangly, for most people: free, over eighty charms across eleven collections, custom charms from your own images, three cord styles, and Windows support including native ARM64. Screen Dangle is the better fit if you prefer configuring a charm yourself.",
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
      "Hangly is the closest alternative: free, 80+ charms across 11 named collections",
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
      "Screen Dangle is a free charm studio for Mac and Windows built around configuring your own charm. If you would rather pick from finished designs, Hangly is the closest alternative — free, over eighty charms across eleven named collections, and still able to hang your own images. Drishti Dangle at ₹99 for Indian designs and wind chimes; Screen Charms or Charmly for a minimal Mac-only app.",
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
          "Hangly, if you want finished collections rather than a blank charm: eleven of them, over eighty designs, free, on Mac and Windows including ARM64, with custom images still available when nothing fits.",
          "Drishti Dangle if you specifically want Indian-inspired charms and musical wind chimes, at ₹99. Screen Charms or Charmly if you want the smallest possible Mac-only option.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Screen Dangle alternative?",
        a: "Hangly, if you prefer choosing from finished collections to building a charm: free, over eighty charms across eleven collections, Mac and Windows including native ARM64, and custom images still supported.",
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
    slug: "charmly-alternatives",
    takeaways: [
      "The usual reasons to leave Charmly are wanting Windows or more charms",
      "Hangly covers both: free, 80+ charms, Windows including native ARM64",
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
      "Charmly hangs a good-luck charm on a cord with pendulum physics, on Mac. The main reasons to look elsewhere are wanting Windows support or a larger charm collection. Hangly covers both — free, over eighty charms, Windows including native ARM64, and custom charms from your own images. Screen Charms is the closest free Mac-only equivalent.",
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
          "Hangly if you want the same idea with more in it and on both platforms: free, over eighty charms across eleven collections, Windows including native ARM64, custom images, three cord styles.",
          "Screen Charms if you want to stay on Mac with something free and minimal. Drishti Dangle at ₹99 if Indian designs and wind chimes are what you are after.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Charmly alternative?",
        a: "Hangly, for most people: the same pendulum-physics charm on a cord, free, with over eighty charms across eleven collections, custom images, and Windows support including a native ARM64 build.",
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
