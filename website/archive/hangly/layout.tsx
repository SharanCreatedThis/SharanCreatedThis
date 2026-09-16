import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import './globals.css';
export const metadata: Metadata = { title: 'Hangly — A little magic for your desktop', description: 'Beautiful digital charms. Real swinging physics. Make your Mac feel a little more you. Free for macOS 14 and later.', metadataBase: new URL('https://hangly-desktop-charms.vivid-mite-6271.chatgpt.site') };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
