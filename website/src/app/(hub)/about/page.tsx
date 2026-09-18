import {
  Label,
  Reveal,
  Journey,
  Numbers,
  ContactCTA,
} from "@/components/hub/Experience";
export const metadata = { title: "The Story — Sharan Created This" };
export default function About() {
  return (
    <>
      <section className="page-intro section about-intro">
        <div>
          <Label>THE PERSON BEHIND THE PIXELS</Label>
          <h1>
            I’m Sharan.
            <br />I make
            <br />
            <span className="red">things happen.</span>
          </h1>
          <p>
            A filmmaker’s eye. A designer’s instinct.
            <br />A builder’s curiosity.
          </p>
        </div>
        <figure className="about-portrait">
          <div className="about-portrait-image">
            <img
              src="/portfolio/sharan-about.png"
              alt="Portrait of Sharan"
            />
          </div>
          <figcaption>
            <span>
              Sharan<span className="portrait-role">Creator &amp; builder</span>
            </span>
            <span className="portrait-signature" aria-hidden="true">
              ✳
            </span>
          </figcaption>
        </figure>
      </section>
      <section className="section about-story">
        <Label>01 / WHO I AM</Label>
        <Reveal>
          <h2>
            I don’t think in job titles.
            <br />I think in <span className="red">possibilities.</span>
          </h2>
          <p>
            Filmmaking, photography, creative direction, design, branding, and
            software. Different tools for the same impulse: to bring an idea
            into the world.
          </p>
        </Reveal>
      </section>
      <section className="section about-story">
        <Label>02 / WHY I CREATE</Label>
        <Reveal>
          <h2>
            Some stories need a camera.
            <br />
            <span className="muted">Others need code.</span>
          </h2>
          <p>
            What matters is finding the right form. A documentary that makes you
            pause. A visual identity that feels right. A tiny Mac companion that
            makes an ordinary day a little more playful.
          </p>
        </Reveal>
      </section>
      <Journey />
      <Numbers />
      <section className="section philosophy">
        <Label>04 / CREATIVE PHILOSOPHY</Label>
        {[
          "Start with curiosity.",
          "Make it feel human.",
          "Care about the details.",
          "Keep becoming.",
        ].map((s, i) => (
          <Reveal key={s}>
            <span>0{i + 1}</span>
            <h2>{s}</h2>
            <span className="red">+</span>
          </Reveal>
        ))}
      </section>
      <section className="section about-story">
        <Label>05 / WHAT COMES NEXT</Label>
        <Reveal>
          <h2>
            An entire creative universe.
            <br />
            <span className="muted">One idea at a time.</span>
          </h2>
          <p>
            More stories. More experiments. More software. Hangly and Vision are
            part of a growing practice that moves freely between creating and
            building.
          </p>
        </Reveal>
      </section>
      <ContactCTA />
    </>
  );
}
