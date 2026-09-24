import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("charmly");
export default function Page() {
  return <ComparisonPage slug="charmly" />;
}
