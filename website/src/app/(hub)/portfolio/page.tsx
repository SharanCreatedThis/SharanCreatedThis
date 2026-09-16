import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Portfolio | Sharan Created This",
  description: "Curated showcase of film, photography, design, and code projects.",
};

export default function PortfolioPage() {
  return (
    <div className="w-full">
      <ComingSoon
        title="Portfolio"
        subtitle="A showcase of films, photography, digital interfaces, and code projects is currently in production."
      />
    </div>
  );
}
