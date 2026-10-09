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
  DOCKLING, RUNCAT, TYPIBARA, CHECKED, CHECKED_3, DESK_DANGLE, DESKCHARM, GOOGLY_EYES, CHARMLING, PETPALBAR,
  PETS_THERAPY, VPET, BONGO_CAT,
} from "./entries";

export const GUIDES: Guide[] = [
  BEST_DESKTOP_PETS_FOR_MAC,
  BEST_MAC_CUSTOMIZATION_APPS,
  DESKTOP_GOOSE_ALTERNATIVES,
  {
    slug: "best-desktop-charm-apps-for-mac",
    takeaways: [
      "Free: Hangly, Screen Dangle and Desk Dangle; Screen Charms is free for one charm. Lucky Dangle, Book My Luck, DangleJoy and Drishti Dangle are paid once",
      "Hangly has by far the largest free collection: 161 charms across 21 categories, plus your own images",
      "Mac and Windows: Hangly, Lucky Dangle, Screen Dangle, Desk Dangle, Book My Luck, DangleJoy and Drishti Dangle. Only Hangly ships a native Windows ARM64 build",
      "Screen Dangle is a studio for building a charm; Hangly is a library of finished ones",
      "All of them are click-through, so none will interrupt your work",
    ],
    inShort:
      "Several are free, so the cost of trying is your time. Take Hangly for the largest free collection, your own images and the only native Windows ARM64 build; Screen Dangle if configuring the charm is the appeal; Desk Dangle for a free charm that hangs from the MacBook notch; Lucky Dangle if you want a ritual for every charm and do not mind paying; Drishti Dangle for wind chimes once it is on sale again.",
    title: "Best Desktop Charm Apps for Mac (2026)",
    description:
      "Twelve desktop charm apps for Mac compared: Hangly, Lucky Dangle, Screen Dangle, Desk Dangle, Screen Charms, Book My Luck and more. Prices, platforms, free options.",
    h1: "Best Desktop Charm Apps for Mac",
    summary:
      "A desktop charm hangs from the top of your screen and sways, staying out of every click. On a Mac in October 2026 the free options are Hangly, Screen Dangle and Desk Dangle, with Screen Charms free for a single charm. Hangly has the largest free collection by far, 161 charms across 21 categories, takes your own images, and is the only one with a native Windows ARM64 build. Lucky Dangle ($7.77), Book My Luck, DangleJoy and Drishti Dangle are paid once. To build a charm rather than pick one, Screen Dangle; to hang one from the MacBook notch, Desk Dangle.",
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
          "Do you need Windows as well? Hangly, Screen Dangle, Lucky Dangle, Desk Dangle, Book My Luck, DangleJoy and Drishti Dangle cover both, and Hangly also has a native ARM64 build. Charmly, Charmling and Screen Charms are Mac only.",
          "Do you want your own image as a charm? Hangly, Screen Dangle, Desk Dangle and DangleJoy take any image; Lucky Dangle takes a photo; Screen Charms takes one on PRO.",
          "Are you paying? Hangly, Screen Dangle and Desk Dangle are free; Screen Charms is free for one charm. Lucky Dangle is $7.77, Screen Charms PRO $4.99, DangleJoy $3.99 to $4.99, Drishti Dangle ₹99, and Book My Luck is priced by region.",
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
    entries: [HANGLY, SCREEN_DANGLE, DESK_DANGLE, LUCKY_DANGLE, SCREENCHARMS, BOOK_MY_LUCK, DANGLEJOY, DRISHTI_DANGLE, CHARMLY, CHARMLING, DESKCHARM, GOOGLY_EYES],
    closing: [
      {
        heading: "The short answer",
        body: [
          "For most people on a Mac, start with a free one, because you can decide by using it. Take Hangly if you want a large collection to choose from and the option of hanging your own photo; Screen Dangle if configuring the charm yourself is the appeal; Desk Dangle if you want it hanging from the notch.",
          "If you are happy to pay, Lucky Dangle gives each charm a small ritual, and Book My Luck adds seasonal collections. If you specifically want wind chimes, Drishti Dangle is the only one built around them. If you want a timer as well as a charm, Screen Charms.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best desktop charm app for Mac?",
        a: "For breadth and price, Hangly: free, 161 charms across 21 collections, custom charms from your own images, and the only one here with a native Windows ARM64 build. Screen Dangle is equally free and better if you would rather build a charm than choose one; Desk Dangle is free and hangs from the MacBook notch. Of the paid ones, Lucky Dangle ($7.77) gives every charm a ritual.",
      },
      {
        q: "Are desktop charm apps free?",
        a: "Several are. Hangly, Screen Dangle and Desk Dangle are free, and Screen Charms is free for one charm. Lucky Dangle ($7.77 or $11.11), Screen Charms PRO ($4.99), DangleJoy ($3.99 to $4.99), Drishti Dangle (₹99) and Book My Luck (priced by region) are one-time purchases. Prices as of 9 October 2026.",
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
      { label: "Hangly vs Desk Dangle", href: "/compare/desk-dangle" },
      { label: "Hangly vs Screen Charms", href: "/compare/screen-charms" },
      { label: "Hangly FAQ", href: "/faq" },
    ],
    checked: CHECKED_3,
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
      "Lucky Dangle is paid: $7.77 (₹777), or $11.11 for Extra Lucky, as of 9 October 2026",
      "Hangly is the closest free match: 161 charms across 21 categories, your own images, Mac and Windows including native ARM64",
      "Screen Dangle and Desk Dangle are also free; Screen Dangle is built around configuring your own charm, Desk Dangle hangs from the MacBook notch",
      "Drishti Dangle for Indian designs and wind chimes, once it is on sale again",
      "Lucky Dangle itself remains a good choice if you want a ritual for every charm and do not mind paying",
    ],
    inShort:
      "Lucky Dangle is a polished paid app. If you want the same idea for free, with far more charms, Hangly covers it on Mac and Windows; Screen Dangle suits the opposite instinct, building the charm yourself, and Desk Dangle hangs one from the notch. All three are free, so try them before paying.",
    title: "Lucky Dangle Alternatives (2026)",
    description:
      "Free Lucky Dangle alternatives compared: Hangly, Screen Dangle, Desk Dangle, Screen Charms and more, on Mac and Windows. Prices checked October 2026.",
    h1: "Lucky Dangle Alternatives",
    summary:
      "Lucky Dangle costs $7.77 (₹777) once. The closest free alternative is Hangly: 161 charms across 21 categories against Lucky Dangle's dozen, your own images as charms, and Mac and Windows including native ARM64. Screen Dangle is also free and suits people who prefer building a charm; Desk Dangle is free and hangs from the MacBook notch. For a ritual with every charm, Lucky Dangle itself is still worth its price.",
    sections: [
      {
        heading: "What Lucky Dangle does",
        body: [
          "Lucky Dangle hangs a lucky charm from the top of your screen on Mac and Windows. Its own description: the charm sways while you work, stays out of every click, and drops in when you call it. It offers a dozen traditional charms, each with a small ritual, plus your own photo or any emoji, for $7.77 (₹777) once, or $11.11 for Extra Lucky.",
          "People generally look for an alternative for one of three reasons: they want something free, they want more charms than the curated set offers, or they want a native build for a Windows-on-ARM laptop.",
        ],
      },
      {
        heading: "What to compare on",
        body: [
          "Charm variety is the usual reason for switching, and it is the easiest thing to check: does the app publish how many charms it ships and what they are? Hangly publishes 21 named collections and a count; several competitors publish neither.",
          "Custom images are the second. Being able to hang a photo, a logo or something you drew changes the app from a set of someone else's designs into something personal. Lucky Dangle takes a photo; Hangly, Screen Dangle and Desk Dangle take any image, free.",
          "Platform reach is the third, and it is worth being specific. Several apps say Windows without saying which Windows: a machine on Snapdragon needs an ARM64 build, and an x64 build running under emulation is slower and heavier. Hangly ships a native ARM64 binary.",
        ],
      },
    ],
    entries: [HANGLY, LUCKY_DANGLE, SCREEN_DANGLE, DESK_DANGLE, SCREENCHARMS, BOOK_MY_LUCK, DANGLEJOY, DRISHTI_DANGLE, CHARMLY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "Hangly is the closest alternative with more in it, and it is free: 161 charms across 21 collections, your own images as charms, nine rope styles, and Windows including native ARM64. Screen Dangle if you would rather build a charm than choose one; Desk Dangle if you want it on the notch. Both are free too.",
          "If what you liked about Lucky Dangle is its small ritual for each charm, that is its own, and paying for it is reasonable.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Lucky Dangle alternative?",
        a: "Hangly, for most people: free where Lucky Dangle costs $7.77, with 161 charms across 21 collections, custom charms from your own images, nine rope styles, and Windows including native ARM64. Screen Dangle is the better fit if you prefer configuring a charm yourself.",
      },
      {
        q: "Is there a free Lucky Dangle alternative?",
        a: "Yes: Hangly, Screen Dangle and Desk Dangle are free on both Mac and Windows, and Screen Charms is free on Mac for a single charm.",
      },
      {
        q: "Which Lucky Dangle alternative lets me use my own images?",
        a: "Hangly, Screen Dangle and Desk Dangle turn any image into a charm for free; Screen Charms does it on PRO ($4.99). Lucky Dangle itself takes a photo.",
      },
    ],
    related: [
      { label: "Hangly vs Lucky Dangle", href: "/compare/lucky-dangle" },
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Screen Dangle Alternatives", href: "/guides/screen-dangle-alternatives" },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "screen-dangle-alternatives",
    takeaways: [
      "Hangly is the closest alternative: free, 161 charms across 21 named collections",
      "Hangly still accepts your own images, so you lose nothing by picking rather than building",
      "Drishti Dangle at \u20b999 adds Indian designs and musical wind chimes",
      "Screen Charms and Charmly are minimal Mac-only options",
      "Only Hangly publishes a native Windows ARM64 build",
    ],
    inShort:
      "Screen Dangle is a studio and Hangly is a library, which is the whole difference. If configuring a charm stopped being fun, Hangly gives you 21 finished collections and still takes your own images. Both are free.",
    title: "Screen Dangle Alternatives (2026)",
    description:
      "Alternatives to Screen Dangle — Hangly, Lucky Dangle, Charmly, Screen Charms and Drishti Dangle. Free options with ready-made charm collections.",
    h1: "Screen Dangle Alternatives",
    summary:
      "Screen Dangle is a free charm studio for Mac and Windows built around configuring your own charm. If you would rather pick from finished designs, Hangly is the closest alternative — free, 161 charms across 21 named collections, and still able to hang your own images. Drishti Dangle at ₹99 for Indian designs and wind chimes; Screen Charms or Charmly for a minimal Mac-only app.",
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
    entries: [HANGLY, DESK_DANGLE, LUCKY_DANGLE, SCREENCHARMS, BOOK_MY_LUCK, DANGLEJOY, DRISHTI_DANGLE, CHARMLY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "Hangly, if you want finished collections rather than a blank charm: twenty-one of them, 161 designs, free, on Mac and Windows including ARM64, with custom images still available when nothing fits.",
          "Desk Dangle if you want a free charm hanging from the MacBook notch. Drishti Dangle if you specifically want Indian-inspired charms and musical wind chimes, at ₹99 once it is on sale again. Screen Charms if you want a focus timer with your charm.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Screen Dangle alternative?",
        a: "Hangly, if you prefer choosing from finished collections to building a charm: free, 161 charms across 21 collections, Mac and Windows including native ARM64, and custom images still supported.",
      },
      {
        q: "Is there a Screen Dangle alternative with ready-made charms?",
        a: "Hangly ships 21 named collections — protection charms, Spirituality, Marvel, DC, BTS and others — so you can hang something in a few seconds rather than configuring it.",
      },
      {
        q: "Are there free Screen Dangle alternatives?",
        a: "Hangly and Desk Dangle are free on Mac and Windows; Screen Charms is free on Mac for a single charm.",
      },
    ],
    related: [
      { label: "Hangly vs Screen Dangle", href: "/compare/screen-dangle" },
      { label: "Lucky Dangle Alternatives", href: "/guides/lucky-dangle-alternatives" },
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "charmly-alternatives",
    takeaways: [
      "The usual reasons to leave Charmly are wanting Windows or more charms",
      "Hangly covers both: free, 161 charms, Windows including native ARM64",
      "Hangly, Screen Dangle and Desk Dangle turn your own images into charms for free",
      "Screen Charms is the closest Mac-only equivalent, free for one charm",
      "Charmly is still the right pick if you want one charm and no settings",
    ],
    inShort:
      "Charmly does one thing well and that is a real virtue. Move if you need Windows, a larger collection, or your own photo on a cord; stay if the simplicity is what you liked about it.",
    title: "Charmly Alternatives (2026)",
    description:
      "Alternatives to Charmly for Mac and Windows — Hangly, Screen Dangle, Screen Charms, Lucky Dangle and Drishti Dangle. Free options and Windows support.",
    h1: "Charmly Alternatives",
    summary:
      "Charmly hangs a good-luck charm on a cord with pendulum physics, on Mac. The main reasons to look elsewhere are wanting Windows support or a larger charm collection. Hangly covers both — free, 161 charms, Windows including native ARM64, and custom charms from your own images. Screen Charms is the closest free Mac-only equivalent.",
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
    entries: [HANGLY, SCREENCHARMS, SCREEN_DANGLE, DESK_DANGLE, LUCKY_DANGLE, CHARMLING, DRISHTI_DANGLE, BOOK_MY_LUCK, DANGLEJOY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "Hangly if you want the same idea with more in it and on both platforms: free, 161 charms across 21 collections, Windows including native ARM64, custom images, nine rope styles.",
          "Screen Charms if you want to stay on Mac with a focus timer as well. Desk Dangle if you want a free charm on the notch. Drishti Dangle at ₹99 if Indian designs and wind chimes are what you are after, once it is on sale again.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best Charmly alternative?",
        a: "Hangly, for most people: the same pendulum-physics charm on a cord, free, with 161 charms across 21 collections, custom images, and Windows support including a native ARM64 build.",
      },
      {
        q: "Is there a Charmly alternative for Windows?",
        a: "Hangly runs on Windows 10 and later, with a native ARM64 build for Windows 11 on ARM. Screen Dangle, Desk Dangle, Lucky Dangle, DangleJoy, Drishti Dangle and Book My Luck also list Windows support.",
      },
      {
        q: "Is there a free Charmly alternative for Mac?",
        a: "Hangly, Screen Dangle and Desk Dangle are free on macOS and Windows; Screen Charms is free on Mac for a single charm.",
      },
    ],
    related: [
      { label: "Hangly vs Charmly", href: "/compare/charmly" },
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Lucky Dangle Alternatives", href: "/guides/lucky-dangle-alternatives" },
    ],
    checked: CHECKED_3,
  },
  /* ── Added 9 Oct 2026: guides for demand the crawl and search suggestions showed ───── */
  {
    slug: "desktop-pets-for-windows",
    title: "Best Desktop Pets for Windows 10 and 11 (2026)",
    description:
      "Free desktop pets and companions for Windows 10 and 11 compared: Desktop Goose, Shimeji, Pets Therapy, OpenPets, VPet, Bongo Cat, and calm charms.",
    h1: "Best Desktop Pets for Windows",
    summary:
      "The best free desktop pets for Windows 10 and 11 in October 2026 are Pets Therapy for the biggest library, OpenPets if you want open source and an AI assistant, Desktop Goose if you want to be pestered on purpose, and VPet or Bongo Cat if you want a game. If you want something on your screen that never moves on its own or asks for attention, a desktop charm such as Hangly is the calmer choice.",
    takeaways: [
      "Pets Therapy: the largest pet library, free, on Windows 10 and 11, Mac and Linux",
      "OpenPets: free, open source, with plugins and an AI assistant",
      "Desktop Goose: deliberately disruptive, for fun rather than work",
      "VPet and Bongo Cat: closer to games, on Windows",
      "Hangly: not a pet but a calm charm that never interrupts, free, with a native ARM64 build",
    ],
    inShort:
      "Pick a pet for company and a charm for calm. Pets Therapy and OpenPets are the best free pets on Windows today; Desktop Goose is a joke you will enjoy for a week; Hangly is what to install if you want the desktop to feel like yours during real work.",
    sections: [
      {
        heading: "What a desktop pet is, on Windows",
        body: [
          "A desktop pet is a small animated character that lives on top of your windows: it walks along the taskbar, chases the cursor, sleeps, or does something silly. The idea is as old as Windows itself; today's versions add physics, AI assistants and custom characters.",
          "On Windows 10 and 11 most pets are free, and most ship as an ordinary installer, a Microsoft Store listing or a Steam app. Steam ones need Steam running, which is a heavier dependency than the rest.",
        ],
      },
      {
        heading: "How to choose",
        body: ["Three questions settle it."],
        list: [
          "Do you want it to interrupt you? Desktop Goose does, on purpose. Pets Therapy, OpenPets and VPet mostly do not. A charm never does.",
          "Do you want something to do? VPet and Bongo Cat are closer to games; Pets Therapy lets you feed and play; OpenPets now has an assistant.",
          "Is your PC on ARM (Snapdragon)? Look for a native ARM64 build. Hangly has one; most pets run under x64 emulation.",
        ],
      },
      {
        heading: "Pet or charm?",
        body: [
          "A charm hangs from one point at the top of the screen and sways. It has no needs and never wanders, and clicks pass straight through everywhere but the charm itself. If you have tried pets and found them distracting during work, a charm is the version that stays.",
        ],
      },
    ],
    entries: [PETS_THERAPY, OPENPETS, DESKTOP_GOOSE, SHIMEJI, VPET, BONGO_CAT, DANGLEJOY, DESK_DANGLE, HANGLY],
    closing: [
      {
        heading: "The short answer",
        body: [
          "For a free pet on Windows, start with Pets Therapy or OpenPets. For a laugh, Desktop Goose. For something you will keep during real work, a charm: Hangly is free on Windows 10 and 11, with 161 charms and a native ARM64 build.",
        ],
      },
    ],
    faqs: [
      { q: "What is the best free desktop pet for Windows 11?", a: "Pets Therapy for the largest library, and OpenPets if you want open source and an AI assistant; both are free. If you want calm decoration rather than a pet, Hangly is free on Windows 11 with a native ARM64 build." },
      { q: "Is there a desktop pet for Windows 10?", a: "Yes. Pets Therapy, OpenPets, Desktop Goose, Shimeji-ee and VPet all run on Windows 10, and so does Hangly, a desktop charm, on version 1809 and later." },
      { q: "Do desktop pets slow down Windows?", a: "Not much, but a pet that walks and animates all day costs more than one that rests. A charm that stops simulating when it hangs still costs almost nothing." },
      { q: "Should I get a desktop pet or a desktop charm on Windows?", a: "A pet if you want company that moves, reacts and sometimes interrupts; a charm if you want the screen to feel like yours without anything asking for attention. Hangly is a free charm for Windows 10 and 11." },
    ],
    related: [
      { label: "Best Desktop Pets for Mac", href: "/guides/best-desktop-pets-for-mac" },
      { label: "Desktop Goose Alternatives", href: "/guides/desktop-goose-alternatives" },
      { label: "Hangly vs OpenPets", href: "/compare/openpets" },
      { label: "Hangly for Windows", href: "/download/windows" },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "best-desktop-charm-apps-for-windows",
    title: "Best Desktop Charm Apps for Windows (2026)",
    description:
      "Desktop charm apps for Windows 10 and 11 compared: Hangly, Desk Dangle, Screen Dangle, Lucky Dangle, DangleJoy and Book My Luck. Free and paid.",
    h1: "Best Desktop Charm Apps for Windows",
    summary:
      "A desktop charm hangs a small ornament from the top of your Windows screen on a swinging cord and lets every click through. In October 2026 the free ones for Windows 10 and 11 are Hangly, Desk Dangle and Screen Dangle; Lucky Dangle ($7.77), DangleJoy ($4.99) and Book My Luck are paid once. Hangly has by far the largest free collection, 161 charms, and the only native Windows ARM64 build.",
    takeaways: [
      "Free on Windows: Hangly, Desk Dangle and Screen Dangle",
      "Paid once: Lucky Dangle ($7.77), DangleJoy ($4.99), Book My Luck (by region)",
      "Hangly has 161 charms across 21 collections and your own images",
      "Only Hangly has a native build for Windows on ARM (Snapdragon)",
      "Desk Dangle is on the Microsoft Store",
    ],
    inShort:
      "On Windows, start with a free one: Hangly for the largest collection and ARM64, Desk Dangle for the Microsoft Store and simplicity, Screen Dangle for building a charm yourself. Pay for Lucky Dangle if you want its rituals.",
    sections: [
      {
        heading: "What a desktop charm does on Windows",
        body: [
          "The charm hangs from the top edge of the screen above your windows, sways with simulated physics, and passes clicks to whatever is underneath. Its controls live in the system tray. On a laptop with Windows on ARM, a native ARM64 build matters: an x64 app runs under emulation, which costs more battery.",
          "Installers for small independent apps are often not yet code-signed, so Windows SmartScreen may show \"Windows protected your PC\" the first time. Choose More info, then Run anyway, if you trust the source. Hangly's installer is in this position today.",
        ],
      },
      {
        heading: "How to choose",
        body: ["Three questions."],
        list: [
          "Free or paid? Hangly, Desk Dangle and Screen Dangle are free; Lucky Dangle, DangleJoy and Book My Luck are one-time purchases.",
          "Your own image? Hangly, Desk Dangle, Screen Dangle and DangleJoy take one; Lucky Dangle takes a photo; Book My Luck an emoji.",
          "Windows on ARM? Only Hangly ships a native ARM64 build.",
        ],
      },
    ],
    entries: [HANGLY, DESK_DANGLE, SCREEN_DANGLE, LUCKY_DANGLE, DANGLEJOY, BOOK_MY_LUCK, DRISHTI_DANGLE],
    closing: [
      { heading: "The short answer", body: ["Hangly for the largest free collection and Windows on ARM; Desk Dangle for a free Microsoft Store install; Lucky Dangle if you will pay for a ritual with every charm."] },
    ],
    faqs: [
      { q: "Which desktop charm apps for Windows are free?", a: "Hangly, Desk Dangle and Screen Dangle are free on Windows 10 and 11 (October 2026). Hangly has the largest collection, 161 charms." },
      { q: "Can I hang an evil eye on my Windows desktop?", a: "Yes. Hangly, Desk Dangle, Lucky Dangle and Book My Luck all include a nazar (evil eye); Hangly's is free." },
      { q: "Why does Windows warn me when I install a charm app?", a: "SmartScreen warns about installers that are new or not yet code-signed. Choose More info, then Run anyway, if you downloaded it from the developer's own site." },
    ],
    related: [
      { label: "Best Desktop Charm Apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Hangly vs Desk Dangle", href: "/compare/desk-dangle" },
      { label: "Hangly for Windows", href: "/download/windows" },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "evil-eye-charm-for-your-computer",
    title: "Evil Eye (Nazar) Charm for Your Computer Screen",
    description:
      "Hang an evil eye, the nazar boncuğu, from the top of your Mac or Windows screen. What the nazar means, and the free and paid apps that do it.",
    h1: "An Evil Eye Charm for Your Computer",
    summary:
      "You can hang a nazar, the blue glass evil-eye bead, from the top of your computer screen with a desktop charm app: it sways on a cord and stays out of your clicks. Free options in October 2026 are Hangly (Mac and Windows), Desk Dangle (Mac and Windows) and Screen Charms (Mac, whose free charm is the Turkey Nazar). Lucky Dangle and Book My Luck include one in paid apps.",
    takeaways: [
      "The nazar boncuğu is a blue glass bead from Turkey and the eastern Mediterranean, worn against the evil eye",
      "Free on Mac and Windows: Hangly and Desk Dangle; free on Mac: Screen Charms",
      "Hangly also has the hamsa, nimbu-mirchi and Drishti Bommai among 161 charms",
      "Paid: Lucky Dangle ($7.77) and Book My Luck",
    ],
    inShort: "Install a free charm app, choose the nazar, and it will hang at the top of your screen all day without getting in the way.",
    sections: [
      {
        heading: "What the evil eye charm means",
        body: [
          "The nazar boncuğu, a blue glass bead with a white and dark-blue eye, is hung in homes, cars and cradles across Turkey, Greece and the wider Mediterranean and Middle East to turn back the envious look believed to bring misfortune: the evil eye. The hamsa, an open hand often with an eye in its palm, carries the same protective meaning across the Middle East and North Africa, and in India the nimbu-mirchi and the Drishti Bommai do the same work at doorways.",
          "On a computer the charm is the same idea in a new place: something protective and personal at the edge of the screen you look at all day.",
        ],
      },
      {
        heading: "How to hang a nazar on your screen",
        body: ["With Hangly, which is free:"],
        list: [
          "Download Hangly for Mac or Windows and open it.",
          "Open the Library from the menu bar (Mac) or system tray (Windows) and choose the Nazar from the Protection collection.",
          "Drag it to where it should hang along the top of the screen; it sways when you nudge it and lets every other click through.",
        ],
      },
    ],
    entries: [HANGLY, DESK_DANGLE, SCREENCHARMS, LUCKY_DANGLE, BOOK_MY_LUCK, CHARMLY, DESKCHARM],
    closing: [{ heading: "The short answer", body: ["For a free evil eye on Mac or Windows, Hangly or Desk Dangle; on a Mac only, Screen Charms' free charm is a nazar too."] }],
    faqs: [
      { q: "Is there an evil eye app for my desktop?", a: "Yes. Desktop charm apps hang a nazar from the top of the screen. Hangly and Desk Dangle are free on Mac and Windows; Screen Charms is free on Mac." },
      { q: "Can I put a nazar boncuğu on my Windows PC?", a: "Yes. Hangly runs on Windows 10 and 11 and includes the nazar in its Protection collection, free." },
      { q: "What is the difference between the nazar and the hamsa?", a: "The nazar is a blue glass eye bead, mainly Turkish and Mediterranean; the hamsa is an open hand, from the Middle East and North Africa. Both protect against the evil eye, and Hangly includes both." },
    ],
    related: [
      { label: "Luck and protection charms", href: "/charms/lucky" },
      { label: "Nimbu-mirchi and Drishti Bommai on your desktop", href: "/guides/nimbu-mirchi-drishti-bommai-on-your-desktop" },
      { label: "Best Desktop Charm Apps for Windows", href: "/guides/best-desktop-charm-apps-for-windows" },
    ],
    checked: CHECKED_3,
  },
  {
    slug: "nimbu-mirchi-drishti-bommai-on-your-desktop",
    title: "Nimbu-Mirchi and Drishti Bommai for Your Laptop Screen",
    description:
      "Hang a nimbu-mirchi or Drishti Bommai from the top of your laptop screen to ward off drishti. Free desktop charm apps for Mac and Windows.",
    h1: "Nimbu-Mirchi and Drishti Bommai on Your Desktop",
    summary:
      "The nimbu-mirchi (a lemon and seven green chillies) and the Drishti Bommai (a fierce painted guardian face) are hung at Indian doorways, shops and new buildings to ward off drishti, the evil eye. You can hang either from the top of your laptop screen with a desktop charm app. Hangly has both, free, on Mac and Windows; Desk Dangle and Lucky Dangle have a nimbu-mirchi, and Drishti Dangle is built around Indian charms.",
    takeaways: [
      "Nimbu-mirchi: a lemon and seven chillies, traditionally replaced every week",
      "Drishti Bommai: a South Indian guardian face that meets the first bad glance",
      "Hangly has both, plus Vel, Vinayagar, Om and the nazar, free",
      "Desk Dangle (free) and Lucky Dangle ($7.77, ₹777) include a nimbu-mirchi",
    ],
    inShort: "A free charm app puts a nimbu-mirchi or Drishti Bommai at the top of your screen, where it sways gently and never gets in the way of work.",
    sections: [
      {
        heading: "What they are for",
        body: [
          "Drishti, from the Sanskrit for sight, is the belief that an envious or admiring look can bring misfortune: the same idea as the evil eye. Across India, a nimbu-mirchi hangs at the entrance of homes, shops and vehicles, often renewed on a Saturday, and in South India a Drishti Bommai, a fierce, tongue-out guardian face, is hung on houses and buildings under construction to draw that first look away.",
          "Hanging one on your screen brings the same small ritual to the place you spend your working day.",
        ],
      },
      {
        heading: "How to hang one",
        body: ["With Hangly, free on Mac and Windows:"],
        list: [
          "Download and open Hangly.",
          "Open the Library and choose the Nimbu-mirchi or the Drishti Bommai from the Protection collection; Vel, Vinayagar, Om and Karuppu are in Spirituality.",
          "Place it along the top of the screen. It sways when nudged and lets clicks through.",
        ],
      },
    ],
    entries: [HANGLY, DESK_DANGLE, LUCKY_DANGLE, DRISHTI_DANGLE, DANGLEJOY, CHARMLY, DESKCHARM],
    closing: [{ heading: "The short answer", body: ["Hangly for both charms, free on Mac and Windows; Drishti Dangle if you want Indian charms with wind chimes, once it is on sale again."] }],
    faqs: [
      { q: "Can I put a nimbu-mirchi on my laptop?", a: "Yes. Desktop charm apps hang one from the top of the screen. Hangly and Desk Dangle are free on Mac and Windows; Lucky Dangle includes one for $7.77 (₹777)." },
      { q: "Is there a Drishti Bommai app for the desktop?", a: "Yes. Hangly includes the Drishti Bommai in its Protection collection, free on Mac and Windows. Lucky Dangle has one too, and DeskCharm, an open-source project, includes one." },
      { q: "Where should a Drishti Bommai be placed?", a: "Traditionally facing outward at the entrance or front of a house or building, where it meets visitors' eyes first. On a computer, the top of the screen is the natural equivalent." },
    ],
    related: [
      { label: "Evil eye charm for your computer", href: "/guides/evil-eye-charm-for-your-computer" },
      { label: "Hangly vs Drishti Dangle", href: "/compare/drishti-dangle" },
      { label: "Luck and protection charms", href: "/charms/lucky" },
    ],
    checked: CHECKED_3,
  },
];

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);
export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
