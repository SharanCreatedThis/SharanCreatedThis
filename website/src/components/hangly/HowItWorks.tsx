'use client';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Charm, Label, Reveal } from './shared';
const steps = [
 {name:'Choose',text:'Find a charm that feels like you.',detail:'A lucky eye, a familiar hero, or something that reminds you of home.',charm:'spiderMan'},
 {name:'Customize',text:'Pick your rope, size, and arrangement.',detail:'A golden thread. A silver chain. A charm as small or bold as you like.',charm:'nazar'},
 {name:'Hang',text:'Let a little delight into your day.',detail:'Drag it, give it a nudge, and let real physics take it from there.',charm:'daruma'},
];
export default function HowItWorks(){
 const [active,setActive]=useState(0);const reduced=useReducedMotion();
 return <section className="how section wrap"><Reveal className="how-heading"><Label>THREE STEPS TO A HAPPIER DESKTOP.</Label><h2>Make yourself<br/>a little more at home.</h2></Reveal><div><div className="steps">{steps.map((step,i)=><Reveal className="step" key={step.name}><button className="step-select" aria-expanded={active===i} aria-controls="step-description" onClick={()=>setActive(i)}><span className="step-number">0{i+1}</span><h3>{step.name}</h3><p>{step.text}</p></button></Reveal>)}</div><div id="step-description" className="step-description" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.div key={active} initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.3}}><Charm name={steps[active].charm}/><p>{steps[active].detail}</p><a href={active===0?'#collections':'#demo'}>{active===0?'Explore charms':'Try it yourself'} ↗</a></motion.div></AnimatePresence></div></div></section>
}
