import {
  Hero,
  Worlds,
  Numbers,
  Journey,
  Work,
  ProductShowcase,
  ContactCTA,
} from "@/components/hub/Experience";

export const metadata = {
  title: "Sharan Created This — Creative Technologist",
  description:
    "Films, experiences, and software. Filmmaker, photographer, designer, and product builder.",
};
export default function Home() {
  return (
    <div className="home-editorial">
      <Hero />
      <section className="home-introduction" aria-label="Creative philosophy">
        <span className="home-intro-mark" aria-hidden="true">
          ✳
        </span>
        <p>
          One person.
          <br />
          <span>A whole world of possibilities.</span>
        </p>
        <div>
          From the first frame to the final line of code.
          <br />I make things that move people.
        </div>
      </section>
      <Worlds />
      <Numbers />
      <Journey />
      <Work />
      <ProductShowcase />
      <ContactCTA />
    </div>
  );
}
