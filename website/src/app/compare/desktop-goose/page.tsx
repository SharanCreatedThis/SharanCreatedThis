import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("desktop-goose");
export default function Page() {
  return <ComparisonPage slug="desktop-goose" />;
}
