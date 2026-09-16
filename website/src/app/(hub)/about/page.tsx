import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "About | Sharan Created This",
  description: "Learn more about Sharan - Filmmaker, Photographer, Designer, Developer.",
};

export default function AboutPage() {
  return (
    <div className="w-full">
      <ComingSoon
        title="About"
        subtitle="Background story, design philosophy, and technical tools will be published here soon."
      />
    </div>
  );
}
