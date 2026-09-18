import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./hub.css";
import "./home-editorial.css";
import "./opening.css";
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hub editorial-theme" id="top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
