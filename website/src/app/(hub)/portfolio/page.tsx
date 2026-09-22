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
      <ContactCTA />
    </>
  );
}
