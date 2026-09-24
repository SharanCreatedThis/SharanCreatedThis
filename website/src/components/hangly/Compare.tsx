import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { COMPARISONS, type Comparison } from '@/lib/comparisons/comparison-data';
import { Label, Reveal } from './shared';

/**
 * Links from the product page to every comparison page.
 *
 * Without this the comparison pages are reachable only from the sitemap and
 * from each other, which is the shape /products/vision/docs was in when Google
 * reported it "Discovered - currently not indexed" after never fetching it. A
 * sitemap announces a URL; internal links from an indexed page are what argue
 * it is worth crawling.
 *
 * It is also honest merchandising: someone on this page is deciding between
 * Hangly and something else, and saying so openly is better than hoping they
 * do not look.
 */
export default function Compare() {
  return (
    <section id="compare" className="hangly-compare section wrap" aria-labelledby="compare-title">
      <Reveal className="center-heading">
        <Label>STILL DECIDING?</Label>
        <h2 id="compare-title">How Hangly compares<span className="orange">.</span></h2>
        <p>Honest comparisons, including where the other one wins.</p>
      </Reveal>
      <ul className="compare-grid">
        {COMPARISONS.map((c: Comparison) => (
          <li key={c.slug}>
            <Link href={`/compare/${c.slug}`}>
              <span>Hangly vs {c.name}</span>
              <ArrowUpRight size={15} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
