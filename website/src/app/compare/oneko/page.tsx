import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("oneko");
export default function Page() {
  return <ComparisonPage slug="oneko" />;
}
