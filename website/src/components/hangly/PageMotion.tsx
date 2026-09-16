'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

/** Adds scroll feedback without intercepting the browser's native scrolling. */
export default function PageMotion() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const sections = document.querySelectorAll('main section');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('section-entered');
      });
    }, { threshold: 0.12 });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return <motion.div className="reading-progress" style={{ scaleX: reduced ? scrollYProgress : progress }} aria-hidden="true" />;
}
