/**
 * Best Mac customization apps.
 *
 * New on 2026-09-25. Every app was read from its own site or repository that
 * day, which is how the Bartender 7 / macOS 27 split below was caught — it is
 * a buying decision most roundups currently get wrong because they were
 * written before the version split existed.
 *
 * The organising idea is the four jobs. "Customisation" is four unrelated
 * activities sharing a word, and nearly every disappointed purchase in this
 * category is someone buying a tool for one job while wanting another.
 */

import {
  ALTTAB, BARTENDER, BETTERTOUCHTOOL, CHECKED_2, HANGLY, ICE, ISTAT_MENUS,
  MACCY, RAYCAST, RECTANGLE, RUNCAT, SKETCHYBAR, type Guide,
} from "../entries";

export const BEST_MAC_CUSTOMIZATION_APPS: Guide = {
  slug: "best-mac-customization-apps",
  title: "Best Mac Customization Apps (2026) — Free and Paid",
  description:
    "Eleven Mac customization apps across four jobs: menu bar, windows, input and appearance. What each costs, which are open source, and which pairs are redundant.",
  h1: "The best Mac customization apps",
  summary:
    "Most people need three apps, not eleven, and all three can be free. Ice organises the menu bar, Rectangle manages windows and Raycast's free tier replaces Spotlight along with a clipboard manager and a snippet tool. Pay only where a free option genuinely runs out: Bartender for menu bar automation rules, BetterTouchTool for remapping input devices, and iStat Menus for real system monitoring. Before buying Bartender, check which version your macOS takes — Bartender 7 requires macOS 27 and earlier systems need Bartender 6.",
  takeaways: [
    "Customisation is four separate jobs — menu bar, windows, input, appearance — and most people only want one or two",
    "The free stack (Ice, Rectangle, Raycast, Maccy, AltTab) covers what most people mean by customising a Mac",
    "Bartender 7 requires macOS 27; on anything earlier you are buying Bartender 6, which is a different product",
    "Raycast's paid tiers are about AI, not the launcher — the free tier is the thing people recommend",
    "SketchyBar is configured by shell script, which is either the appeal or a hard stop",
  ],
  sections: [
    {
      heading: "Customisation means four different things",
      body: [
        "Search for Mac customisation apps and you get a list that mixes a menu bar organiser, a window manager, a launcher and a wallpaper tool as though they were competing. They are not. They do not overlap, they do not replace each other, and buying one while wanting another is the single most common way people end up with a Mac full of utilities they do not use.",
        "There are four jobs. The first is organising the menu bar: hiding, ordering and revealing the icons that accumulate along the top right until they run under the notch. The second is managing windows: snapping, tiling, resizing and switching between them. The third is input and automation: remapping gestures, keys, mouse buttons and building macros. The fourth is appearance: changing how the machine looks, including the purely decorative.",
        "Almost everything below does exactly one of those. The two exceptions — Raycast and BetterTouchTool — do several, which is precisely why they are worth their place: one app replacing four is the actual win in this category, not any individual feature.",
        "Work out which job you want before reading the recommendations, because a menu bar organiser will not tile your windows and no amount of reviews will change that.",
      ],
      table: {
        caption: "Mac customization apps grouped by the job they do, with price and licence",
        columns: ["App", "Job", "Price", "Licence"],
        rows: [
          ["Ice", "Menu bar", "Free", "GPL-3.0, open source"],
          ["Bartender", "Menu bar", "Paid, 4-week trial", "Proprietary"],
          ["SketchyBar", "Menu bar replacement", "Free", "GPL-3.0, open source"],
          ["Rectangle", "Windows", "Free (Pro is paid)", "Open source"],
          ["AltTab", "Window switching", "Free", "GPL-3.0, open source"],
          ["Raycast", "Launcher, clipboard, windows", "Free tier; Pro $10/mo", "Proprietary"],
          ["BetterTouchTool", "Input and automation", "Paid, 45-day trial", "Proprietary"],
          ["Maccy", "Clipboard", "Free", "MIT, open source"],
          ["iStat Menus", "Monitoring", "Paid, 14-day trial", "Proprietary"],
          ["RunCat", "Monitoring, decorative", "Free", "Proprietary"],
          ["Hangly", "Appearance, decorative", "Free", "Proprietary"],
        ],
      },
    },
    {
      heading: "How this guide was put together",
      body: [
        "Every app here was read on " + CHECKED_2 + " from its own website or public repository. Prices are quoted only where the developer publishes them on the page. Several do not — Bartender loads its prices dynamically, iStat Menus shows placeholders, and BetterTouchTool keeps its tiers behind a separate buy page — and in those cases this guide says so rather than repeating a figure from another roundup that may be a year old.",
        "Star counts and licences come from the repositories. Minimum macOS versions come from the developer. Where a claim is the developer's own rather than something verifiable, it is attributed.",
        "This guide is published by the developer of Hangly, a decorative charm app, which appears once at the end under appearance and is not presented as competing with anything else here. Nine of the eleven apps below are things this site has no stake in at all.",
      ],
    },
    {
      heading: "The menu bar: Ice against Bartender",
      body: [
        "This is the decision most people are actually making, and in 2026 it has a wrinkle worth knowing before you spend anything.",
        "Ice is free, open source under GPL-3.0, requires macOS 14 or later, and has 29,700 stars on GitHub. It hides and shows menu bar items on hover, click or scroll; it has an always-hidden section for things you never want to see; it arranges items by drag and drop; it searches them; it customises the bar's own appearance with tint, shadow, border and custom shapes; it adjusts spacing between items; it supports profiles for different layouts and hotkeys throughout. That is not a stripped-down free alternative. That is most of the category.",
        "Bartender is the long-standing paid option, and what it adds is rules rather than features. Items can appear when a condition is met, hide on a schedule, or be summoned by hotkey and search. If you want your VPN icon to appear only when the VPN is connected, that is Bartender's job and Ice does not do it. There is a four-week unlimited trial, which is generous enough to answer the question properly.",
        "The wrinkle is the version split. Bartender 7 requires macOS 27. If you are on anything earlier, the product you are buying is Bartender 6, which is a different application with a different feature set, and the site notes that Tahoe compatibility for Bartender 7 was to ship after launch. Check which one applies to your machine before paying, because most guides currently recommending Bartender were written when there was only one.",
        "The honest recommendation: install Ice first. It is free and it takes ten minutes to know whether hide-and-reveal is all you needed. Move to Bartender only if you find yourself wanting a rule rather than a toggle.",
      ],
      table: {
        caption: "Ice compared with Bartender: the two main menu bar managers for macOS",
        columns: ["", "Ice", "Bartender"],
        rows: [
          ["Price", "Free", "Paid, prices not published on the page"],
          ["Licence", "GPL-3.0, open source", "Proprietary"],
          ["Minimum macOS", "14", "27 for Bartender 7; earlier takes Bartender 6"],
          ["Hide and reveal", "Yes, on hover, click or scroll", "Yes"],
          ["Always-hidden section", "Yes", "Yes"],
          ["Search items", "Yes", "Yes"],
          ["Conditional rules and triggers", "No", "Yes — the reason to pay"],
          ["Bar appearance (tint, shadow, shape)", "Yes", "Yes"],
          ["Layout profiles", "Yes", "Yes"],
          ["Trial", "Not needed", "4 weeks unlimited"],
        ],
      },
    },
    {
      heading: "SketchyBar, for people who would rather build it",
      body: [
        "SketchyBar is a different proposition from both. It does not organise the macOS menu bar; it replaces the status bar entirely with one you construct yourself. It is free, GPL-3.0, and has 12,400 stars.",
        "Configuration is a shell script. You start from a file called sketchybarrc and plugin scripts in ~/.config/sketchybar, and you build the bar by issuing commands. It supports event-driven updates, animations, mouse interaction and displaying items from macOS's own menu bar apps.",
        "Whether that sentence read as exciting or exhausting is the entire recommendation. People who keep dotfiles in a repository will find this the best thing on the page. People who wanted a settings window will find it unusable, and should take Ice instead. There is no middle position and it is not worth pretending otherwise.",
      ],
    },
    {
      heading: "Windows: Rectangle, AltTab, and what macOS now does itself",
      body: [
        "Window management on the Mac has changed since these tools were first recommended, because macOS 15 introduced its own tiling. Dragging a window to an edge now snaps it. That covers the common case, and it is worth trying the built-in behaviour before installing anything.",
        "It does not cover the rest. Rectangle is free, open source, and runs on macOS 10.15 and later on both Intel and Apple Silicon. It moves and resizes windows by keyboard shortcut or by dragging to a screen edge, and repeating a shortcut cycles through sizes — halves, thirds, quarters — which is the part the system tiling does not do. Rectangle Pro is the paid version with quicker snapping and custom shortcuts for arbitrary sizes and positions, and it has a ten-day trial. For most people the free version is the end of the matter.",
        "AltTab solves a different and more emotive problem: macOS switches between applications, not windows. Command-Tab brings an app forward; it does not take you to the specific window you were thinking of. AltTab adds Windows-style switching with previews of individual windows. It is free, GPL-3.0, with 16,300 stars, and it is consistently the first thing people recommend to anyone who has just moved from Windows and cannot articulate why the Mac feels wrong.",
        "These two do not overlap. Rectangle arranges windows; AltTab finds them. Installing both is normal and neither replaces the system tiling so much as finishes it.",
      ],
    },
    {
      heading: "Raycast: the app that replaces four others",
      body: [
        "Raycast is a launcher that takes over Spotlight's hotkey and does considerably more from it. The free tier includes clipboard history, quicklinks, a calculator, snippets and window management, plus access to thousands of community extensions.",
        "Read that list again in the context of this guide: clipboard history is what Maccy does, window management is part of what Rectangle does, and snippets is a category of its own. The free tier of one app covers three separate utilities. That is why Raycast appears in every roundup of this kind and why it is the single most efficient install here.",
        "The paid tiers are about artificial intelligence rather than the launcher: Pro at $10 a month, Plus at $20 and Max at $50, each adding AI chat, agents, AI commands and extensions with different monthly credit allowances. Whether that is worth it is a question about AI tools, not about Mac customisation, and nothing in the free launcher is withheld to push you there.",
        "The one caution is duplication. If you install Raycast and also Maccy and also Rectangle, you have three clipboard histories and two window managers fighting for the same shortcuts. Pick the launcher or pick the specialists, and if you pick the specialists it is usually because you want Maccy's search or Rectangle's cycling specifically.",
      ],
    },
    {
      heading: "BetterTouchTool: remapping the machine itself",
      body: [
        "BetterTouchTool is the deepest customisation tool on this list by a wide margin. It customises trackpad gestures, mouse buttons, keyboard shortcuts, menu bar items, Stream Deck and macro pads, with over six hundred built-in actions and over six hundred triggers, and it chains actions together into macros.",
        "It is paid, with a forty-five day trial that requires no account — an unusually confident trial, and long enough to find out whether you are the sort of person who will use it. Prices are not listed on the landing page.",
        "The honest assessment is that most people use perhaps a tenth of it and are still glad to have paid. A three-finger swipe that moves between desktops, a mouse button that closes a tab, a gesture that pastes as plain text: any one of those can justify it. But it is a tool that rewards investment, and if you are not going to sit down and configure it, it will sit unused while Rectangle and Ice do the jobs you actually noticed.",
      ],
    },
    {
      heading: "Clipboard and monitoring",
      body: [
        "Maccy is a clipboard manager: it keeps history and lets you search it from a hotkey. Free, MIT licensed, macOS 14 or later, 21,700 stars. Its documentation emphasises being secure and private, and notably it offers no cloud sync at all — which for a clipboard manager, the application on your machine most likely to contain a password you pasted, is a design decision rather than a missing feature.",
        "If you have already installed Raycast, you have clipboard history and Maccy is redundant. If you have not, Maccy is the better standalone.",
        "For monitoring, iStat Menus is the serious option: CPU, GPU, memory, disks, network, sensors, battery and weather as configurable menu bar items with detailed drop-downs. It is at version 7.5, needs macOS 11 or later, and has a fourteen-day trial. Its own page does not display prices, showing placeholders instead; it is also available through Setapp at USD$9.99 a month alongside 250-plus other apps, which is the route worth considering if two or three other Setapp apps appeal.",
        "RunCat sits oddly between monitoring and decoration: it animates a character in the menu bar whose running speed reflects CPU load, with variants for memory and network. It is free. It will not tell you which process is responsible, so it is not a replacement for iStat Menus — it is an ambient indicator that something is wrong, which is genuinely useful and much more pleasant to look at.",
      ],
    },
    {
      heading: "Appearance, and the part that is purely decorative",
      body: [
        "The fourth job is the one the other three guides in this category tend to skip, partly because it is hard to justify in productivity terms. It does not need justifying. A machine you look at all day is worth making pleasant, and nothing here costs performance in any way you will notice.",
        "Ice and SketchyBar both do appearance work on the bar itself — tint, shadow, border, custom shapes, spacing — so if you have installed either for organisation you already have this covered.",
        "Beyond that is decoration proper, which has no function at all. Desktop pets put an animated character on the screen. Desktop charms hang a decorative object from the top of the screen on a cord with pendulum physics, click-through so it never intercepts anything.",
        "Hangly is the charm app this site makes: free on macOS 14+ and Windows 10+ including a native ARM64 build, with seventy-five charms across eleven collections and a seasonal set and any image of your own. It is listed here for completeness in the appearance category, not as a competitor to anything else on this page — it does not organise, tile, remap or monitor anything, and it is not trying to.",
      ],
    },
    {
      heading: "What is redundant with what",
      body: [
        "The most useful thing a guide like this can tell you is which combinations waste money, because the overlaps are not obvious from the marketing.",
        "Raycast overlaps Maccy entirely on clipboard history, and overlaps Rectangle partially on window management — Raycast's window commands cover the common halves and quarters, not Rectangle's cycling. Ice and Bartender do the same job and should never both be installed. Ice and SketchyBar are incompatible in intent: one organises Apple's bar, the other replaces it. iStat Menus and RunCat both report CPU, but at completely different depths, and running both is reasonable.",
        "BetterTouchTool can technically replicate parts of Rectangle and parts of Raycast through its own actions. Doing so is a lot of configuration to avoid two free apps, and is only worth it if you were going to live in BetterTouchTool anyway.",
      ],
      list: [
        "Never both: Ice and Bartender — same job",
        "Never both: Ice and SketchyBar — one organises the bar, the other replaces it",
        "Redundant: Maccy, if you already run Raycast",
        "Partly redundant: Rectangle's basics, if you use Raycast's window commands and never cycle sizes",
        "Fine together: iStat Menus and RunCat — different depths of the same signal",
        "Fine together: Rectangle and AltTab — one arranges windows, the other finds them",
      ],
    },
    {
      heading: "Two stacks that work",
      body: [
        "For most people, the free stack is the answer and there is no second step. Ice for the menu bar, Rectangle for windows, AltTab for switching, Raycast for launching and clipboard. Four apps, nothing to pay, all but Raycast open source, and between them they cover every complaint people normally have about a stock Mac.",
        "The paid stack is worth it for a narrower group. Bartender where menu bar rules matter — check your macOS version first. BetterTouchTool where you will genuinely sit down and build gestures and macros. iStat Menus where you need to know what the machine is doing rather than that something is happening. Rectangle Pro if you have outgrown the free shortcuts.",
        "The order to install in matters more than the list. Start with the free stack, use it for a fortnight, and let the paid purchases be answers to problems you actually hit. Every one of the paid apps here has a trial of two weeks or more, which is long enough to find out honestly.",
      ],
    },
  ],
  entries: [ICE, BARTENDER, SKETCHYBAR, RECTANGLE, ALTTAB, RAYCAST, BETTERTOUCHTOOL, MACCY, ISTAT_MENUS, RUNCAT, HANGLY],
  closing: [
    {
      heading: "How to choose in one minute",
      body: [
        "If your menu bar is a mess: Ice, free. Only look at Bartender if you want an icon to appear on a condition rather than on a click, and check whether your macOS takes Bartender 7 or 6.",
        "If you are fighting your windows: Rectangle for arranging them and AltTab for switching to a specific one. Try macOS 15's own edge-snapping first — it may be enough.",
        "If you open Spotlight fifty times a day: Raycast's free tier, which also removes any reason to install a separate clipboard manager.",
        "If you want the machine itself to work differently: BetterTouchTool, and set aside an evening.",
        "If you want to know what it is doing: iStat Menus for the detail, RunCat free for the glance.",
        "If you just want it to look nicer: Ice covers the bar; a charm or a pet covers the rest, and neither does anything useful, which is fine.",
      ],
    },
  ],
  inShort:
    "Customising a Mac is four unrelated jobs and most people want one. Ice, Rectangle, AltTab and Raycast cover nearly all of it for nothing, and three of the four are open source. Pay for Bartender only if you need conditional rules, for BetterTouchTool only if you will configure it, and for iStat Menus only if a glance at RunCat is not enough. Check the Bartender version split before buying: 7 needs macOS 27, and earlier systems get Bartender 6.",
  faqs: [
    {
      q: "What is the best free Mac customization app?",
      a: "Ice, if the problem is a cluttered menu bar. It is free, open source under GPL-3.0, has 29,700 stars, and covers hiding, ordering, searching, spacing and bar appearance. Raycast's free tier is the best value overall, because it replaces a launcher, a clipboard manager and a snippets tool at once.",
    },
    {
      q: "Is Ice as good as Bartender?",
      a: "For hiding and revealing menu bar items, yes, and it is free. Bartender's advantage is conditional rules and triggers — an icon that appears only when something is connected, or hides on a schedule. If you want a toggle, Ice is enough. If you want a rule, it is not.",
    },
    {
      q: "Which version of Bartender do I need?",
      a: "Bartender 7 requires macOS 27. On anything earlier you need Bartender 6, which is a separate product. Check your macOS version before buying, because most published recommendations predate the split. There is a four-week unlimited trial either way.",
    },
    {
      q: "Do I still need Rectangle now that macOS tiles windows?",
      a: "Possibly not. macOS 15 snaps windows when you drag them to an edge, which covers the common case. Rectangle adds keyboard shortcuts and cycling through sizes — press the same shortcut again for a third instead of a half — which the system tiling does not do. Try the built-in behaviour first.",
    },
    {
      q: "Is Raycast free?",
      a: "The launcher is. The free tier includes clipboard history, quicklinks, calculator, snippets, window management and thousands of extensions. The paid tiers — Pro at $10 a month, Plus at $20, Max at $50 — add AI features and are not required to use the launcher.",
    },
    {
      q: "Do I need Maccy if I have Raycast?",
      a: "No. Raycast's free tier includes clipboard history, so Maccy would be a second copy of the same feature. Maccy is the better pick if you are not installing a launcher, and it is free and MIT licensed with no cloud sync at all.",
    },
    {
      q: "Which Mac customization apps are open source?",
      a: "Ice and SketchyBar and AltTab are GPL-3.0, Maccy is MIT, and Rectangle is open source. Bartender, Raycast, BetterTouchTool and iStat Menus are proprietary. A free stack of Ice, Rectangle, AltTab and Maccy is entirely open source.",
    },
    {
      q: "What does SketchyBar do that Ice does not?",
      a: "It replaces the status bar rather than organising it, and it is configured by shell script rather than a settings window. That means unlimited control and no graphical configuration at all. If you keep dotfiles in a repository it is the best thing here; if you wanted a preferences pane, take Ice.",
    },
    {
      q: "Is BetterTouchTool worth it?",
      a: "It is if you will spend an evening configuring it. It covers trackpad gestures, mouse buttons, keyboard shortcuts, menu bar items and Stream Deck with 600-plus actions and triggers that chain into macros. The forty-five day trial needs no account, which is long enough to find out honestly.",
    },
    {
      q: "What is the difference between iStat Menus and RunCat?",
      a: "iStat Menus reports CPU, GPU, memory, disks, network, sensors, battery and weather in detail, is paid, and needs macOS 11 or later. RunCat animates a menu bar character at the speed of your CPU and is free. RunCat tells you something is happening; iStat Menus tells you what.",
    },
    {
      q: "Can I customise how the Mac menu bar looks, not just what is in it?",
      a: "Yes. Ice adjusts tint, shadow, border, custom shapes and the spacing between items, which covers most of what people mean. SketchyBar goes further by replacing the bar entirely, at the cost of configuring it in a shell script.",
    },
    {
      q: "What is the smallest set of apps that fixes a stock Mac?",
      a: "Ice, Rectangle, AltTab and Raycast. Four apps, no cost, and they address the menu bar clutter, window arrangement, window switching and launching. Add specialist or paid tools only when you hit a limit you can name.",
    },
  ],
  related: [
    { label: "Best menu bar customisation apps for Mac", href: "/guides/best-menu-bar-customisation-apps-for-mac" },
    { label: "Best desktop pets for Mac", href: "/guides/best-desktop-pets-for-mac" },
    { label: "Every desktop charm app for Mac, compared", href: "/guides/best-desktop-charm-apps-for-mac" },
    { label: "Hangly compared with RunCat", href: "/compare/runcat" },
  ],
  checked: CHECKED_2,
};
