/**
 * The questions people actually ask about Hangly, and honest answers.
 *
 * This exists because of a measured gap. Of seventeen competitors crawled,
 * four ship `FAQPage` schema — Desk Dangle, Book My Luck, OpenPets and its
 * Oneko alternatives page — and Hangly shipped none. An answer engine asked
 * "what is the best desktop charm app" reaches for pages that have already
 * stated an answer in a form it can lift. A product page that only describes
 * itself in prose is not that.
 *
 * Two rules these follow, because breaking either is worse than having no FAQ:
 *
 * 1. **Every answer is visible on the page.** Google will not show an FAQ rich
 *    result for schema that has no on-page counterpart, and marking up answers
 *    a visitor cannot read is a guidelines violation, not a shortcut.
 * 2. **Nothing is claimed that is not true.** Hangly's Windows build is a
 *    pre-release at 0.9.x and several collections are unfinished. Saying
 *    otherwise would win a query and lose the person who acted on it.
 *
 * Grouped so the page can render sections; `ALL_FAQS` flattens them for schema.
 */

export type Faq = { q: string; a: string };
export type FaqGroup = { id: string; heading: string; faqs: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "basics",
    heading: "The basics",
    faqs: [
      {
        q: "What is Hangly?",
        a: "Hangly is a free desktop app for macOS and Windows that hangs a small decorative charm from the top of your screen. The charm swings on a cord with real pendulum physics, responds when you nudge it, and stays out of the way of everything you click. It runs from the menu bar on Mac and the system tray on Windows.",
      },
      {
        q: "Is Hangly free?",
        a: "Yes, completely. There is no paid tier, no subscription, no trial that expires and no advertising. If you want to support it there is a Buy Creator a Coffee option inside the app, and it is entirely optional.",
      },
      {
        q: "What is a desktop charm?",
        a: "A desktop charm is a small ornament that hangs on your screen the way a charm hangs from a rear-view mirror or a doorway. Unlike a desktop pet, it does not wander, demand feeding or interrupt you — it simply hangs there and sways. The appeal is closer to a keepsake than to a game.",
      },
      {
        q: "What platforms does Hangly support?",
        a: "macOS 14 Sonoma and later on both Apple Silicon and Intel, and Windows 10 and later on both x64 and ARM64. The website detects which build your machine needs and offers that one, with the other two a click away.",
      },
      {
        q: "Does Hangly work on Windows?",
        a: "Yes, with an honest caveat: the Windows build is at 0.9.x and published as a pre-release while it settles. It installs and runs, and it updates itself. The macOS build is at 2.0 and is the mature one.",
      },
      {
        q: "Does Hangly work on Windows ARM?",
        a: "Yes. There is a native ARM64 build for Snapdragon and other ARM machines, alongside the x64 one. The site works out which you need from browser client hints rather than the user agent string, because a Windows-on-ARM machine reports itself as x64 when the browser runs under emulation.",
      },
      {
        q: "Does Hangly need an account?",
        a: "No. There is no sign-up, no login and no email address to hand over. Download it and it runs.",
      },
      {
        q: "How large is the download?",
        a: "The macOS disk image is about 33 MB. The Windows installers are around 130 MB, because they bundle their runtime.",
      },
    ],
  },
  {
    id: "using",
    heading: "Using it",
    faqs: [
      {
        q: "Does Hangly get in the way of my work?",
        a: "No. The charm sits above your windows but ignores clicks — anything you click goes to the window underneath. It occupies a strip at the top of the screen that most applications leave empty.",
      },
      {
        q: "Can I move the charm?",
        a: "Yes. Drag it anywhere along the top of the screen, and grab the charm itself to swing it. Let go and the physics takes over: it swings, slows and settles the way a real pendulum does.",
      },
      {
        q: "How many charms are there?",
        a: "Thirty or so across eleven collections, including protection charms like the Nazar and Drishti Bommai, Tamil Divine symbols, Marvel and DC emblems, BTS, Stranger Things, Friends, Breaking Bad, football and a dream catcher. Six of those collections are still being finished.",
      },
      {
        q: "Can I use my own image as a charm?",
        a: "Yes. Turn any image into a charm and hang it — a photo, a logo, something you drew. That is the feature most people keep.",
      },
      {
        q: "Can I change the cord?",
        a: "Yes. Golden thread, silver chain or a neon glow, and the charm's size is adjustable too.",
      },
      {
        q: "Can I hang more than one charm at a time?",
        a: "Yes. Hang several and arrange them along the top of the screen.",
      },
      {
        q: "Does Hangly work with multiple monitors?",
        a: "Yes, and you choose which display a charm hangs from.",
      },
      {
        q: "Does Hangly work in full-screen apps?",
        a: "On macOS, a full-screen app takes over its own Space, so the charm is not visible while you are in one. It returns when you leave. This is a macOS behaviour rather than a Hangly setting.",
      },
      {
        q: "Does Hangly start automatically when I log in?",
        a: "It can, and the setting is in the app. It is off until you turn it on.",
      },
      {
        q: "How do I quit Hangly?",
        a: "Use the menu bar icon on macOS or the system tray icon on Windows, and choose Quit.",
      },
    ],
  },
  {
    id: "performance",
    heading: "Performance and safety",
    faqs: [
      {
        q: "Does Hangly slow down my computer?",
        a: "It is built to be light: a small animation on an otherwise idle strip of screen. The physics simulation stops when the charm is at rest rather than running a loop forever, which is the part that usually costs battery in apps like this.",
      },
      {
        q: "Does Hangly drain battery?",
        a: "Not noticeably. Rendering pauses when nothing is moving, so a charm hanging still costs almost nothing.",
      },
      {
        q: "Is Hangly safe to install?",
        a: "The macOS build is signed and notarised by Apple, which means Apple has scanned it for malware and Gatekeeper will open it without warnings. The Windows installers are published through GitHub Releases.",
      },
      {
        q: "Why does Windows SmartScreen warn about Hangly?",
        a: "The Windows build does not yet carry an Extended Validation code-signing certificate, so SmartScreen shows its unrecognised-app warning until enough people have installed it. Choose More info, then Run anyway. This will stop once the build is signed.",
      },
      {
        q: "Does Hangly collect my data?",
        a: "Almost nothing, and what it does collect is described in full on the privacy page. Nothing about what is on your screen, in your files or in other applications is ever read or sent.",
      },
      {
        q: "Does Hangly need screen recording permission?",
        a: "No. It draws its own window; it never reads what is on your screen.",
      },
      {
        q: "Is Hangly open source?",
        a: "The Windows build is published openly on GitHub, where the releases and their notes are public. The application source is not currently open.",
      },
      {
        q: "How does Hangly update itself?",
        a: "The Mac version updates through Sparkle and the Windows version through Velopack, both of which check for new versions and install them in place. You are told what changed before anything is applied.",
      },
    ],
  },
  {
    id: "comparisons",
    heading: "How it compares",
    faqs: [
      {
        q: "What is the best desktop charm app?",
        a: "For a charm that hangs and swings rather than wanders, Hangly is the most complete free option: it is the only one in this category shipping on macOS and Windows including ARM64, with custom charms from your own images, over thirty designs, adjustable cords, and no paid tier. Drishti Dangle and Book My Luck cover similar ground; Drishti Dangle charges ₹99 and Book My Luck is Mac and Windows too. Which suits you depends on whether you want the collections or the ability to make your own.",
      },
      {
        q: "What is the difference between a desktop charm and a desktop pet?",
        a: "A desktop pet — Desktop Goose, Shimeji, Oneko, a Dockling — moves around your screen, reacts to you and sometimes interrupts deliberately. A desktop charm stays where you hang it. If you want company, take a pet. If you want something that makes the screen feel yours without ever demanding attention, take a charm.",
      },
      {
        q: "Is Hangly a good Desktop Goose alternative?",
        a: "Only if what you liked about Desktop Goose was the presence rather than the chaos. Desktop Goose actively interferes with your work, which is the joke. Hangly is the opposite: it cannot be clicked, never takes focus and never interrupts. Same instinct, opposite behaviour.",
      },
      {
        q: "Is Hangly a Shimeji alternative?",
        a: "Partly. Shimeji characters climb windows and drag them about; Hangly's charms hang from a fixed point. Both let you bring your own artwork. Choose Shimeji for an animated character that roams, Hangly for an ornament that stays put — and note that Shimeji is largely a browser extension now, while Hangly is a native desktop app.",
      },
      {
        q: "Is Hangly a RunCat alternative?",
        a: "They solve different problems. RunCat animates a menu bar icon at a speed set by your CPU load, so it is a system monitor that happens to be charming. Hangly is decoration with no monitoring function. Plenty of people run both.",
      },
      {
        q: "How is Hangly different from Lucky Dangle?",
        a: "Both hang a charm from the top of the screen on Mac and Windows. Hangly adds custom charms made from your own images, eleven themed collections, three cord styles and adjustable sizing, and it is free.",
      },
      {
        q: "How is Hangly different from Screen Dangle?",
        a: "Screen Dangle is also free and also covers Mac and Windows. Hangly's difference is the collections — Marvel, DC, BTS, Tamil Divine, protection charms — and turning your own images into charms. Screen Dangle leans towards a customisation studio; Hangly towards a library you pick from.",
      },
      {
        q: "How is Hangly different from Drishti Dangle?",
        a: "Drishti Dangle focuses on Indian-inspired charms and musical wind chimes and costs ₹99. Hangly includes Indian charms — Nazar, Drishti Bommai, Vel, Vinayagar, Om, temple bell — alongside ten other collections, and is free.",
      },
      {
        q: "How is Hangly different from Dockling?",
        a: "Dockling generates a pixel pet from a photo and gives it Pomodoro timers, streaks and notes for $2.99. It is a productivity companion. Hangly hangs a charm and adds nothing to your workflow, deliberately.",
      },
      {
        q: "How is Hangly different from Charmly?",
        a: "Charmly hangs a good-luck charm on a cord with pendulum physics, on Mac. Hangly does the same and adds Windows including ARM64, custom charms from your images, and eleven collections.",
      },
      {
        q: "Is there a free desktop charm app for Windows?",
        a: "Yes — Hangly is free on Windows, including a native ARM64 build. Most apps in this category are Mac-only or charge for the Windows version.",
      },
      {
        q: "What is the best free Mac desktop decoration app?",
        a: "It depends what you want on screen. For an ornament that hangs and sways, Hangly. For a pet that wanders, MicroJoyz or Cat Fidget. For a CPU-driven menu bar animation, RunCat. Hangly is the free option in the first category with the widest collection and custom artwork.",
      },
    ],
  },
  {
    id: "trouble",
    heading: "If something goes wrong",
    faqs: [
      {
        q: "The charm is not visible. What should I check?",
        a: "Three things: that Hangly is running, which the menu bar or tray icon tells you; that you are not inside a full-screen app, where macOS hides it; and which display it is set to hang from if you use more than one.",
      },
      {
        q: "The charm is in the way of my menu bar. Can I move it?",
        a: "Yes — drag it sideways along the top of the screen to any position you prefer.",
      },
      {
        q: "Hangly will not open on my Mac. What now?",
        a: "The app is notarised, so this is unusual. Right-click the app and choose Open, which offers to open it anyway. If it persists, download it again from the site rather than a mirror.",
      },
      {
        q: "How do I uninstall Hangly?",
        a: "On macOS, quit it and move the app to the Trash. On Windows, use Add or Remove Programs.",
      },
      {
        q: "Which Hangly version am I running?",
        a: "The About screen inside the app shows the version. macOS is currently at 2.0 and Windows at 0.9.x.",
      },
      {
        q: "How do I report a bug or ask for a charm?",
        a: "Message @sharan.created.this on Instagram, which is linked from inside the app and from the website. Windows issues can also go on the Hangly-Windows repository on GitHub.",
      },
      {
        q: "Will there be more charms?",
        a: "Yes. Six collections are partly finished — football, Stranger Things, singers, Breaking Bad, Friends and the dream catcher — and more are planned. Requests are welcome.",
      },
      {
        q: "Does Hangly work offline?",
        a: "Yes. Everything runs locally. The only time it reaches the network is to check whether a newer version exists, and you can decline the update.",
      },
      {
        q: "Can I pin a charm to a specific corner of the screen?",
        a: "You can drag it anywhere along the top edge and it stays where you leave it, across restarts.",
      },
      {
        q: "Does Hangly support dark mode?",
        a: "The charms are artwork rather than interface, so they look the same either way. The app's own settings windows follow your system appearance.",
      },
      {
        q: "Is there an iPhone or iPad version?",
        a: "No. Hangly is a desktop app, and the idea depends on having a screen edge to hang from and a pointer to nudge with. There are no plans for a mobile version.",
      },
      {
        q: "Who makes Hangly?",
        a: "Sharan, an independent designer, filmmaker and developer working from India. It is not a company product; it is one person's.",
      },
    ],
  },
];

/** Flattened, for the FAQPage schema and for counting. */
export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.faqs);
