import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/seo';
import { HANGLY_MAC, HANGLY_ROPES, HANGLY_WINDOWS } from '@/lib/hangly-product';

const pages = {
  mac: { title: 'Hangly for macOS', description: `Hangly for macOS: ${HANGLY_MAC.charms} charms, ${HANGLY_MAC.ropeStyles} rope styles, Creator Studio, sound, and multi-monitor support.`, eyebrow: 'MACOS 14+', heading: 'A more personal Mac desktop.', facts: [ `${HANGLY_MAC.charms} charms`, ...HANGLY_MAC.features ] },
  windows: { title: 'Hangly for Windows', description: `Hangly for Windows x64 and ARM64: ${HANGLY_WINDOWS.charms} charms, ${HANGLY_WINDOWS.ropeStyles} rope styles, silent updates, and multi-monitor support.`, eyebrow: 'WINDOWS X64 + ARM64', heading: 'Hangly, made for Windows.', facts: [ `${HANGLY_WINDOWS.charms} charms`, ...HANGLY_WINDOWS.features, ...HANGLY_WINDOWS.architectures ] },
  'windows-arm64': { title: 'Hangly for Windows ARM64', description: 'Download Hangly for Windows ARM64. A native desktop charm companion with real-time rope physics.', eyebrow: 'WINDOWS ARM64', heading: 'Native Hangly for ARM Windows.', facts: [ 'Windows ARM64', `${HANGLY_WINDOWS.charms} charms`, ...HANGLY_WINDOWS.features ] },
  create: { title: 'Create a Custom Charm with Hangly', description: 'Turn photos, art, logos, and memories into a custom hanging desktop charm with Hangly Creator Studio.', eyebrow: 'CREATOR STUDIO', heading: 'Create a charm that means something.', facts: [ 'Upload an image', 'Remove the background', 'Choose a rope', 'Hang it on your desktop' ] },
  collections: { title: 'Hangly Charm Collections', description: `Explore Hangly's curated digital charm collections for macOS and Windows, including ${HANGLY_MAC.charms} Mac charms and ${HANGLY_WINDOWS.charms} Windows charms.`, eyebrow: 'COLLECTIBLE DESKTOP CHARMS', heading: 'Find the charm that feels like you.', facts: [ 'Protection', 'Pop culture', 'Music', 'Sports', 'Spirituality', 'Custom creations' ] },
  'rope-styles': { title: 'Hangly Rope Styles', description: `Explore ${HANGLY_ROPES.length} rope styles for Hangly, from Thread and Leather to Neon and Silver Cord.`, eyebrow: 'ROPE STUDIO', heading: 'Nine ways to hang on.', facts: HANGLY_ROPES.map(rope => `${rope.name} — ${rope.material}`) },
  accessibility: { title: 'Hangly Accessibility', description: 'Hangly accessibility controls for motion and desktop interaction on macOS and Windows.', eyebrow: 'ACCESSIBILITY', heading: 'A more comfortable desktop companion.', facts: [ 'Motion-conscious interaction', 'Keyboard-accessible controls', 'Native platform settings', 'Multi-monitor support' ] },
  'multi-monitor': { title: 'Hangly Multi-monitor Support', description: 'Hangly supports multi-monitor desktop setups on macOS and Windows.', eyebrow: 'MULTI-MONITOR SUPPORT', heading: 'A charm where you want it.', facts: [ 'macOS support', 'Windows support', 'Choose your display', 'Built for real desktop setups' ] },
} as const;
type Feature = keyof typeof pages;
export function generateStaticParams() { return Object.keys(pages).map(feature => ({ feature })); }
export async function generateMetadata({ params }: { params: Promise<{ feature: string }> }): Promise<Metadata> { const { feature } = await params; const page = pages[feature as Feature]; return page ? { title: page.title, description: page.description, alternates: { canonical: `/products/hangly/${feature}` }, openGraph: { title: page.title, description: page.description, url: absoluteUrl(`/products/hangly/${feature}`), images: [absoluteUrl('/og/hangly.png')] } } : {}; }
export default async function HanglyFeature({ params }: { params: Promise<{ feature: string }> }) {
  const { feature } = await params;
  const page = pages[feature as Feature];
  if (!page) notFound();
  const path = `/products/hangly/${feature}`;
  const howTo = feature === 'create' ? { '@context': 'https://schema.org', '@type': 'HowTo', name: 'Create a custom charm in Hangly', step: page.facts.map((name, position) => ({ '@type': 'HowToStep', position: position + 1, name })) } : null;
  return <main className="hangly-feature wrap"><BreadcrumbJsonLd trail={[{ name:'Home',path:'/' },{name:'Products',path:'/products'},{name:'Hangly',path:'/products/hangly'},{name:page.title,path}]} />{howTo && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(howTo)}} />}<a href="/products/hangly" className="feature-back">← Hangly</a><p className="eyebrow">{page.eyebrow}</p><h1>{page.heading}<span className="orange">.</span></h1><p className="feature-lead">{page.description}</p><p className="feature-context">Hangly is a free, native desktop companion built around real-time rope physics. It keeps the practical details clear so you can decide whether it belongs on your own setup.</p><ul>{page.facts.map(fact=><li key={fact}>{fact}</li>)}</ul><a className="button button-primary" href="/products/hangly#download">Download Hangly</a></main>;
}
