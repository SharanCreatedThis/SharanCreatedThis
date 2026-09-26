import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRight } from "lucide-react";
import { Label } from "@/components/hub/Experience";
import { Prose, ProseFaq, ProseLinks } from "@/components/hub/Prose";
import { profile } from "@/data/portfolio";
import { ID, breadcrumb, faqNode, serialise } from "@/lib/schema/entities";
import { absoluteUrl } from "@/lib/seo";

export const metadata = pageMetadata("contact");

const URL_ = absoluteUrl("/contact");

const FAQS = [
  {
    q: "What kind of work does Sharan take on?",
    a: "Films and documentaries, photography, creative direction, brand campaigns and editorial work, alongside designing and building desktop software. The two halves are not separate practices — the same eye for pacing and detail goes into a cut and into an interface.",
  },
  {
    q: "What should I include when reporting a Hangly bug?",
    a: "Your macOS or Windows version, which build you installed, and what you expected to happen. If it involves a charm, name the charm. Screenshots help more than descriptions for anything visual. Pricing and platform questions are answered on the Hangly FAQ.",
  },
  {
    q: "Is Vision free?",
    a: "Yes. Vision is a free Mac app requiring macOS 15 or newer. All face recognition happens on your own machine and nothing is uploaded.",
  },
  {
    q: "How quickly do you reply?",
    a: "Email is the reliable route and is read daily. Instagram and LinkedIn messages are seen less often. For a bug report in Hangly or Vision, email gets it to the person who can actually fix it.",
  },
  {
    q: "Where are you based?",
    a: "India, working with people anywhere. Remote collaboration is normal for the software work and common for the creative work.",
  },
  {
    q: "Can I report a bug or request a feature?",
    a: "Please do. Email is the best route for both. Bug reports are more useful with your macOS or Windows version and, where the charm or the camera is involved, a description of what you expected to happen.",
  },
  {
    q: "Do you take on collaborations rather than commissions?",
    a: "Yes. Some of the work listed on the portfolio came from a conversation rather than a brief. If you have an idea that needs a second set of hands rather than a supplier, that is worth an email.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${URL_}#page`,
      url: URL_,
      name: "Contact Sharan",
      description:
        "Get in touch about a film, a photography shoot, a product build, or a bug in Hangly or Vision.",
      inLanguage: "en-IN",
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.person },
      mainEntity: { "@id": ID.person },
      significantLink: [absoluteUrl("/products/hangly"), absoluteUrl("/products/vision"), absoluteUrl("/portfolio")],
    },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }], URL_),
    faqNode(FAQS, URL_),
  ],
};

export default function Contact() {
  const links = [
    { label: "Email", href: profile.email ? `mailto:${profile.email}` : "" },
    { label: "Instagram", href: profile.instagram },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "Behance", href: profile.behance },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <section className="page-intro section contact-page">
        <Label>GOOD THINGS START WITH A CONVERSATION</Label>
        <h1>
          Let’s build
          <br />
          something worth
          <br />
          <span className="red">remembering.</span>
        </h1>
        <div className="contact-layout">
          <div>
            <p>
              A story to tell? A product to build?
              <br />
              An idea you can’t stop thinking about?
            </p>
            <p>Tell me about it.</p>
            <a className="button button-red" href={`mailto:${profile.email}`}>
              Start a conversation <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="contact-links">
            {links.map((l, i) =>
              l.href ? (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.label === "Email" ? undefined : "_blank"}
                  rel="noreferrer"
                >
                  <span>0{i + 1}</span>
                  <h2>{l.label}</h2>
                  <ArrowUpRight />
                </a>
              ) : (
                <div key={l.label} className="pending-contact">
                  <span>0{i + 1}</span>
                  <h2>{l.label}</h2>
                  <small>Coming soon</small>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <Prose id="about-sharan" heading="About Sharan">
        <p>
          Sharan is a creative technologist based in India, working across two disciplines that
          most people keep apart: making films and photographs, and designing and building
          software. The portfolio side covers short films, documentary, photography, creative
          direction, brand campaigns, CSR work and editorial series. The software side is two
          desktop apps, Hangly and Vision, both written for macOS and both free.
        </p>
        <p>
          The through line is attention to how something feels rather than only what it does. A
          cut that lands and an interface that feels right are the same problem approached from
          different ends — timing, restraint, and a willingness to spend a disproportionate amount
          of effort on a detail nobody will consciously notice.
        </p>
        <p>
          That is also why the apps look the way they do. Hangly exists because a screen you stare
          at for nine hours is better with something small and pleasant on it, and for no other
          reason. There is no business model behind it.
        </p>
      </Prose>

      <Prose id="what-i-build" heading="What I build">
        <p>
          The work divides into two practices that feed each other, and it is worth being specific
          about both so you know whether a conversation is worth starting.
        </p>
        <p>
          <strong>Film and photography.</strong> Short films including <em>Lapse</em>, a Malayalam
          short, and trailer work. Documentary. Photography, with a selected portfolio published
          on Behance. Creative direction and brand campaign work, editorial series, and CSR films.
          The categories are listed on the portfolio with the published work linked where it
          exists — some of it is unreleased and is named without a link rather than hidden.
        </p>
        <p>
          <strong>Desktop software.</strong> Native Mac and Windows applications, designed and
          built end to end: the idea, the interface, the code, the artwork, the site and the
          release pipeline. Both shipping products update themselves — Hangly through Sparkle on
          macOS and Velopack on Windows, Vision through Sparkle — which is a small detail that
          takes a surprising amount of infrastructure and is the difference between a hobby
          project and something people can rely on.
        </p>
      </Prose>

      <Prose id="what-is-hangly" heading="What Hangly is">
        <p>
          Hangly hangs a decorative charm from the top of your screen on a cord, where it sways
          with real pendulum physics. It is click-through, so it never intercepts a click, and it
          never takes keyboard focus — which means it is safe during a meeting, a demo or a screen
          share, unlike a desktop pet that roams.
        </p>
        <p>
          It ships eighty-one charms across fourteen collections, takes any image of your own as a
          charm, offers several cord styles and adjustable sizing, and supports up to three charms
          at once. It is free on macOS 14 or newer and Windows 10 or newer,
          including a native Windows ARM64 build — which almost nothing else in its category
          offers. The macOS build is at 2.0 and is the mature one; Windows is at 0.9.x and is
          published as a pre-release.
        </p>
        <ProseLinks
          links={[
            { label: "Hangly product page", href: "/products/hangly" },
            { label: "Download Hangly", href: "/download", note: "Mac, Windows x64 and ARM64" },
            { label: "How to install it", href: "/install" },
            { label: "Frequently asked questions", href: "/faq" },
            { label: "How it compares", href: "/compare", note: "eight honest comparisons" },
          ]}
        />
      </Prose>

      <Prose id="what-is-vision" heading="What Vision is">
        <p>
          Vision is face recognition for the Mac with a native notch experience: you look at your
          machine and it recognises you. Everything happens locally. No face data is uploaded, no
          account is required, and nothing about the recognition depends on a server being
          reachable.
        </p>
        <p>
          It needs macOS 15 or newer, is currently at version 1.1, and is free. It is the smaller
          and quieter of the two products, and the documentation covers how it works, what the Mac
          requirements are, and the privacy and security position in more detail.
        </p>
        <ProseLinks
          links={[
            { label: "Vision product page", href: "/products/vision" },
            { label: "Vision documentation", href: "/products/vision/docs" },
            { label: "Release history for both apps", href: "/changelog" },
          ]}
        />
      </Prose>

      <Prose id="collaboration" heading="Working together">
        <p>
          There are four kinds of conversation that tend to be productive, and it helps to say
          which one you are starting.
        </p>
        <ul>
          <li>
            <strong>A commission.</strong> A film, a documentary, a campaign, a shoot, or a
            product build with a defined scope. Email with what it is, roughly when, and roughly
            what it is worth to you — the last part saves everyone a round trip.
          </li>
          <li>
            <strong>A collaboration.</strong> An idea that needs a second person rather than a
            supplier. Some of the portfolio started this way.
          </li>
          <li>
            <strong>Software.</strong> A bug, a feature request, or a question about Hangly or
            Vision. Email reaches the person who wrote it, which is the whole advantage of an
            independent app.
          </li>
          <li>
            <strong>Press and writing.</strong> If you are covering either app, everything
            published on this site is quotable, and the statistics and changelog pages carry
            specifications rather than marketing copy.
          </li>
        </ul>
        <p>
          Email is the reliable route and is read daily. Instagram, LinkedIn and Behance are all
          live and all checked less often.
        </p>
      </Prose>

      <ProseFaq id="contact-faq" faqs={FAQS} />

      <Prose id="contact-elsewhere" heading="Elsewhere on this site">
        <ProseLinks
          links={[
            { label: "Selected work", href: "/portfolio", note: "films, photography, creative direction" },
            { label: "Both products", href: "/products" },
            { label: "The story so far", href: "/about" },
            { label: "GitHub", href: "https://github.com/SharanCreatedThis", note: "open repositories" },
          ]}
        />
      </Prose>

      <div className="contact-signoff">
        MADE OF CURIOSITY. <span>BASED IN INDIA. CREATING EVERYWHERE.</span>
      </div>
    </>
  );
}
