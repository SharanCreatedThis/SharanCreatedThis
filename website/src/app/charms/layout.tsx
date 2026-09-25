import "../products/hangly/hangly.css";
import { SectionFooter } from "@/components/SectionFooter";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";

/** The charm pages borrow Hangly's visual language; they are about its charms. */
export default function CharmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hangly-container w-full min-h-screen">
      {children}
      <SectionFooter />
    </div>
  );
}
