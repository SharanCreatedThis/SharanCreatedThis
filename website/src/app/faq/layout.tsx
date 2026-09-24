import "../products/hangly/hangly.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <div className="hangly-container w-full min-h-screen">{children}</div>;
}
