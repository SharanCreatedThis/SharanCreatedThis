import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("shimeji");
export default function Page() {
  return <ComparisonPage slug="shimeji" />;
}
