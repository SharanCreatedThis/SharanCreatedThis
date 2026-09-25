import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { FAQ_GROUPS, ALL_FAQS } from '@/data/hangly-faq';
import { Label } from './shared';

/**
 * A signpost to the FAQ, not a second copy of it.
 *
 * This component used to render all fifty questions and answers, and /faq
 * rendered the same fifty. Measured, the two pages shared 110 sentences and
 * each emitted a FAQPage block containing the same questions — duplicate
 * content, duplicated structured data, and two of our own URLs competing for
 * every FAQ query. /faq exists to own those queries and was losing them to
 * the stronger product URL.
 *
 * So /faq is now canonical for every question, and this section links into it
 * by section. It deliberately does not restate a single question: a question
 * string repeated here would cannibalise the page it points at, which is the
 * problem this was written to solve rather than a smaller version of it.
 *
 * No FAQPage schema here either. There is exactly one on the site for these
 * questions, and it lives on /faq.
 */
export default function Faq() {
  return (
    <section id="faq" className="hangly-faq section wrap" aria-labelledby="faq-title">
      <div className="center-heading">
        <Label>EVERYTHING WORTH ASKING.</Label>
        <h2 id="faq-title">Good questions,<br /><span className="muted-heading">honest answers.</span></h2>
        <p className="faq-teaser-lead">
          {ALL_FAQS.length} answers about Hangly — what it costs, how it behaves, what it sends,
          and what to do when something looks wrong. All of them live in one place.
        </p>
      </div>

      <ul className="faq-teaser-groups">
        {FAQ_GROUPS.map(group => (
          <li key={group.id}>
            <Link href={`/faq#${group.id}`}>
              <strong>{group.heading} <ArrowUpRight size={15} /></strong>
              <span>{group.faqs.length} questions</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="faq-teaser-cta">
        <Link className="button button-quiet" href="/faq">
          Read the full FAQ <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
