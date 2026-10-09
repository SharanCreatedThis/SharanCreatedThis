import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Label } from './shared';
const questions: [string, React.ReactNode][] = [
  ['Is Hangly free?', 'Yes. Hangly is free on macOS and Windows, with no paid tier and no trial. A coffee for the creator is always optional.'],
  ['Which computers does it run on?', 'Macs on macOS 14 or later, Apple Silicon and Intel. Windows 10 (version 1809 or later, with its updates installed) on Intel and AMD PCs, Windows 11, and Windows 11 on ARM, with a native ARM64 build.'],
  ['What does Hangly send?', <>A record of your installation — a random ID, the nickname you choose, your city (worked out from your connection, which is not stored), your versions and when Hangly was used — plus a few anonymous usage events and crash reports. Nothing about your screen, files or the images you turn into charms. <Link href="/products/hangly/privacy">Privacy details</Link>.</>],
  ['Does it affect performance?', 'Hangly draws a single transparent window, just big enough for the charm to swing in, and clicks pass straight through it to your desktop.'],
  ['How do I get help or report a bug?', <>Write to Sharan from the <Link href="/contact">contact page</Link>, or open an issue on <a href="https://github.com/SharanCreatedThis/Hangly-Windows/issues" target="_blank" rel="noopener noreferrer">GitHub</a> for the Windows app. Installing and removing Hangly are covered in the <Link href="/install">install guide</Link>.</>],
];
export default function Faq() { return <section id="faq" className="hangly-faq section wrap" aria-labelledby="faq-title"><div className="center-heading"><Label>THE SHORT ANSWERS.</Label><h2 id="faq-title">Good questions,<br/><span className="muted-heading">clear answers.</span></h2></div><div className="faq-short-list">{questions.map(([q,a])=><article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div><div className="faq-teaser-cta"><Link className="button button-quiet" href="/faq">Read the full FAQ <ArrowUpRight size={17}/></Link></div></section> }
