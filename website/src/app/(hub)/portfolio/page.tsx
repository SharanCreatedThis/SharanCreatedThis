import { pageMetadata } from "@/lib/metadata";
import { Label, Work, ContactCTA } from "@/components/hub/Experience";
import { PortfolioJsonLd } from "@/components/JsonLd";
import { Prose, ProseLinks } from "@/components/hub/Prose";
import { profile, projects } from "@/data/portfolio";
import { ID, breadcrumb, serialise } from "@/lib/schema/entities";
import { absoluteUrl } from "@/lib/seo";

export const metadata = pageMetadata("portfolio");

const URL_ = absoluteUrl("/portfolio");

/**
 * The page's own schema, alongside PortfolioJsonLd which describes each work.
 *
 * CollectionPage rather than WebPage, because that is what this is: a list of
 * creative works with a person at the centre of it. `mainEntity` points at the
 * person rather than the list, since the question an answer engine is trying
 * to settle here is who made these, not how many there are.
 */
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${URL_}#page`,
      url: URL_,
      name: "Selected work by Sharan",
      description:
        "Short films, documentary, photography, creative direction, brand campaigns and desktop software by Sharan.",
      inLanguage: "en-IN",
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.person },
      mainEntity: { "@id": ID.person },
      creator: { "@id": ID.person },
      publisher: { "@id": ID.organization },
      significantLink: [absoluteUrl("/products/hangly"), absoluteUrl("/products/vision")],
    },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Portfolio", path: "/portfolio" }], URL_),
  ],
};

export default function Portfolio() {
  const published = projects.filter((p) => p.url);
  const unreleased = projects.filter((p) => !p.url);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <PortfolioJsonLd
        works={projects.map((project) => ({
          ...project,
          // Empty strings are how unpublished work is recorded in the data;
          // the schema wants the field absent rather than blank.
          url: project.url || undefined,
          image: project.image || undefined,
        }))}
      />
      <div className="page-intro section">
        <Label>THE PORTFOLIO</Label>
        <h1>
          A point of view.
          <br />
          <span className="muted">In every frame.</span>
        </h1>
        <p>
          Films, collaborations, and stories from a multidisciplinary creative
          practice.
        </p>
        <Work filterable />
      </div>

      <Prose id="the-practice" heading="One practice, two halves">
        <p>
          This portfolio covers work that usually sits in two separate careers. One half is
          camera work — short films, documentary, photography, creative direction, brand
          campaigns, editorial series and CSR films. The other half is desktop software: two
          native applications for macOS and Windows, designed and built end to end.
        </p>
        <p>
          Keeping them together is not a presentation choice. The same instincts run through
          both. A film is an argument about what to leave out; so is an interface. Pacing decides
          whether a cut works and whether an app feels fast. And the willingness to spend a
          disproportionate amount of time on something nobody will consciously notice — the exact
          weight of a pendulum swing, the exact length of a beat before a cut — is the only thing
          that separates work that is competent from work that is felt.
        </p>
        <p>
          {published.length} of the {projects.length} pieces listed here are published and linked.
          The remaining {unreleased.length} are named without a link because they are unreleased
          or were made under an arrangement that does not permit publishing. They are listed
          rather than hidden, because a portfolio that only shows what is convenient is not a
          portfolio.
        </p>
      </Prose>

      <Prose id="film" heading="Film and videography">
        <p>
          <em>Lapse</em> is a Malayalam short film and the most complete piece of narrative work
          here. <em>Shaivi Chavann</em> is trailer work. <em>Stone Portraits</em> is documentary.
          <em> Three Heart School</em> is a CSR film, and <em>Design District</em> is creative
          direction for film.
        </p>
        <p>
          The work spans the roles that usually get divided between several people on a larger
          production — direction, cinematography, edit and colour — which is what an independent
          practice looks like in reality. That breadth is the reason the software exists at all:
          someone used to owning a whole piece end to end finds it natural to own an application
          the same way.
        </p>
      </Prose>

      <Prose id="photography" heading="Photography">
        <p>
          The photography portfolio is published on Behance as a selected gallery rather than an
          archive. Portrait work is the centre of it. Photography also feeds directly into the
          product work — every screenshot, social card and piece of artwork on this site was made
          rather than licensed, which is why the site looks like one thing rather than a template
          with stock imagery in it.
        </p>
        <ProseLinks
          links={[
            { label: "Photography portfolio on Behance", href: "https://www.behance.net/gallery/162912025/Photography-Portfolio" },
            { label: "Behance profile", href: profile.behance },
            { label: "Instagram", href: profile.instagram, note: "current work" },
          ]}
        />
      </Prose>

      <Prose id="creative-direction" heading="Creative direction and brand work">
        <p>
          Brand campaign and creative direction work includes a <em>Wallpaper*</em> collaboration
          and <em>Design District</em>. <em>Mastery S2</em> is an editorial series. The common
          requirement across this category is holding a consistent point of view across a set of
          pieces made at different times under different constraints, which is a different skill
          from making one good thing.
        </p>
      </Prose>

      <Prose id="product-development" heading="Product and app development">
        <p>
          Two desktop applications ship from this practice, both free, both self-updating, and
          both built without a team.
        </p>
        <p>
          <strong>Hangly</strong> hangs a decorative charm from the top of the screen on a cord
          with real pendulum physics. The hard parts were not the ones anyone sees: making the
          charm click-through so it can never intercept a click or take keyboard focus, shipping
          a native Windows ARM64 build when a Windows-on-ARM machine reports itself as x64,
          getting the artwork from a 89 MB compiled catalogue down to a 33 MB download by shipping
          the vectors the app actually draws from, and building a release pipeline where the
          website, the download button and the in-app updater can never disagree about what the
          current version is.
        </p>
        <p>
          <strong>Vision</strong> is face recognition for the Mac with a native notch experience,
          running entirely on the local machine. The design constraint there was privacy as
          architecture rather than as policy: if no face data is ever transmitted, there is no
          promise to break.
        </p>
        <p>
          Both are free. Neither has a paid tier, a trial or an account. That is a choice about
          what these are for rather than a pricing strategy waiting to be revised.
        </p>
        <ProseLinks
          links={[
            { label: "Hangly", href: "/products/hangly", note: "macOS and Windows, free" },
            { label: "Vision", href: "/products/vision", note: "macOS, free" },
            { label: "Both products", href: "/products" },
            { label: "Download", href: "/download" },
            { label: "Release history", href: "/changelog" },
            { label: "GitHub", href: "https://github.com/SharanCreatedThis", note: "public repositories" },
          ]}
        />
      </Prose>

      <Prose id="case-studies" heading="Two things worth reading as case studies">
        <p>
          Most of the work above is best judged by watching it. Two pieces of the software work
          are better read about, because what makes them interesting is invisible in a screenshot.
        </p>
        <p>
          <strong>Shipping for Windows on ARM.</strong> Almost nothing in Hangly&apos;s category
          publishes a native ARM64 build, and the reason is a trap rather than laziness: a
          Windows-on-ARM laptop reports <code>Win64; x64</code> in its user agent, because the
          browser itself is running under emulation. Detect the platform by reading the user agent
          and every ARM machine is sent the wrong download, silently, forever. The fix is client
          hints — asking the browser for the actual architecture — with x64 as the fallback,
          because an x64 build runs on ARM under emulation and no amount of emulation runs it the
          other way. The download page explains the whole decision.
        </p>
        <p>
          <strong>A changelog that cannot lie.</strong> The release notes on this site are not
          written by hand. They are generated at build time from the same Sparkle feeds the
          applications read to update themselves, which means a release that is not in a feed
          cannot appear on the page, and a release on the page is one the updater will offer.
          Retyping release notes into a website is how a changelog ends up quietly disagreeing
          with what users are actually being given.
        </p>
        <ProseLinks
          links={[
            { label: "The Windows download decision", href: "/download/windows" },
            { label: "The generated changelog", href: "/changelog" },
            { label: "How Hangly compares with eight competitors", href: "/compare" },
          ]}
        />
      </Prose>

      <Prose id="work-together" heading="Working together">
        <p>
          Commissions, collaborations and product builds are all open. Email is the reliable
          route, and the contact page sets out the four kinds of conversation that tend to be
          productive along with what to include so the first reply is useful rather than a
          question.
        </p>
        <ProseLinks
          links={[
            { label: "Get in touch", href: "/contact" },
            { label: "The story so far", href: "/about" },
            { label: "LinkedIn", href: profile.linkedin },
          ]}
        />
      </Prose>

      <ContactCTA />
    </>
  );
}
