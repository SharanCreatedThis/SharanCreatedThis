'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_GROUPS } from '@/data/hangly-faq';
import { Label, Reveal } from './shared';

/**
 * The FAQ, rendered so every answer is readable.
 *
 * The schema for these lives beside them on the page component. Google will
 * not show an FAQ rich result for questions a visitor cannot read, and marking
 * up hidden answers is a guidelines violation rather than a shortcut — so the
 * answers are in the DOM whether or not their section is expanded, and the
 * toggle only changes height.
 */
export default function Faq() {
  const [open, setOpen] = useState<string | null>('basics-0');
  return (
    <section id="faq" className="hangly-faq section wrap" aria-labelledby="faq-title">
      <Reveal className="center-heading">
        <Label>EVERYTHING WORTH ASKING.</Label>
        <h2 id="faq-title">Good questions,<br /><span className="muted-heading">honest answers.</span></h2>
      </Reveal>
      {FAQ_GROUPS.map(group => (
        <div className="faq-group" key={group.id}>
          <h3 className="faq-group-heading">{group.heading}</h3>
          <div className="faq-list">
            {group.faqs.map((faq, i) => {
              const id = `${group.id}-${i}`;
              const isOpen = open === id;
              return (
                <div className={`faq-row ${isOpen ? 'is-open' : ''}`} key={id}>
                  <h4>
                    <button type="button" aria-expanded={isOpen} aria-controls={`a-${id}`}
                      onClick={() => setOpen(isOpen ? null : id)}>
                      {faq.q}<ChevronDown size={18} />
                    </button>
                  </h4>
                  <div id={`a-${id}`} className="faq-answer" role="region"><p>{faq.a}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
