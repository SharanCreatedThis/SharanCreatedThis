import { ALL_FAQS } from '@/data/hangly-faq';
import { absoluteUrl } from '@/lib/seo';

/**
 * FAQPage schema for the Hangly page.
 *
 * Four of the seventeen competitors crawled ship this — Desk Dangle, Book My
 * Luck, OpenPets and its Oneko alternatives page — and Hangly shipped none.
 * It is the single clearest structured-data gap in the category, and the one
 * that matters most for an answer engine, which needs a question and an answer
 * it can lift rather than prose it has to summarise.
 *
 * Every question here is rendered on the page by Faq.tsx. That is not
 * optional: schema without a visible counterpart earns a manual action.
 */
export default function FaqJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': `${absoluteUrl('/products/hangly')}#faq`,
          mainEntity: ALL_FAQS.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }).replace(/</g, '\\u003c'),
      }}
    />
  );
}
