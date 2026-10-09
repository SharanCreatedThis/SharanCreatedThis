import { ComparisonPage, comparisonMetadata } from "@/lib/comparisons";

export const metadata = comparisonMetadata("book-my-luck");
export default function Page() {
  return <ComparisonPage slug="book-my-luck" />;
}
