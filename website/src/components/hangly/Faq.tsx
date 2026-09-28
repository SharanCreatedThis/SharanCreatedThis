import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Label } from './shared';
const questions = [
  ['Is Hangly free?', 'Yes. Hangly is free to download for macOS and Windows.'],
  ['Does it work on Windows?', 'Yes. Hangly supports Windows x64 and Windows ARM64.'],
  ['Does it affect performance?', 'It is built as a lightweight native desktop companion that stays out of your way.'],
];
export default function Faq() { return <section id="faq" className="hangly-faq section wrap" aria-labelledby="faq-title"><div className="center-heading"><Label>THE SHORT ANSWERS.</Label><h2 id="faq-title">Good questions,<br/><span className="muted-heading">clear answers.</span></h2></div><div className="faq-short-list">{questions.map(([q,a])=><article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div><div className="faq-teaser-cta"><Link className="button button-quiet" href="/faq">Read the full FAQ <ArrowUpRight size={17}/></Link></div></section> }
