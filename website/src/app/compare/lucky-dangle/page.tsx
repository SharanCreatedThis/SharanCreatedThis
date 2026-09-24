import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("lucky-dangle");
export default function Page() {
  return <ComparisonPage slug="lucky-dangle" />;
}
