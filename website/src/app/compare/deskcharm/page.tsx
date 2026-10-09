import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("deskcharm");
export default function Page() {
  return <ComparisonPage slug="deskcharm" />;
}
