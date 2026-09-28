import { Label, Reveal } from './shared';

const reasons = [
  ['01', 'Make your desktop feel yours', 'Choose a lucky charm, favourite character, meaningful symbol, or make something entirely your own.'],
  ['02', 'Motion that feels alive', 'Real rope physics with weight, momentum, and a response when you reach out and nudge it.'],
  ['03', 'Small details matter', 'A quiet desktop companion that slowly becomes part of the workspace you spend your day in.'],
];

export default function WhyHangly() {
  return <section id="features" className="why-hangly section wrap" aria-labelledby="why-hangly-title">
    <Reveal className="why-hangly-intro"><Label>THE DESKTOP, MADE PERSONAL.</Label><h2 id="why-hangly-title">Why Hangly<span className="orange">?</span></h2></Reveal>
    <div className="why-hangly-list">{reasons.map(([number, title, copy]) => <Reveal className="why-hangly-item" key={number}>
      <span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div>
    </Reveal>)}</div>
  </section>;
}
