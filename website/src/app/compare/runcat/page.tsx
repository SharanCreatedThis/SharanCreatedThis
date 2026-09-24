import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("runcat");
export default function Page() {
  return <ComparisonPage slug="runcat" />;
}
