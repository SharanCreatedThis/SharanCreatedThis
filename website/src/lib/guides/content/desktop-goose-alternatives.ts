/**
 * Desktop Goose alternatives.
 *
 * Rebuilt 2026-09-25. The previous version ran to about 1,300 words and did
 * not mention the fact that turns out to matter most to the people searching
 * this: the macOS build of Desktop Goose is stalled at 0.22 against 0.31 on
 * Windows, with no mod support. A large share of "Desktop Goose alternative"
 * searches are Mac users who installed it and found it inert.
 *
 * The frame is the chaos ladder — how much interference you actually want —
 * because "alternative to Desktop Goose" means four incompatible things
 * depending on which part of the goose someone liked.
 */

import {
  BONGO_CAT, CAT_FIDGET, CHECKED_2, DESKTOP_GOOSE, DOCKITTY, DOCKLING, HANGLY,
  MAC_PET, MICROJOYZ, NOTISPRITE, ONEKO, OPENPETS, PETS_THERAPY, SHIMEJI,
  TYPIBARA, VPET, type Guide,
} from "../entries";

export const DESKTOP_GOOSE_ALTERNATIVES: Guide = {
  slug: "desktop-goose-alternatives",
  title: "Desktop Goose Alternatives (2026) — Mac and Windows",
  description:
    "Twelve Desktop Goose alternatives, sorted by how much they interfere with your work — and why the macOS build is stalled at 0.22 with no mod support.",
  h1: "Desktop Goose alternatives",
  summary:
    "The right alternative depends on how much of the chaos you want to keep. For the same mischief, Shimeji is the closest — characters that roam and grab your windows, with the largest community library in the category. For company without sabotage, Pets Therapy is free with over a hundred pets across Mac, Windows and Linux. For something present that literally cannot interrupt you, a desktop charm hangs from the top of the screen and is click-through. Mac users should know that Desktop Goose's own macOS build is stalled at 0.22 against 0.31 on Windows and has no mod support at all.",
  takeaways: [
    "Desktop Goose's Mac build is at 0.22 while Windows is at 0.31, and mods do not work on macOS",
    "Decide how much interference you want first — that single question picks your replacement",
    "Closest in spirit: Shimeji, which roams and manipulates windows, with a huge character library",
    "Company without chaos: Pets Therapy, free, 100+ pets, and the only true Mac/Windows/Linux option",
    "Zero interruption: a desktop charm, which is click-through and never takes focus",
  ],
  sections: [
    {
      heading: "Why people look for an alternative",
      body: [
        "Desktop Goose is a practical joke that runs on your computer. It drags mud across the screen, steals the cursor, delivers memes and notes, and attacks if you poke it. It is pay-what-you-want, and the developer is explicit that it is unaffiliated with the video game everybody assumes it references. Its config file lets you turn the aggression up or down.",
        "People go looking for something else for four distinct reasons, and they need four different answers. Some want the same chaos from a different character. Some loved having something alive on screen but cannot afford the interruptions any more — usually because they started sharing their screen for work. Some are on a Mac and found the experience much thinner than the videos promised. And some simply want the mods, which is a specific problem with a specific answer.",
        "Sorting the alternatives by feature misses all of this. Sorted by how much they interfere with you, the choice makes itself.",
      ],
    },
    {
      heading: "The Mac problem nobody mentions",
      body: [
        "If you are on a Mac, read this before anything else. Desktop Goose's Windows release is at version 0.31. The macOS build is at 0.22, targets macOS 10.10 and later, and does not support mods. The developer's own note on the download page reads: 'Mac doesn't support mods yet. Wait for 2023 :)'.",
        "That note is still there, and 2023 was three years ago. The practical effect is that a Mac user installing Desktop Goose today gets an older build, without the mod ecosystem that most of the enthusiasm online is actually about — the custom characters, the alternative behaviours, the community packs. The videos people watch before installing are almost always Windows.",
        "So a large share of Mac users searching for a Desktop Goose alternative are not dissatisfied with the concept. They installed it, found it thinner than advertised, and assumed the app was the problem. It is worth knowing that the concept is fine and the Mac build is simply behind, because it changes what you should install next: if you want mods and chaos on a Mac, Shimeji is the answer, not a different goose.",
      ],
    },
    {
      heading: "The chaos ladder",
      body: [
        "Every alternative below sits somewhere on a single scale: how much is it willing to interfere with what you are doing? This is the only axis that matters, and it is the one product pages never state.",
        "At the top is deliberate sabotage — apps that take your cursor, move your windows and cover your work on purpose. Below that is uninvited presence: characters that roam freely and will end up in front of something, not maliciously but inevitably. Below that is contained presence: a character fixed to the menu bar, Dock or notch, always visible and never in the way. At the bottom is non-interfering decoration: something on screen that is physically incapable of intercepting a click or taking focus.",
        "Work out which rung you want and the list below collapses to two or three candidates. Almost everyone searching for this is trying to move down exactly one rung from where Desktop Goose sits.",
      ],
      table: {
        caption: "Desktop Goose alternatives ranked by how much they interfere with your work",
        columns: ["App", "Interference", "Platforms", "Price"],
        rows: [
          ["Desktop Goose", "Deliberate sabotage", "Windows 0.31; macOS 0.22, no mods", "Pay what you want"],
          ["Shimeji", "Roams, grabs windows", "Browser extension; legacy desktop builds", "Free"],
          ["VPet Simulator", "Roams, game mechanics", "Windows; Linux via Wine", "Free, open source"],
          ["Pets Therapy", "Roams freely", "macOS, Windows, Linux", "Free, supporters tier"],
          ["MicroJoyz", "Roams, reminders, mini-games", "macOS", "Not published"],
          ["OpenPets", "Roams freely", "Windows, macOS, Linux", "Free, open source"],
          ["NotiSprite", "Edge of screen, notifies you", "macOS", "Free, 5 of 22 sprites"],
          ["Bongo Cat", "Reacts to keystrokes only", "Windows, macOS via Steam", "Free, paid cosmetics"],
          ["Mac Pet", "Menu bar or notch only", "macOS 10.15+", "$9.99"],
          ["Dockling", "Dock, menu bar or notch", "macOS", "$2.99"],
          ["Cat Fidget", "Menu bar only", "macOS", "Not published"],
          ["Dockitty", "Dock, occasional desktop", "macOS", "Not published"],
          ["Hangly", "None — click-through", "macOS 14+, Windows 10+", "Free"],
        ],
      },
    },
    {
      heading: "If you want to keep the chaos: Shimeji",
      body: [
        "Shimeji is the closest thing to Desktop Goose in spirit and the clear answer for anyone who liked the interference. Characters walk across your screen, climb the edges of windows, hang off them and drag them about. It predates Desktop Goose by a decade and has by far the largest community character library in the category — thousands of characters, still growing.",
        "There are two forms and the difference matters. The original Java desktop builds interact with real application windows, which is the full experience and is awkward to run on modern macOS. The browser extension is what most people use now: it works on any platform with no installation friction, but the characters are confined to web pages. They will climb your browser tabs and not your Finder windows.",
        "For a Mac user who wanted Desktop Goose's mods, Shimeji's extension is the pragmatic swap. You get an enormous character library today, working properly, at the cost of the characters staying inside the browser. Adding your own character requires a sprite sheet rather than a single image, which is a real piece of work but is also the reason the library is so large.",
        "VPet Simulator is worth naming here too: open source, well liked, and built around game mechanics — feeding, levelling up, virtual currency. It is Windows with Linux through Wine and has no native macOS build, so on a Mac it is not an option regardless of its merits.",
      ],
    },
    {
      heading: "If you want the company without the sabotage",
      body: [
        "This is the largest group of people searching for this, and Pets Therapy is the answer for most of them.",
        "It is free on the Mac App Store, has over a hundred pets — cats with sixteen-plus colour variants, dinosaurs, apes, dogs, pandas, koalas, sloths, frogs, crows, betta fish — and thirty-seven of them are free permanently rather than on trial. You can feed them, give them toys, and they talk to each other. Crucially for anyone coming from Desktop Goose, it runs natively on macOS, Windows and Linux, which nothing else here manages.",
        "These pets roam. They are on the second rung, not the fourth: a character will occasionally wander over the paragraph you are reading. What they will not do is take your cursor, cover your screen in mud or fight you for focus. That is the trade most ex-goose users are looking to make.",
        "MicroJoyz is the alternative if you want more happening — throwable pets, reminders, social features and mini-games, on macOS. It is busier by design, and busier is the opposite direction from where most people leaving Desktop Goose are heading. OpenPets is the pick if being able to read and modify the source matters more than the size of the library.",
      ],
    },
    {
      heading: "If you want it contained: menu bar and Dock pets",
      body: [
        "One rung further down, the pet stops roaming entirely and lives in a fixed place. This is the group that survives long-term use, and it is where people end up after the novelty of a roamer wears off.",
        "Mac Pet is a pixel pet in the menu bar or the MacBook notch at $9.99, with a Pomodoro timer, activity streaks and a five-week history drawn as a contribution graph. The pet walks during focus sessions and sleeps during breaks. The developer claims under 1% CPU.",
        "Dockling is $2.99 and generates the pet from a photo you give it, so the character is yours. It sits in the Dock, menu bar or notch with timers, streaks and quick notes.",
        "Cat Fidget puts a cat in the menu bar that you can pet, feed, drag and fling, and its site states no account, no ads, no analytics and no tracking — the clearest privacy position in this whole category. One correction, since it has spread through other roundups: Cat Fidget is at highroadsoftware.com. The domain tryfidget.com is an unrelated recruitment platform.",
        "Dockitty is a pixel cat in the Dock that occasionally explores the desktop, deliberately small in scope. NotiSprite is at the edge of this group — twenty-two hand-drawn characters, five free and fully featured, that deliver break reminders, weather, calendar alerts and a focus timer. If Desktop Goose's notes and memes were the part you liked, NotiSprite is the closest legitimate version of that idea.",
        "Bongo Cat belongs here too, as a reactor rather than a resident: it drums along with your keystrokes, is free with paid cosmetics, and runs on Windows and macOS through Steam. It is idle when you are, which is restful or dull depending on what you wanted, and the Steam dependency is heavier than anything else on this page.",
      ],
    },
    {
      heading: "If it must never interrupt you at all",
      body: [
        "There is a rung below every pet, and a specific group of people who need it: anyone who screen-shares for a living. Teachers, consultants, support staff, anyone who records or presents. For them, every option above is disqualified, because a character that can appear in front of a window will eventually do it during a client call.",
        "Desktop charms solve this structurally rather than by being well behaved. A charm hangs from a fixed point at the top of the screen and sways on a cord with real pendulum physics. It is click-through, so clicks pass straight through to whatever is underneath, and it never takes keyboard focus. It cannot cover your work, because it does not move across it. It cannot intercept anything, because interception is not physically available to it.",
        "Hangly is the charm app this site makes: free on macOS 14+ and Windows 10+ including a native Windows ARM64 build, with over eighty charms across eleven collections and any image of your own as a charm. Screen Charms and Charmly are Mac-only alternatives in the same category, and Screen Dangle is free on both platforms if you would rather build a charm than pick one.",
        "This needs saying plainly: if what you loved about Desktop Goose was the chaos, a charm will bore you, and you should take Shimeji instead. A charm is the right answer only when the requirement has genuinely changed from wanting company to needing something that cannot interfere. Those are different wants, and pretending one product serves both would waste your time.",
      ],
    },
    {
      heading: "What about the mods?",
      body: [
        "Mods are the single most common specific reason people search for a Desktop Goose alternative, and it is worth answering directly.",
        "On Windows, Desktop Goose's own mod ecosystem is the largest for that app and there is no reason to leave it. On macOS, mods do not work at all, and the developer note promising them has not moved since 2022.",
        "The largest modifiable character library in this whole space is Shimeji's, which is enormous and platform-independent in its extension form. Adding a character means preparing a sprite sheet — a grid of frames — which is meaningfully more work than dropping in one image, but it is the reason the library reached the size it did.",
        "If you want custom characters with the least effort, the pragmatic answers are elsewhere: Dockling generates a pet from a single photo for $2.99, Pets Therapy supports custom pets, and charm apps such as Hangly take any single image and hang it on a cord. None of those are mods in the Desktop Goose sense. They are the shortest route to seeing something of your own on screen.",
      ],
    },
    {
      heading: "Safety, permissions and screen sharing",
      body: [
        "An app that grabs your cursor and moves your windows needs real system access to do it. On macOS that means Accessibility permission, and it is worth being deliberate about granting it.",
        "The rule of thumb is proportionality. An app that only draws a sprite on screen needs no special permission at all. An app that interacts with your windows needs Accessibility. An app that reads what is on screen needs Screen Recording. If something in the first category asks for permissions from the third, that is worth a second look.",
        "The screen-sharing point applies to everything above the bottom rung. macOS shares the whole display, so a roaming character appears in the call. Residents in the menu bar are usually fine and are visible if you share the full screen. Charms are click-through but still visible — invisible to clicks is not the same as invisible to a camera.",
        "The practical answer for people who present regularly is to pick something on the lower rungs and not rely on remembering to quit it. Anything you have to remember to turn off will eventually be on.",
      ],
    },
  ],
  entries: [
    DESKTOP_GOOSE, SHIMEJI, PETS_THERAPY, MICROJOYZ, OPENPETS, VPET, NOTISPRITE,
    BONGO_CAT, MAC_PET, DOCKLING, CAT_FIDGET, DOCKITTY, TYPIBARA, ONEKO, HANGLY,
  ],
  closing: [
    {
      heading: "How to choose in one minute",
      body: [
        "Keep the chaos: Shimeji. The extension if you want it working today, the desktop builds if you insist on real window interaction.",
        "Keep the company, lose the sabotage: Pets Therapy, free, over a hundred pets, and the only genuine Mac, Windows and Linux option.",
        "Keep it contained: Mac Pet at $9.99 or Dockling at $2.99 if you want a timer with it, Cat Fidget or Dockitty if you want it to do nothing.",
        "Keep the notes and reminders: NotiSprite, free for five of its twenty-two characters.",
        "Lose the interruption entirely: a desktop charm — click-through, never takes focus, safe during a screen share.",
        "And if you are on a Mac and had not realised the goose was running an old build without mods, try Shimeji before concluding the whole category is not for you.",
      ],
    },
    {
      heading: "What has changed since the last update",
      body: [
        "Rewritten on " + CHECKED_2 + " after re-reading every product. Six apps were added: Pets Therapy, Mac Pet, NotiSprite, Bongo Cat, VPet Simulator and Dockitty.",
        "The material new finding is the Desktop Goose version gap — 0.22 on macOS against 0.31 on Windows, with no mod support and a developer note that has not been updated since 2022. That is the most useful single fact for the Mac users who make up much of this search, and it was absent from the previous version of this guide.",
        "The Cat Fidget link was corrected to highroadsoftware.com. Several published roundups point at tryfidget.com, which is an unrelated recruitment platform.",
      ],
    },
  ],
  inShort:
    "Pick by how much interference you still want. Shimeji keeps the mischief and has the biggest character library; Pets Therapy keeps the company and is free across all three desktop platforms; the menu bar pets keep it contained; a desktop charm removes interruption as a possibility. Mac users should know the goose they installed is a 0.22 build with no mod support, which is usually the real reason it disappointed.",
  faqs: [
    {
      q: "What is the closest alternative to Desktop Goose?",
      a: "Shimeji. Characters roam your screen, climb window edges and drag windows about, which is the same category of behaviour, and its community character library is the largest in the space. The browser extension works everywhere but confines characters to web pages; the legacy desktop builds interact with real windows.",
    },
    {
      q: "Why is Desktop Goose worse on Mac?",
      a: "The macOS build is at version 0.22 while Windows is at 0.31, it targets macOS 10.10 and up, and it has no mod support. The developer's note on the download page still says Mac mod support should be waited for in 2023. Mac users are running an older build without the mod ecosystem most of the online enthusiasm is about.",
    },
    {
      q: "Is there a Desktop Goose alternative that does not interrupt me?",
      a: "Yes, but it is a different category. Desktop charms hang from the top of the screen on a cord, sway with pendulum physics, are click-through and never take keyboard focus, so they cannot cover a window or intercept a click. Hangly is free on macOS 14+ and Windows 10+. If the interference was the appeal, this will disappoint you.",
    },
    {
      q: "What is the best free Desktop Goose alternative?",
      a: "Pets Therapy — free on the Mac App Store, over a hundred pets with thirty-seven free permanently, and the only option here running natively on macOS, Windows and Linux. Shimeji is also free and is the closer match if you want the chaos rather than the company.",
    },
    {
      q: "Can I use Desktop Goose mods on macOS?",
      a: "No. Mod support has never shipped for the Mac build. For custom characters on a Mac, Shimeji's library is the largest option, Dockling generates a pet from one photo for $2.99, and charm apps such as Hangly accept any single image.",
    },
    {
      q: "Are there Desktop Goose alternatives safe for screen sharing?",
      a: "Menu bar and Dock pets such as Mac Pet, Cat Fidget, Dockitty and Dockling stay in one place and never cover a window. Desktop charms are safest, since they are click-through and never take focus. Anything that roams — Pets Therapy, MicroJoyz, Shimeji, Desktop Goose — will appear over whatever you are presenting.",
    },
    {
      q: "Which Desktop Goose alternatives are open source?",
      a: "OpenPets and VPet Simulator. OpenPets has a native macOS build; VPet is Windows with Linux through Wine. Shimeji's original builds are free under a BSD-style arrangement, and Oneko, the X11 cat the category descends from, is public domain.",
    },
    {
      q: "Is there something like Desktop Goose that helps rather than hinders?",
      a: "NotiSprite is the closest inversion: hand-drawn characters that deliver break reminders, sleep reminders, weather, calendar alerts and a focus timer, free for five of its twenty-two sprites. Mac Pet and Dockling attach a Pomodoro timer to a menu bar pet for $9.99 and $2.99.",
    },
    {
      q: "Does Desktop Goose slow down your computer?",
      a: "It animates continuously and interacts with your windows, so it costs more than a static ornament, though on modern hardware it is not the practical problem — the interruptions are. Apps that react to an event rather than animating constantly, such as Bongo Cat, cost the least.",
    },
    {
      q: "What permissions should a desktop pet need?",
      a: "Judge by proportionality. An app that only draws a sprite needs no special permission. One that moves or interacts with your windows needs Accessibility on macOS. One that reads the screen needs Screen Recording. An app that only draws something but asks for Screen Recording is worth a second look.",
    },
    {
      q: "Is Bongo Cat a good Desktop Goose alternative?",
      a: "Only if what you wanted was reactivity rather than mischief. It drums along with your keystrokes, is free with paid cosmetics, and runs on Windows and macOS — but through Steam, which must be installed and running. It never interferes with anything.",
    },
    {
      q: "I want something on screen but I present all day. What should I install?",
      a: "A desktop charm, which is click-through and cannot take focus, or a menu bar pet such as Cat Fidget or Mac Pet that never leaves its fixed position. Avoid anything that roams — not because it misbehaves, but because it will eventually be in front of your slides and you will not be able to stop it in the moment.",
    },
  ],
  related: [
    { label: "Best desktop pets for Mac", href: "/guides/best-desktop-pets-for-mac" },
    { label: "Best Mac customization apps", href: "/guides/best-mac-customization-apps" },
    { label: "Every desktop charm app for Mac, compared", href: "/guides/best-desktop-charm-apps-for-mac" },
    { label: "Hangly compared with Desktop Goose", href: "/compare/desktop-goose" },
    { label: "Hangly compared with Shimeji", href: "/compare/shimeji" },
  ],
  checked: CHECKED_2,
};
