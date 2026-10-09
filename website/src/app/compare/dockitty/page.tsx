import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("dockitty");
export default function Page() {
  return <ComparisonPage slug="dockitty" />;
}
