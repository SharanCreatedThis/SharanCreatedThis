import { pageMetadata } from "@/lib/metadata";
import { Label, Work, ContactCTA } from "@/components/hub/Experience";
import { PortfolioJsonLd } from "@/components/JsonLd";
import { projects } from "@/data/portfolio";
export const metadata = pageMetadata("portfolio");
export default function Portfolio() {
  return (
    <>
      <PortfolioJsonLd
        works={projects.map((project) => ({
          name: project.title,
          // Unpublished work has no URL yet; listing it without one is still
          // useful, listing it with an empty one is a broken link.
          url: project.url || undefined,
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
      <ContactCTA />
    </>
  );
}
