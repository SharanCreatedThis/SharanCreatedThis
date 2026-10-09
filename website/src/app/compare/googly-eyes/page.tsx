import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("googly-eyes");
export default function Page() {
  return <ComparisonPage slug="googly-eyes" />;
}
