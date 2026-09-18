import { ArrowUpRight } from "lucide-react";
import { Label } from "@/components/hub/Experience";
import { profile } from "@/data/portfolio";
export const metadata = { title: "Let’s Talk · Sharan Created This" };
export default function Contact() {
  const links = [
    { label: "Email", href: profile.email ? `mailto:${profile.email}` : "" },
    { label: "Instagram", href: profile.instagram },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "Behance", href: profile.behance },
  ];
  return (
    <section className="page-intro section contact-page">
      <Label>GOOD THINGS START WITH A CONVERSATION</Label>
      <h1>
        Let’s build
        <br />
        something worth
        <br />
        <span className="red">remembering.</span>
      </h1>
      <div className="contact-layout">
        <div>
          <p>
            A story to tell? A product to build?
            <br />
            An idea you can’t stop thinking about?
          </p>
          <p>Tell me about it.</p>
          <a className="button button-red" href={`mailto:${profile.email}`}>
            Start a conversation <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="contact-links">
          {links.map((l, i) =>
            l.href ? (
              <a
                key={l.label}
                href={l.href}
                target={l.label === "Email" ? undefined : "_blank"}
                rel="noreferrer"
              >
                <span>0{i + 1}</span>
                <h2>{l.label}</h2>
                <ArrowUpRight />
              </a>
            ) : (
              <div key={l.label} className="pending-contact">
                <span>0{i + 1}</span>
                <h2>{l.label}</h2>
                <small>Coming soon</small>
              </div>
            ),
          )}
        </div>
      </div>
      <div className="contact-signoff">
        MADE OF CURIOSITY. <span>BASED IN INDIA. CREATING EVERYWHERE.</span>
      </div>
    </section>
  );
}
