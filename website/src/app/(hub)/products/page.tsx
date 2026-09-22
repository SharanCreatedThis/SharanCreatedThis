import { pageMetadata } from "@/lib/metadata";
import {
  Label,
  ProductShowcase,
  ContactCTA,
} from "@/components/hub/Experience";
export const metadata = pageMetadata("products");
export default function Products() {
  return (
    <>
      <div className="page-intro section">
        <Label>THE PRODUCT LAB</Label>
        <h1>
          Curiosity,
          <br />
          <span className="muted">shipped.</span>
        </h1>
        <p>
          Thoughtful little experiences. Built to become part of your everyday.
        </p>
        <ProductShowcase full />
      </div>
      <ContactCTA />
    </>
  );
}
