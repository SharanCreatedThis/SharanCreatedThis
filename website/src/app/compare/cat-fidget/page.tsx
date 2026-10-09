import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("cat-fidget");
export default function Page() {
  return <ComparisonPage slug="cat-fidget" />;
}
