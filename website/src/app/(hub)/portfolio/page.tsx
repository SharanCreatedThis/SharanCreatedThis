import { Label, Work, ContactCTA } from "@/components/hub/Experience";
export const metadata = { title: "Selected Work — Sharan Created This" };
export default function Portfolio() {
  return (
    <>
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
