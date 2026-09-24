import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("dockling");
export default function Page() {
  return <ComparisonPage slug="dockling" />;
}
