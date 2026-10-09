import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("openpets");
export default function Page() {
  return <ComparisonPage slug="openpets" />;
}
