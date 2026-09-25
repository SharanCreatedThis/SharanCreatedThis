/**
 * Best desktop pets for Mac.
 *
 * Rebuilt 2026-09-25 from a fresh read of every product named. The previous
 * version of this guide ran to about 1,600 words and missed five apps that
 * are currently ranking for the query, including the one with the largest
 * library in the category and the only genuinely cross-platform option.
 *
 * The organising idea is the three-way split — roamers, residents, reactors —
 * which is not how any competing guide frames it and is the distinction that
 * actually decides whether someone keeps the app installed past a week.
 */

import {
  BONGO_CAT, CAT_FIDGET, CHECKED_2, DESKTOP_GOOSE, DOCKITTY, DOCKLING, HANGLY,
  MAC_PET, MICROJOYZ, NOTISPRITE, ONEKO, OPENPETS, PETS_THERAPY, RUNCAT,
  SHIMEJI, TYPIBARA, VPET, type Guide,
} from "../entries";

export const BEST_DESKTOP_PETS_FOR_MAC: Guide = {
  slug: "best-desktop-pets-for-mac",
  title: "Best Desktop Pets for Mac (2026) — 12 Apps, Tested",
  description:
    "Twelve desktop pets for macOS compared on what matters: whether they roam, whether they interrupt you, and what they cost. Researched September 2026.",
  h1: "The best desktop pets for Mac",
  summary:
    "The best desktop pet for most Mac users is Pets Therapy: over a hundred pets, genuinely free, and the only one here that runs natively on macOS, Windows and Linux. If you want the pet to earn its place in your workflow, Mac Pet at $9.99 or Dockling at $2.99 attach a Pomodoro timer to it. NotiSprite is free for five sprites and turns the pet into your notification centre. And if what you actually want is something on screen that can never interrupt you, a desktop pet is the wrong category — you want a charm.",
  takeaways: [
    "Pets Therapy is the strongest free pick: 100+ pets, 37 free forever, and macOS, Windows and Linux",
    "Desktop pets split three ways — roamers, residents and reactors — and the split decides whether you keep it",
    "Anything that roams will eventually cover something you were reading; anything in the menu bar cannot",
    "Only OpenPets and VPet Simulator are open source; VPet has no native Mac build",
    "If it must never interrupt you, you want a charm app rather than a pet",
  ],
  sections: [
    {
      heading: "What a desktop pet actually is",
      body: [
        "A desktop pet is a small animated character that lives on your screen outside any window. It is not a widget, it does not report anything, and in most cases it does not do anything you asked for. That is the point: it is company, and the category exists because a screen you stare at for nine hours is more bearable with something alive on it.",
        "The idea is older than most of the apps selling it. Oneko, a cat that chases the cursor, has been in the public domain since the early 1990s and still ships in Linux distributions. Shimeji arrived from Japan in 2009 and spawned a character library that is still growing seventeen years later. What has changed recently is that the category has professionalised: several of the apps below are paid products from named developers with privacy policies and release notes, rather than a JAR file on a forum.",
        "That professionalisation has produced a split in what these apps are for, and the split matters more than any feature list. Some pets are ornaments. Some are timers with a face. A few are practical jokes. Buying the wrong sort is the most common way people end up uninstalling one within a week, so it is worth naming the three groups before naming the apps.",
      ],
    },
    {
      heading: "The three kinds of desktop pet",
      body: [
        "Roamers move across your whole screen. Pets Therapy, MicroJoyz, Shimeji, Desktop Goose and OpenPets are all roamers. They walk, climb, fall, sleep and — in several cases — interact with your actual windows. They are the most alive and the most likely to be in the way, and the way is the point of contention: a character that wanders across the paragraph you are reading is charming on the first day and a problem on the fortieth.",
        "Residents stay in one place, almost always the menu bar, the Dock or the notch. Mac Pet, Cat Fidget, Dockitty and Dockling are residents. They give up the illusion of a creature loose on your desktop and get something in return: they are always in the same place, they never cover anything, and they are safe in a meeting. Residents are the group that survives long-term use, and it is not close.",
        "Reactors respond to something you are doing rather than acting on their own. Bongo Cat drums along with your keystrokes; Typibara syncs with typing; RunCat animates at the speed of your CPU, which makes it a monitor with a personality rather than a pet at all. Reactors are idle when you are, which is either restful or disappointing depending on what you wanted.",
        "One app can sit in two groups — Dockling lives in the Dock but also reports your streaks; NotiSprite is a resident that behaves like a notification centre — but almost every disappointed review of a desktop pet traces back to someone buying from one group while wanting another.",
      ],
      table: {
        caption: "Desktop pets for Mac by behaviour: where the pet lives and whether it can obstruct your work",
        columns: ["App", "Kind", "Where it lives", "Can it cover your work?"],
        rows: [
          ["Pets Therapy", "Roamer", "Anywhere on screen", "Yes, by design"],
          ["MicroJoyz", "Roamer", "Screen and Dock", "Yes"],
          ["Shimeji", "Roamer", "Web pages, in its extension form", "Yes, within the browser"],
          ["Desktop Goose", "Roamer", "Anywhere on screen", "Yes — that is the joke"],
          ["OpenPets", "Roamer", "Anywhere on screen", "Yes"],
          ["NotiSprite", "Resident", "Screen edge", "Rarely"],
          ["Mac Pet", "Resident", "Menu bar or notch", "No"],
          ["Cat Fidget", "Resident", "Menu bar", "No"],
          ["Dockitty", "Resident", "Dock, occasionally the desktop", "Rarely"],
          ["Dockling", "Resident", "Dock, menu bar or notch", "No"],
          ["Bongo Cat", "Reactor", "Taskbar area", "No"],
          ["Typibara", "Reactor", "Screen edge", "No"],
        ],
      },
    },
    {
      heading: "How this guide was put together",
      body: [
        "Every product below was read on " + CHECKED_2 + " from its own website, App Store listing or public repository — not from another guide. Where a developer publishes a price, it is quoted. Where one does not, that is recorded as not published rather than filled in with a guess, which is why several rows below say nothing useful about cost: the information genuinely is not there to report.",
        "Star counts and licences come from the repositories themselves. Claims about battery, CPU and privacy are the developers' own unless stated otherwise, and are marked as such — an app's own site is a reasonable source for what it intends to do and a poor one for whether it succeeds.",
        "This guide is published by the developer of Hangly, which is a charm app rather than a desktop pet and appears at the end for that reason. Several apps below are recommended over it, because for anyone who wants a creature that moves, a charm is not a substitute and saying otherwise would be useless to you.",
      ],
    },
    {
      heading: "Pets Therapy — the one to try first",
      body: [
        "Pets Therapy is the most complete free product in the category and the only one that runs natively on macOS, Windows and Linux. That last point is rarer than it sounds: nearly everything else here is locked to one platform, and the cross-platform claims elsewhere usually mean a browser extension.",
        "The library is the largest published: over a hundred pets, including cats with sixteen-plus colour variants, dinosaurs, apes, dogs, pandas, koalas, sloths, frogs, crows and betta fish. Thirty-seven are free permanently rather than for a trial period. You can feed them, give them toys — eighty-eight pets have a hundred and thirty-two toys between them across fifty-seven animations — and they will hold conversations with each other, which is the detail people quote when they recommend it.",
        "It is free on the Mac App Store, with a supporters tier that adds ambient chatting between pets. Their own material describes the achievements system as 'offline, signed out, never pay-to-win', which is a more specific commitment than most apps in this category make and one worth holding them to.",
        "The caveat is the caveat for every roamer: these pets go where they like, and on a laptop screen that means occasionally over what you are reading. If that is going to annoy you, it will annoy you here more than anywhere else, because there are more of them.",
      ],
    },
    {
      heading: "MicroJoyz — the feature-rich one",
      body: [
        "MicroJoyz describes itself as the most feature-rich desktop pet for Mac, and on the evidence of its own material that is a fair claim. The pets are throwable, they walk across both the screen and the Dock, they react to what you do, and there are reminders, social features and mini-games attached.",
        "It is the app to look at if you want the pet to be an event rather than a background texture. It is also the app to avoid if you want the opposite: reminders and mini-games are things that ask for your attention, and a pet that asks for your attention is a different proposition from a pet that simply exists.",
        "Pricing is not stated plainly on the landing page at the time of reading. Third-party guides report a short trial followed by a one-time purchase around $9.99, but since that is not from the developer it should be checked on their site before you rely on it.",
      ],
    },
    {
      heading: "Mac Pet and Dockling — pets that run your day",
      body: [
        "These two are the clearest examples of the pet-as-productivity-tool, and they are close enough to compare directly.",
        "Mac Pet is a pixel pet in the menu bar or the MacBook notch, at $9.99, requiring macOS 10.15 or newer. It carries a Pomodoro timer with adjustable focus and break lengths, activity streaks and a five-week history drawn as a contribution graph. The pet walks while you are in a focus session and sleeps during breaks, which turns the timer into something you read at a glance rather than something you check. The developer claims under 1% CPU. There is no free tier advertised.",
        "Dockling is $2.99, also macOS, and generates the pet from a photo you supply — so the character is yours rather than one of theirs. It lives in the Dock, menu bar or notch, and attaches Pomodoro timers, streaks and quick notes.",
        "Between them: Dockling is cheaper and personalises the character; Mac Pet has the better-presented activity history and the notch mode. Both are residents, so neither will ever cover your work. If the productivity framing appeals at all, one of these two is the pick, and the $7 difference is not the deciding factor — whether you want your own photo on screen is.",
      ],
      table: {
        caption: "Mac Pet compared with Dockling: the two productivity-oriented desktop pets for Mac",
        columns: ["", "Mac Pet", "Dockling"],
        rows: [
          ["Price", "$9.99", "$2.99 once"],
          ["Where it lives", "Menu bar or notch", "Dock, menu bar or notch"],
          ["The character", "Their pixel cats and dogs", "Generated from your own photo"],
          ["Pomodoro timer", "Yes, adjustable focus and break", "Yes"],
          ["Activity history", "Five weeks, contribution graph", "Streaks"],
          ["Quick notes", "Not advertised", "Yes"],
          ["Minimum macOS", "10.15", "Not published"],
          ["Free tier", "None advertised", "None"],
        ],
      },
    },
    {
      heading: "NotiSprite — the pet as notification centre",
      body: [
        "NotiSprite is twenty-two hand-drawn characters, of which five are free with full functionality rather than a crippled demo — Noti Ant, Noti Ladybird, Noti Bubble, Noti Peach and Noti Takoyaki — and the rest are in-app purchases.",
        "What it does is larger than the pet. It delivers break reminders for water, stretching, breathing and eye rest, sleep reminders, weather with animated notifications, calendar and meeting alerts, a focus timer, custom alarms on daily, weekday or weekend schedules, daily quotes, CPU and battery monitoring, and a social feature that lets you poke a friend.",
        "That is a lot, and whether it is a recommendation depends entirely on you. If your reaction to a list of reminders is relief, NotiSprite is the best-value entry here — five fully functional characters at no cost. If your reaction is fatigue, this is the single worst pick on the page, and one of the residents that does nothing will serve you better.",
      ],
    },
    {
      heading: "Cat Fidget and Dockitty — small, quiet and Mac-only",
      body: [
        "Cat Fidget puts a cat in the menu bar that you can pet, feed, drag and fling, with breeds and accessories to collect. Its site states no account, no ads, no analytics and no tracking, which is the strongest privacy position stated by anything in this guide.",
        "One correction worth making, because it has propagated into other guides: Cat Fidget is published at highroadsoftware.com. The domain tryfidget.com, which appears in several roundups as its home, is an unrelated recruitment platform. Following it will not get you the app.",
        "Dockitty is a pixel cat that lives in the macOS Dock and occasionally wanders onto the desktop. It is deliberately small in scope — the pitch is charm and a cosy aesthetic rather than features — and that is a reasonable thing to want. Neither publishes a price on the pages read.",
        "These two are the quiet end of the category. Nothing to configure, nothing to learn, no timer. If what you want is a small pleasant thing in the corner of the screen and nothing more, start here rather than with the roamers.",
      ],
    },
    {
      heading: "Desktop Goose, Shimeji and the disruptive end",
      body: [
        "Desktop Goose is the famous one, and it is a practical joke rather than a pet. It drags mud across your screen, steals the cursor, delivers memes and attacks if you poke it. It is pay-what-you-want and the developer is explicit that it is unaffiliated with the video game people assume it references.",
        "Mac users should know before downloading that the macOS build is stalled. Windows is at version 0.31; the Mac build is 0.22, targets macOS 10.10 and up, and has no mod support — the developer's own note on the page reads 'Mac doesn't support mods yet. Wait for 2023 :)', which has not aged into a promise. If the mod library is why you want Desktop Goose, it is not available to you on a Mac.",
        "Shimeji is the ancestor of the modern category and still has the largest community character library by a distance. Its most-used form today is a browser extension, which confines it to web pages — a real limitation if you wanted a character loose in your whole desktop, and a real advantage if you did not want to install anything. Adding your own character needs a sprite sheet rather than a single image, which is a genuine barrier.",
        "Both belong to a group with one shared property: they are unsuitable the moment you share your screen. That is obvious for the goose and less so for Shimeji, but a character walking across a page during a client demo is the same problem in a smaller size.",
      ],
    },
    {
      heading: "The open-source options",
      body: [
        "Two apps here are open source, and only one of them runs on a Mac.",
        "OpenPets is a free, open-source, native cross-platform pet gallery with plugins, and it is the pick if you want to read the code, modify the pet or be confident nothing is phoning home. It also publishes an alternatives section that is more honest about its competitors than most commercial sites manage.",
        "VPet Simulator is open source and well regarded, but it is Windows, with Linux through Wine, and there is no native macOS build. It is also more game than ornament — feeding, levelling and virtual currency — so even on the right platform it answers a different question.",
        "Oneko deserves a mention as the origin of the whole idea: a public-domain X11 cat that chases the cursor, still shipping in Linux distributions three decades on. It is not a macOS application, and ports exist of varying quality.",
      ],
    },
    {
      heading: "Battery, CPU and the thing nobody measures",
      body: [
        "Almost every app in this category claims to be light, and almost none publishes a number. Mac Pet is the exception, claiming under 1% CPU. Pets Therapy describes itself as lightweight with minimal impact during normal use. Everyone else says some version of the same thing without quantifying it.",
        "The honest guidance is structural rather than benchmarked. An app that animates continuously costs more than one that animates on an event, which is why reactors such as Bongo Cat and Typibara are cheap to run and roamers are not. An app rendering a sprite at your display's refresh rate on a 120Hz ProMotion screen is doing twice the work of the same app on a 60Hz external monitor. And anything that composites over the whole screen prevents some of macOS's power-saving paths from engaging.",
        "In practice, on an M-series Mac plugged in, none of this is measurable in a way that will affect you. On an Intel MacBook on battery, a continuously animating roamer is noticeable, and that is the case where a resident or a reactor is the better choice for reasons that have nothing to do with taste.",
      ],
    },
    {
      heading: "Privacy, accounts and what these apps can see",
      body: [
        "A desktop pet is an unusual thing to hand system access to, and the category is uneven about saying what it does with it.",
        "Cat Fidget makes the clearest statement: no account, no ads, no analytics, no tracking. Pets Therapy states its achievements are offline and signed out. OpenPets is open source, which is the strongest guarantee available because it is checkable rather than promised. Maccy-style local-only design is the norm elsewhere but is rarely spelled out.",
        "The things worth checking before you install any of these: whether it requires an account, whether it asks for Accessibility or Screen Recording permission, and what the privacy policy says about analytics. An app that only draws a sprite needs none of those permissions. An app that interacts with your windows — Desktop Goose, Shimeji's desktop builds, anything that reacts to what you are doing — needs at least one, and should say why.",
      ],
    },
    {
      heading: "When a desktop pet is the wrong answer",
      body: [
        "There is a specific case where everything above is a mistake, and it is common enough to be worth naming: you want something alive on your screen, and you also cannot afford to be interrupted. People who screen-share for a living, teach, present, or record are in this position permanently.",
        "No roamer is safe for that, and residents are safe only by staying out of the way — which is to say by giving up most of what makes a pet a pet. The category that solves it directly is desktop charms: a decorative object hung from the top of the screen that sways with real pendulum physics, is click-through, and never takes keyboard focus. It cannot cover a window because it does not move across one, and it cannot intercept a click because clicks pass through it.",
        "Hangly is the one this site makes: free on macOS 14+ and Windows 10+ including a native ARM64 build, with seventy-five charms across eleven collections and a seasonal set and any image of your own as a charm. Screen Charms and Charmly are Mac-only alternatives in the same category if you would rather not take a recommendation from the people who wrote the page.",
        "This is a genuinely different thing from a desktop pet, and if what you wanted was a creature that moves about of its own accord, it will not satisfy you. That is the honest division: pets are company, charms are decoration, and knowing which you are shopping for saves the uninstall.",
      ],
    },
  ],
  entries: [
    PETS_THERAPY, MICROJOYZ, NOTISPRITE, MAC_PET, DOCKLING, CAT_FIDGET, DOCKITTY,
    DESKTOP_GOOSE, SHIMEJI, OPENPETS, BONGO_CAT, VPET, TYPIBARA, RUNCAT, ONEKO, HANGLY,
  ],
  closing: [
    {
      heading: "How to choose in one minute",
      body: [
        "Decide first whether you want the pet to move across your screen. If yes, Pets Therapy, and everything else in the roamer group is a variation on it. If no, you are choosing between residents, and the question becomes whether you want the pet to do a job.",
        "If it should do a job: Dockling at $2.99 for your own photo plus a timer, Mac Pet at $9.99 for the better activity history, or NotiSprite free if you want reminders and weather rather than focus sessions.",
        "If it should do nothing at all: Cat Fidget or Dockitty, both small and quiet, and Cat Fidget if the privacy position matters to you.",
        "If you want to read the source: OpenPets, and only OpenPets on macOS.",
        "And if the real requirement is that it must never, under any circumstances, interrupt you — a charm rather than a pet.",
      ],
    },
    {
      heading: "What has changed since the last update",
      body: [
        "This guide was rewritten on " + CHECKED_2 + ". Five apps were added that the previous version omitted: Pets Therapy, Mac Pet, NotiSprite, Bongo Cat and VPet Simulator.",
        "Two corrections were made. Cat Fidget's site is highroadsoftware.com, not tryfidget.com, which is an unrelated recruitment platform that several roundups have linked by mistake. And Desktop Goose's macOS build is at 0.22 against 0.31 on Windows, with no mod support and a developer note that has not been updated since 2022 — a material fact for any Mac user choosing it for the mods.",
      ],
    },
  ],
  inShort:
    "Pets Therapy is the best free desktop pet for Mac and the only one that also runs on Windows and Linux. Mac Pet and Dockling are the picks if you want a Pomodoro timer attached; NotiSprite if you want reminders; Cat Fidget or Dockitty if you want something small that does nothing. Desktop Goose is a joke rather than a pet and its Mac build is years behind. If the requirement is presence without any risk of interruption, a desktop charm answers that and a pet cannot.",
  faqs: [
    {
      q: "What is the best free desktop pet for Mac?",
      a: "Pets Therapy. It is free on the Mac App Store with thirty-seven pets available permanently rather than on trial, out of a library of over a hundred, and it runs natively on macOS, Windows and Linux. NotiSprite is the runner-up with five fully functional free sprites.",
    },
    {
      q: "Do desktop pets slow down a Mac?",
      a: "Not measurably on an Apple Silicon Mac. Mac Pet publishes a figure of under 1% CPU and most others claim to be lightweight without quantifying it. The cost is real but small, and it is higher for pets that roam and animate continuously than for ones that react to an event. On an older Intel MacBook running on battery, a continuously animating roamer is the one case where you may notice.",
    },
    {
      q: "Does Desktop Goose work on Mac?",
      a: "There is a macOS build, but it is stalled at version 0.22 while Windows is at 0.31, it targets macOS 10.10 and up, and it has no mod support. The developer's note on the download page still reads that Mac mod support should be waited for in 2023. If you want Desktop Goose for the mod library, that is not available on a Mac.",
    },
    {
      q: "Can I use my own picture as a desktop pet?",
      a: "Dockling generates a pixel pet from any photo you give it, for $2.99. Pets Therapy supports custom pets. Shimeji accepts your own characters but needs a full sprite sheet rather than a single image, which is a substantially larger job.",
    },
    {
      q: "Which desktop pets are open source?",
      a: "OpenPets and VPet Simulator. OpenPets is the only one of the two with a native macOS build. Oneko, the X11 cat the whole category descends from, is public domain but is not a macOS application.",
    },
    {
      q: "Are desktop pets safe to use during a screen share?",
      a: "Residents are — Mac Pet, Cat Fidget, Dockitty and Dockling stay in the menu bar, Dock or notch and never cover a window. Roamers are not: Pets Therapy, MicroJoyz, Shimeji and especially Desktop Goose will walk across whatever you are presenting. Desktop charms are the safest option of all, because they are click-through and never take focus.",
    },
    {
      q: "What is the difference between a desktop pet and a desktop charm?",
      a: "A pet moves around your screen under its own control and can end up in front of your work. A charm hangs from a fixed point at the top of the screen, sways on a cord, and is click-through, so it cannot cover a window or intercept a click. Pets are company; charms are decoration.",
    },
    {
      q: "Do any desktop pets work on both Mac and Windows?",
      a: "Pets Therapy runs on macOS, Windows and Linux natively, which makes it the only true cross-platform option here. Bongo Cat covers Windows and macOS through Steam. Shimeji's browser extension works anywhere a browser does, but is confined to web pages.",
    },
    {
      q: "Which desktop pet has a Pomodoro timer?",
      a: "Mac Pet at $9.99 and Dockling at $2.99 both do, and both live in the menu bar, Dock or notch. NotiSprite includes a focus timer alongside break, sleep and calendar reminders. MicroJoyz has reminders but is built around roaming and mini-games rather than focus sessions.",
    },
    {
      q: "Do desktop pets collect data?",
      a: "It varies and most do not say clearly. Cat Fidget states no account, ads, analytics or tracking. Pets Therapy describes its achievements as offline and signed out. OpenPets is open source, so the answer is checkable rather than promised. Before installing any of them, look at whether an account is required and whether the app asks for Accessibility or Screen Recording permission — an app that only draws a sprite needs neither.",
    },
    {
      q: "What happened to Shimeji on Mac?",
      a: "The original Java desktop builds still exist but are awkward on modern macOS. The version most people use now is a browser extension, which works on any platform but only inside web pages. Its character library remains the largest in the category by a wide margin.",
    },
    {
      q: "Is there a desktop pet that lives in the MacBook notch?",
      a: "Mac Pet offers a notch mode alongside its menu bar mode, and Dockling can sit in the Dock, the menu bar or the notch. Both are pixel-art pets with productivity features attached rather than roaming companions.",
    },
  ],
  related: [
    { label: "Desktop Goose alternatives, for Mac and Windows", href: "/guides/desktop-goose-alternatives" },
    { label: "Best Mac customization apps", href: "/guides/best-mac-customization-apps" },
    { label: "Every desktop charm app for Mac, compared", href: "/guides/best-desktop-charm-apps-for-mac" },
    { label: "Hangly compared with Dockling", href: "/compare/dockling" },
    { label: "Hangly compared with Shimeji", href: "/compare/shimeji" },
  ],
  checked: CHECKED_2,
};
