import "../products/hangly/hangly.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";

/** The comparison pages borrow Hangly's visual language, since that is the
 *  product they are about and a visitor arrives here mid-decision. */
export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <div className="hangly-container w-full min-h-screen">{children}</div>;
}
